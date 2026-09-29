import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'

export default async function AdminDashboardPage() {
  const session = await getSession()
  if (!session) {
    redirect('/admin/login')
  }

  const [totalPosts, publishedPosts, draftPosts, totalCategories, recentPosts] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: 'PUBLISHED' } }),
    prisma.post.count({ where: { status: 'DRAFT' } }),
    prisma.category.count(),
    prisma.post.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        author: { select: { username: true } },
      },
    }),
  ])

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Welcome back, <span className="text-emerald-400">{session.username}</span>!
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            RealNaijaGist Editorial & Content Console
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/posts/new"
            className="flex-1 sm:flex-none text-center px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition shadow-lg shadow-emerald-500/20"
          >
            + Write Article
          </Link>
          <a
            href="/"
            target="_blank"
            className="flex-1 sm:flex-none text-center px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition border border-slate-700"
          >
            Live Site ↗
          </a>
        </div>
      </div>

      {/* Stats Cards: 2-col on Mobile, 4-col on Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <p className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-400 font-bold">Total Articles</p>
          <p className="text-2xl sm:text-3xl font-black text-white mt-1.5">{totalPosts.toLocaleString()}</p>
          <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">In database</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <p className="text-[10px] sm:text-xs uppercase tracking-wider text-emerald-400 font-bold">Published</p>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1.5">{publishedPosts.toLocaleString()}</p>
          <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">Live on site</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <p className="text-[10px] sm:text-xs uppercase tracking-wider text-amber-400 font-bold">Drafts</p>
          <p className="text-2xl sm:text-3xl font-black text-amber-400 mt-1.5">{draftPosts.toLocaleString()}</p>
          <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">Unpublished</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <p className="text-[10px] sm:text-xs uppercase tracking-wider text-purple-400 font-bold">Categories</p>
          <p className="text-2xl sm:text-3xl font-black text-purple-400 mt-1.5">{totalCategories}</p>
          <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">News topics</p>
        </div>
      </div>

      {/* Recent Posts: Mobile Cards + Desktop Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">Recent Articles</h2>
            <p className="text-xs text-slate-400 mt-0.5">Latest published or edited stories</p>
          </div>
          <Link
            href="/admin/posts"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
          >
            View All ({totalPosts.toLocaleString()}) →
          </Link>
        </div>

        {/* Mobile View */}
        <div className="sm:hidden divide-y divide-slate-800">
          {recentPosts.map((post) => (
            <div key={post.id} className="p-4 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <Link href={`/admin/posts/${post.id}`} className="font-bold text-white text-sm hover:text-emerald-400 line-clamp-2 leading-snug">
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

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span className="bg-slate-800 px-2 py-0.5 rounded text-[11px] text-slate-300">
                  {post.category.name}
                </span>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/posts/${post.id}`}
                    className="px-2.5 py-1 text-xs font-semibold bg-slate-800 text-white rounded-md"
                  >
                    Edit
                  </Link>
                  <a
                    href={`/post/${post.slug}`}
                    target="_blank"
                    className="px-2.5 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-400 rounded-md border border-emerald-500/20"
                  >
                    View ↗
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-xs border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-6">Title</th>
                <th className="py-3.5 px-6">Category</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Date</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentPosts.map((post) => (
                <tr key={post.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-4 px-6 font-medium text-white max-w-md truncate">
                    <Link href={`/admin/posts/${post.id}`} className="hover:text-emerald-400">
                      {post.title}
                    </Link>
                  </td>
                  <td className="py-4 px-6 text-slate-400 whitespace-nowrap">
                    <span className="bg-slate-800 px-2.5 py-1 rounded-md text-xs">
                      {post.category.name}
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
