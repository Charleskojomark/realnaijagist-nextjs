import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getSession } from '@/lib/auth'
import { PostStatus } from '@prisma/client'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || !session.isStaff) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const postId = parseInt(id, 10)

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || !session.isStaff) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const postId = parseInt(id, 10)

    const body = await req.json()
    const {
      title,
      slug,
      content,
      excerpt,
      categoryId,
      featuredImage,
      status,
      isFeatured,
      isTrending,
    } = body

    const existingPost = await prisma.post.findUnique({ where: { id: postId } })
    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (slug !== undefined) updateData.slug = slug
    if (content !== undefined) updateData.content = content
    if (excerpt !== undefined) updateData.excerpt = excerpt
    if (categoryId !== undefined) updateData.categoryId = Number(categoryId)
    if (featuredImage !== undefined) updateData.featuredImage = featuredImage
    if (status !== undefined) {
      updateData.status = status as PostStatus
      if (status === 'PUBLISHED' && !existingPost.publishedAt) {
        updateData.publishedAt = new Date()
      }
    }
    if (isFeatured !== undefined) updateData.isFeatured = Boolean(isFeatured)
    if (isTrending !== undefined) updateData.isTrending = Boolean(isTrending)

    const updated = await prisma.post.update({
      where: { id: postId },
      data: updateData,
    })

    return NextResponse.json({ success: true, post: updated })
  } catch (error) {
    console.error('Error updating post:', error)
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || !session.isStaff) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const postId = parseInt(id, 10)

    await prisma.post.delete({
      where: { id: postId },
    })

    return NextResponse.json({ success: true, message: 'Post deleted successfully' })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  }
}
