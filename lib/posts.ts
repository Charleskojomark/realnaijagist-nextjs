import prisma from './db'
import { PostStatus } from '@prisma/client'

export async function getPublishedPosts(page = 1, pageSize = 12, categorySlug?: string) {
  try {
    const skip = (page - 1) * pageSize
    const where = {
      status: PostStatus.PUBLISHED,
      ...(categorySlug && { category: { slug: categorySlug } }),
    }
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          cdnImageUrl: true,
          featuredImage: true,
          imageAltText: true,
          views: true,
          likes: true,
          publishedAt: true,
          createdAt: true,
          isVideoPost: true,
          videoEmbedUrl: true,
          category: { select: { name: true, slug: true } },
          author: { select: { username: true } },
          tags: { select: { tag: { select: { name: true, slug: true } } } },
        },
      }),
      prisma.post.count({ where }),
    ])
    return { posts, total, totalPages: Math.ceil(total / pageSize) }
  } catch (e) {
    console.warn('getPublishedPosts fallback:', e)
    return { posts: [], total: 0, totalPages: 0 }
  }
}

export async function getPostBySlug(slug: string) {
  try {
    return await prisma.post.findUnique({
      where: { slug, status: PostStatus.PUBLISHED },
      include: {
        category: true,
        author: { select: { username: true } },
        tags: { include: { tag: true } },
        comments: {
          where: { isApproved: true },
          orderBy: { createdAt: 'desc' },
          include: { author: { select: { username: true } } },
        },
      },
    })
  } catch (e) {
    console.warn('getPostBySlug fallback:', e)
    return null
  }
}

export async function getRelatedPosts(categoryId: number, excludeId: number, limit = 4) {
  try {
    return await prisma.post.findMany({
      where: { status: PostStatus.PUBLISHED, categoryId, id: { not: excludeId } },
      orderBy: { views: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        cdnImageUrl: true,
        featuredImage: true,
        imageAltText: true,
        createdAt: true,
        category: { select: { name: true, slug: true } },
      },
    })
  } catch (e) {
    return []
  }
}

export async function getTrendingPosts(limit = 5) {
  try {
    return await prisma.post.findMany({
      where: { status: PostStatus.PUBLISHED, isTrending: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        cdnImageUrl: true,
        featuredImage: true,
        views: true,
        createdAt: true,
        category: { select: { name: true, slug: true } },
      },
    })
  } catch (e) {
    return []
  }
}

export async function getPopularPosts(limit = 5) {
  try {
    return await prisma.post.findMany({
      where: { status: PostStatus.PUBLISHED },
      orderBy: { views: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        cdnImageUrl: true,
        featuredImage: true,
        views: true,
        createdAt: true,
        category: { select: { name: true, slug: true } },
      },
    })
  } catch (e) {
    return []
  }
}

export async function searchPosts(query: string, page = 1, pageSize = 12) {
  try {
    const skip = (page - 1) * pageSize
    const where = {
      status: PostStatus.PUBLISHED,
      OR: [
        { title: { contains: query, mode: 'insensitive' as const } },
        { excerpt: { contains: query, mode: 'insensitive' as const } },
        { content: { contains: query, mode: 'insensitive' as const } },
      ],
    }
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          cdnImageUrl: true,
          featuredImage: true,
          createdAt: true,
          category: { select: { name: true, slug: true } },
        },
      }),
      prisma.post.count({ where }),
    ])
    return { posts, total, totalPages: Math.ceil(total / pageSize) }
  } catch (e) {
    return { posts: [], total: 0, totalPages: 0 }
  }
}

export async function getActiveCarouselSlides(limit = 5) {
  try {
    return await prisma.carouselSlide.findMany({
      where: {
        isActive: true,
        OR: [{ featuredUntil: null }, { featuredUntil: { gt: new Date() } }],
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      take: limit,
      include: { post: { select: { slug: true } } },
    })
  } catch (e) {
    return []
  }
}

export async function getAllCategories() {
  try {
    return await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { posts: { where: { status: PostStatus.PUBLISHED } } } } },
    })
  } catch (e) {
    return []
  }
}

export async function getAllPublishedSlugs() {
  try {
    return await prisma.post.findMany({
      where: { status: PostStatus.PUBLISHED },
      select: { slug: true, updatedAt: true },
    })
  } catch (e) {
    return []
  }
}
