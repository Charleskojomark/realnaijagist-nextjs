'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

interface Category {
  id: number
  name: string
  slug: string
}

interface NavbarProps {
  categories?: Category[]
}

export default function Navbar({ categories = [] }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
  const pathname = usePathname()

  if (pathname?.startsWith('/admin')) {
    return null
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setMobileMenuOpen(false)
    }
  }

  const defaultCategories = [
    { name: 'Politics', slug: 'politics' },
    { name: 'Entertainment', slug: 'entertainment' },
    { name: 'Metro & News', slug: 'metro' },
    { name: 'Sports', slug: 'sports' },
    { name: 'Business & Tech', slug: 'business-tech' },
    { name: 'Lifestyle', slug: 'lifestyle' },
  ]

  const navCategories = categories.length > 0 ? categories.slice(0, 6) : defaultCategories

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-xl">
      {/* Top Banner / Ticker */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 text-xs text-white font-medium py-1 px-4 text-center">
        <span className="inline-flex items-center gap-2">
          <span className="bg-red-500 text-white uppercase text-[10px] font-bold px-1.5 py-0.5 rounded animate-pulse">LIVE</span>
          RealNaijaGist — Nigeria's Premier Breaking News, Entertainment &amp; Lifestyle Hub
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <img
              src="/logo.png"
              alt="RealNaijaGist"
              width={36}
              height={36}
              className="w-9 h-9 rounded-lg object-contain shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform bg-slate-950/40 p-0.5"
            />
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                REAL<span className="text-emerald-400">NAIJA</span>GIST
              </span>
              <span className="text-[9px] uppercase tracking-widest text-slate-400 -mt-1 font-semibold">
                Verified Naija Pulse
              </span>
            </div>
          </Link>

          {/* Desktop Categories */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className="px-3 py-1.5 text-sm font-semibold rounded-md text-slate-200 hover:text-white hover:bg-slate-800/80 transition-all"
            >
              Home
            </Link>
            {navCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="px-3 py-1.5 text-sm font-medium rounded-md text-slate-300 hover:text-emerald-400 hover:bg-slate-800/60 transition-all"
              >
                {cat.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Search & Actions */}
          <div className="hidden md:flex items-center gap-3">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search news, gist..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-56 bg-slate-800/80 border border-slate-700/80 rounded-full py-1.5 pl-3.5 pr-8 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
              <button
                type="submit"
                aria-label="Search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-400 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-3 pb-6 space-y-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-3.5 pr-10 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-400"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>

          <nav className="flex flex-col space-y-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md text-sm font-semibold text-slate-200 hover:bg-slate-800"
            >
              Home
            </Link>
            {navCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md text-sm text-slate-300 hover:bg-slate-800 hover:text-emerald-400"
              >
                {cat.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}