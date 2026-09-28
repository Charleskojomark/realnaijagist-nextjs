import Link from 'next/link'
import type { Metadata } from 'next'
import { searchPosts } from '@/lib/posts'
import PostCard from '@/components/PostCard'
import SidebarWidgets from '@/components/SidebarWidgets'
import Pagination from '@/components/Pagination'

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { q } = await searchParams
  return {
    title: q ? `Search results for "${q}" | RealNaijaGist` : 'Search Articles | RealNaijaGist',
  }
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q = '', page: pageStr } = await searchParams
  const currentPage = parseInt(pageStr || '1', 10)
  const query = q.trim()

  const { posts, total, totalPages } = query
    ? await searchPosts(query, currentPage, 12)
    : { posts: [], total: 0, totalPages: 0 }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <header className="mb-8 border-b border-slate-800 pb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          {query ? `Search Results for "${query}"` : 'Search RealNaijaGist'}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {query ? `Found ${total} articles matching your search.` : 'Enter keywords to find breaking stories.'}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <main className="lg:col-span-8">
          {posts.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400 space-y-3">
              <p>No articles matched your search query.</p>
              <Link href="/" className="inline-block text-xs text-emerald-400 hover:underline">
                &larr; Back to Homepage
              </Link>
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
            basePath="/search"
          />
        </main>

        <div className="lg:col-span-4">
          <SidebarWidgets />
        </div>
      </div>
    </div>
  )
}