'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'

interface PostItem {
  id: number
  title: string
  slug: string
  status: string
  views: number
  createdAt: string
  featuredImage?: string | null
  isVideoPost?: boolean
  category: { id: number; name: string }
  author: { id: number; username: string }
}

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<PostItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      params.set('limit', '20')
      if (search) params.set('search', search)
      if (status) params.set('status', status)

      const res = await fetch(`/api/admin/posts?${params.toString()}`)
      const data = await res.json()
      if (res.ok) {
        setPosts(data.posts)
        setTotalPages(data.totalPages)
        setTotal(data.total)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [page, status])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchPosts()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      return
    }
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/posts/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== id))
        setTotal((prev) => prev - 1)
      } else {
        alert('Failed to delete article')
      }
    } catch (err) {
      console.error(err)
      alert('Error deleting article')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-5 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">All Articles</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage {total.toLocaleString()} stories across RealNaijaGist
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="w-full sm:w-auto text-center px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5"
        >
          <span>+</span>
          <span>Write New Article</span>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-2xl flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between shadow-md">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1">
          <input
            type="text"
            placeholder="Search headline or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition"
          >
            Search
          </button>
        </form>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value)
            setPage(1)
          }}
          className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      {/* Content Display: Mobile Card View + Desktop Table View */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm">Loading articles...</div>
        ) : posts.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-sm">No articles found matching criteria.</div>
        ) : (
          <>
            {/* Mobile Cards (visible only on small screens) */}
            <div className="sm:hidden divide-y divide-slate-800">
              {posts.map((post) => (
                <div key={post.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={`/admin/posts/${post.id}`}
                      className="font-bold text-white text-sm hover:text-emerald-400 line-clamp-2 leading-snug"
                    >
                      {post.title}
                    </Link>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                        post.status === 'PUBLISHED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {post.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                      {post.category?.name || 'News'}
                    </span>
                    <span>•</span>
                    <span>{post.views.toLocaleString()} views</span>
                    <span>•</span>
                    <span>{format(new Date(post.createdAt), 'MMM d, yyyy')}</span>
                    {post.isVideoPost && (
                      <span className="text-purple-400 font-bold">🎬 Video</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Link
                      href={`/admin/posts/${post.id}`}
                      className="flex-1 text-center py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition"
                    >
                      Edit
                    </Link>
                    <a
                      href={`/post/${post.slug}`}
                      target="_blank"
                      className="flex-1 text-center py-2 text-xs font-bold bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20 hover:bg-emerald-500/20 transition"
                    >
                      View ↗
                    </a>
                    <button
                      onClick={() => handleDelete(post.id)}
                      disabled={deletingId === post.id}
                      className="py-2 px-3 text-xs font-bold bg-red-500/10 text-red-400 rounded-lg border border-red-500/20 hover:bg-red-500/20 transition disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table (hidden on mobile, visible on sm+) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950/60 text-slate-400 uppercase text-xs border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-6">Title</th>
                    <th className="py-3.5 px-6">Category</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6">Views</th>
                    <th className="py-3.5 px-6">Date</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {posts.map((post) => (
                    <tr key={post.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-4 px-6 font-medium text-white max-w-sm truncate">
                        <Link href={`/admin/posts/${post.id}`} className="hover:text-emerald-400 flex items-center gap-2">
                          {post.isVideoPost && <span className="text-purple-400">🎬</span>}
                          <span>{post.title}</span>
                        </Link>
                      </td>
                      <td className="py-4 px-6 text-slate-400 whitespace-nowrap">
                        <span className="bg-slate-800 px-2 py-0.5 rounded text-xs">
                          {post.category?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                            post.status === 'PUBLISHED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {post.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-400 text-xs whitespace-nowrap">
                        {post.views.toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-slate-400 text-xs whitespace-nowrap">
                        {format(new Date(post.createdAt), 'MMM d, yyyy')}
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap space-x-2">
                        <Link
                          href={`/admin/posts/${post.id}`}
                          className="px-2.5 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition"
                        >
                          Edit
                        </Link>
                        <a
                          href={`/post/${post.slug}`}
                          target="_blank"
                          className="px-2.5 py-1 text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-md transition"
                        >
                          View ↗
                        </a>
                        <button
                          onClick={() => handleDelete(post.id)}
                          disabled={deletingId === post.id}
                          className="px-2.5 py-1 text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-md transition disabled:opacity-50 cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Responsive Pagination */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
