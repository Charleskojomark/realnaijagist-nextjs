import { ReactNode } from 'react'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import AdminHeader from './AdminHeader'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getSession()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <AdminHeader user={session} />
      <div className="flex flex-1">
        {session && (
          <aside className="w-64 bg-slate-900/80 border-r border-slate-800 p-5 hidden md:flex flex-col justify-between shrink-0">
            <div className="space-y-6">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">
                  Content Management
                </p>
                <nav className="space-y-1">
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 text-sm font-medium transition"
                  >
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Dashboard
                  </Link>

                  <Link
                    href="/admin/posts"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 text-sm font-medium transition"
                  >
                    <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                    All Articles
                  </Link>

                  <Link
                    href="/admin/posts/new"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 text-sm font-semibold transition"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Write New Article
                  </Link>

                  <Link
                    href="/admin/categories"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 text-sm font-medium transition"
                  >
                    <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Categories
                  </Link>
                </nav>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">
                  Account & Settings
                </p>
                <nav className="space-y-1">
                  <Link
                    href="/admin/profile"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 text-sm font-medium transition"
                  >
                    <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    My Profile & Password
                  </Link>
                </nav>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <a
                href="/"
                target="_blank"
                className="flex items-center gap-2 text-xs text-slate-400 hover:text-emerald-400 transition"
              >
                <span>View Public Site ↗</span>
              </a>
            </div>
          </aside>
        )}

        <main className="flex-1 p-3.5 sm:p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}
