export const dynamic = 'force-dynamic'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import prisma from '@/lib/db'
import { PostStatus } from '@prisma/client'
import PostCard from '@/components/PostCard'
import SidebarWidgets from '@/components/SidebarWidgets'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const tag = await prisma.tag.findUnique({ where: { slug } })
  if (!tag) return { title: 'Tag Not Found | RealNaijaGist' }

  return {
    title: `#${tag.name} Stories & Trending News | RealNaijaGist`,
    description: `Read all articles tagged with #${tag.name} on RealNaijaGist.`,
  }
}

export default async function TagPage({ params }: PageProps) {
  const { slug } = await params
  const tag = await prisma.tag.findUnique({ where: { slug } })
  if (!tag) notFound()

  const postTags = await prisma.postTag.findMany({
    where: {
      tagId: tag.id,
      post: { status: PostStatus.PUBLISHED },
    },
    include: {
      post: {
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
          createdAt: true,
          category: { select: { name: true, slug: true } },
          author: { select: { username: true } },
        },
      },
    },
    orderBy: { post: { createdAt: 'desc' } },
    take: 24,
  })

  const posts = postTags.map((pt) => pt.post)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <header className="mb-8 border-b border-slate-800 pb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Tag Topic</span>
        <h1 className="text-3xl sm:text-4xl font-black text-white mt-1">#{tag.name}</h1>
        <p className="text-xs text-slate-400 mt-2">{posts.length} articles tagged under this topic</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <main className="lg:col-span-8">
          {posts.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
              No articles found for this tag.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </main>
        <div className="lg:col-span-4">
          <SidebarWidgets />
        </div>
      </div>
    </div>
  )
}
