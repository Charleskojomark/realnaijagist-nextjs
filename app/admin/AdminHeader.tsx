'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { SessionUser } from '@/lib/auth'
import { useState, useEffect } from 'react'
import { useToast } from '@/components/admin/ToastContext'

export default function AdminHeader({ user }: { user: SessionUser | null }) {
  const router = useRouter()
  const pathname = usePathname()
  const { showToast } = useToast()
  const [loggingOut, setLoggingOut] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Close mobile menu on page navigation
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    try {
      setLoggingOut(true)
      await fetch('/api/auth/logout', { method: 'POST' })
      showToast('Logged out successfully', 'info')
      router.push('/admin/login')
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setLoggingOut(false)
    }
  }

  const navLinks = [
    { label: 'Dashboard', href: '/admin', icon: '📊' },
    { label: 'All Articles', href: '/admin/posts', icon: '📰' },
    { label: 'Write New Article', href: '/admin/posts/new', icon: '✍️', highlight: true },
    { label: 'Categories', href: '/admin/categories', icon: '🏷️' },
    { label: 'Profile & Password', href: '/admin/profile', icon: '🔒' },
  ]

  return (
    <>
      <header className="bg-slate-900 border-b border-slate-800 px-3 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Menu Hamburger Button */}
          {user && (
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none transition"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          )}

          <Link href="/admin" className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="RealNaijaGist"
              width={28}
              height={28}
              className="w-7 h-7 rounded-md object-contain bg-slate-900 p-0.5"
            />
            <span className="font-black text-base sm:text-lg text-emerald-400 tracking-tight">RealNaijaGist</span>
            <span className="bg-emerald-500/10 text-emerald-400 text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider border border-emerald-500/20">
              Admin
            </span>
          </Link>
        </div>

        {user ? (
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Quick Action Button */}
            <Link
              href="/admin/posts/new"
              className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-1 transition shadow-sm"
            >
              <span>+</span>
              <span>New</span>
            </Link>

            {/* Desktop User Info & Sign Out (Hidden on Mobile to prevent any overflow) */}
            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold text-white leading-tight">
                {user.username}
              </p>
              <p className="text-[10px] text-slate-400 font-medium">Staff Editor</p>
            </div>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="hidden sm:block px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition disabled:opacity-50 cursor-pointer"
            >
              {loggingOut ? '...' : 'Sign Out'}
            </button>
          </div>
        ) : (
          <Link
            href="/admin/login"
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300"
          >
            Sign In
          </Link>
        )}
      </header>

      {/* Mobile Drawer Navigation Menu */}
      {user && mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[53px] bg-slate-950/95 backdrop-blur-xl z-40 p-5 flex flex-col justify-between border-t border-slate-800 overflow-y-auto">
          <div className="space-y-6">
            {/* User Info Card */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">{user.username}</p>
                <p className="text-xs text-slate-400">{user.email || 'Staff Account'}</p>
              </div>
              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Staff
              </span>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-2">
              {navLinks.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${
                      isActive
                        ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                        : item.highlight
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'text-slate-200 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="space-y-3 pt-6 border-t border-slate-800">
            <a
              href="/"
              target="_blank"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-900 text-slate-300 font-semibold text-xs border border-slate-800 hover:text-white"
            >
              <span>View Public Website ↗</span>
            </a>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full py-3 rounded-xl bg-red-500/10 text-red-400 font-bold text-xs border border-red-500/20 hover:bg-red-500/20 transition cursor-pointer"
            >
              {loggingOut ? 'Logging out...' : 'Sign Out of Admin'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
