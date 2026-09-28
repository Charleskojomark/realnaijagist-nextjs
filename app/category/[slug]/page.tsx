export const dynamic = 'force-dynamic'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import prisma from '@/lib/db'
import { getPublishedPosts } from '@/lib/posts'
import PostCard from '@/components/PostCard'
import SidebarWidgets from '@/components/SidebarWidgets'
import Pagination from '@/components/Pagination'
import AdUnit from '@/components/AdUnit'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const category = await prisma.category.findUnique({ where: { slug } })
  if (!category) return { title: 'Category Not Found | RealNaijaGist' }

  return {
    title: `${category.name} News & Updates | RealNaijaGist`,
    description: category.description || `Read the latest ${category.name} news, verified stories, and updates on RealNaijaGist.`,
  }
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { page: pageStr } = await searchParams
  const currentPage = parseInt(pageStr || '1', 10)

  const category = await prisma.category.findUnique({ where: { slug } })
  if (!category) notFound()

  const { posts, total, totalPages } = await getPublishedPosts(currentPage, 12, slug)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <header className="mb-8 border-b border-slate-800 pb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
          Category Archive
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-white mt-1">
          {category.name}
        </h1>
        {category.description && (
          <p className="text-sm text-slate-400 mt-2 max-w-2xl">{category.description}</p>
        )}
      </header>

      <AdUnit slot="category-header" format="horizontal" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-6">
        <main className="lg:col-span-8">
          {posts.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
              No published articles found in this category yet. Check back shortly!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}

          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            basePath={`/category/${slug}`}
          />
        </main>

        <div className="lg:col-span-4">
          <SidebarWidgets />
        </div>
      </div>
    </div>
  )
}