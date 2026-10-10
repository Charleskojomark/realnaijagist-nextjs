import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getSession } from '@/lib/auth'
import { PostStatus } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !session.isStaff) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(50, Math.max(10, parseInt(searchParams.get('limit') || '20', 10)))
    const search = searchParams.get('search')?.trim() || ''
    const statusParam = searchParams.get('status')
    const categoryId = searchParams.get('categoryId') ? parseInt(searchParams.get('categoryId')!, 10) : undefined

    const where: any = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (statusParam && Object.values(PostStatus).includes(statusParam as PostStatus)) {
      where.status = statusParam as PostStatus
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    const [total, posts] = await Promise.all([
      prisma.post.count({ where }),
      prisma.post.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          views: true,
          createdAt: true,
          publishedAt: true,
          featuredImage: true,
          isVideoPost: true,
          videoEmbedUrl: true,
          category: {
            select: { id: true, name: true, slug: true },
          },
          author: {
            select: { id: true, username: true, firstName: true, lastName: true },
          },
        },
      }),
    ])

    return NextResponse.json({
      posts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
    })
  } catch (error) {
    console.error('Error fetching admin posts:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !session.isStaff) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      title,
      slug: userSlug,
      content,
      excerpt,
      categoryId,
      featuredImage,
      status = 'PUBLISHED',
      isFeatured = false,
      isTrending = false,
      isVideoPost = false,
      videoEmbedUrl,
    } = body

    if (!title || !content || !categoryId) {
      return NextResponse.json(
        { error: 'Title, content, and category are required' },
        { status: 400 }
      )
    }

    // Validate categoryId is a valid number
    const parsedCategoryId = Number(categoryId)
    if (isNaN(parsedCategoryId) || parsedCategoryId <= 0) {
      return NextResponse.json(
        { error: 'Invalid category selected. Please select a valid category.' },
        { status: 400 }
      )
    }

    // Verify the category exists
    const categoryExists = await prisma.category.findUnique({
      where: { id: parsedCategoryId },
    })
    if (!categoryExists) {
      return NextResponse.json(
        { error: `Category with ID ${parsedCategoryId} not found` },
        { status: 400 }
      )
    }

    // Verify the author (session user) exists in the database
    const authorExists = await prisma.user.findUnique({
      where: { id: session.id },
    })
    if (!authorExists) {
      return NextResponse.json(
        { error: `Your user account (ID: ${session.id}) was not found. Please log out and log in again.` },
        { status: 400 }
      )
    }

    // Helper to format YouTube embed URLs if user inputs a standard watch URL
    let formattedVideoUrl = videoEmbedUrl?.trim() || null
    if (formattedVideoUrl) {
      if (formattedVideoUrl.includes('youtube.com/watch?v=')) {
        const videoId = formattedVideoUrl.split('v=')[1]?.split('&')[0]
        if (videoId) formattedVideoUrl = `https://www.youtube.com/embed/${videoId}`
      } else if (formattedVideoUrl.includes('youtu.be/')) {
        const videoId = formattedVideoUrl.split('youtu.be/')[1]?.split('?')[0]
        if (videoId) formattedVideoUrl = `https://www.youtube.com/embed/${videoId}`
      }
    }

    // Generate or format slug
    let baseSlug = (userSlug || title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 150)

    if (!baseSlug) baseSlug = 'article'

    let slug = baseSlug
    let counter = 1
    while (await prisma.post.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || content.substring(0, 200).replace(/<[^>]*>?/gm, ''),
        categoryId: parsedCategoryId,
        authorId: session.id,
        featuredImage: featuredImage || null,
        status: status as PostStatus,
        isFeatured: Boolean(isFeatured),
        isTrending: Boolean(isTrending),
        isVideoPost: Boolean(isVideoPost) || Boolean(formattedVideoUrl),
        videoEmbedUrl: formattedVideoUrl,
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
      },
    })

    return NextResponse.json({ success: true, post })
  } catch (error: any) {
    console.error('Error creating post:', error)
    // Surface the actual error message for debugging
    const message = error?.message || 'Unknown error'
    const code = error?.code || ''
    return NextResponse.json(
      { error: `Failed to create post: ${message}${code ? ` (Code: ${code})` : ''}` },
      { status: 500 }
    )
  }
}

