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
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20 rounded-2xl p-6">
        <div>
          <h1 className="text-2xl font-black text-white">
            Welcome back, <span className="text-emerald-400">{session.username}</span>!
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            RealNaijaGist Editorial & Content Management Console
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/posts/new"
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center gap-2"
          >
            <span>+ Write New Article</span>
          </Link>
          <a
            href="/"
            target="_blank"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm rounded-xl transition border border-slate-700"
          >
            View Live Site ↗
          </a>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Total Articles</p>
          <p className="text-3xl font-black text-white mt-2">{totalPosts.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">Migrated & active in database</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">Published</p>
          <p className="text-3xl font-black text-emerald-400 mt-2">{publishedPosts.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">Live on the public website</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-amber-400 font-semibold">Drafts</p>
          <p className="text-3xl font-black text-amber-400 mt-2">{draftPosts.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">Unpublished editorial drafts</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-purple-400 font-semibold">Categories</p>
          <p className="text-3xl font-black text-purple-400 mt-2">{totalCategories}</p>
          <p className="text-xs text-slate-500 mt-1">Topics & news sections</p>
        </div>
      </div>

      {/* Recent Posts Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Recent Articles</h2>
            <p className="text-xs text-slate-400 mt-0.5">Latest published or edited stories</p>
          </div>
          <Link
            href="/admin/posts"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
          >
            View All ({totalPosts.toLocaleString()}) →
          </Link>
        </div>

        <div className="overflow-x-auto">
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
                  <td className="py-4 px-6 text-slate-400 whitespace-now4">
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
