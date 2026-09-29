'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { SessionUser } from '@/lib/auth'
import { useState } from 'react'

export default function AdminHeader({ user }: { user: SessionUser | null }) {
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    try {
      setLoggingOut(true)
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/admin/login')
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="font-extrabold text-lg text-emerald-400 tracking-tight">RealNaijaGist</span>
          <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-0.5 rounded font-mono font-semibold uppercase tracking-wider border border-emerald-500/20">
            Admin
          </span>
        </Link>
      </div>

      {user ? (
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-white leading-tight">
              {user.username}
            </p>
            <p className="text-xs text-slate-400">{user.email || 'Staff Editor'}</p>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition disabled:opacity-50"
          >
            {loggingOut ? 'Logging out...' : 'Sign Out'}
          </button>
        </div>
      ) : (
        <Link
          href="/admin/login"
          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
        >
          Sign In
        </Link>
      )}
    </header>
  )
}
