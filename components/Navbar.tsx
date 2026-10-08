'use client'

import { useState, useRef, useEffect } from 'react'
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

// Fixed prioritized editorial order for news desk
const ORDERED_PRIMARY_SLUGS = [
  'breaking-news',
  'politics',
  'entertainment',
  'business',
  'sports',
]

export default function Navbar({ categories = [] }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMoreDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
    setMoreDropdownOpen(false)
  }, [pathname])

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

  // Fallback categories if none supplied
  const defaultCategories: Category[] = [
    { id: 9, name: 'Breaking News', slug: 'breaking-news' },
    { id: 2, name: 'Politics', slug: 'politics' },
    { id: 4, name: 'Entertainment', slug: 'entertainment' },
    { id: 8, name: 'Business & Economy', slug: 'business' },
    { id: 16, name: 'Sports', slug: 'sports' },
    { id: 5, name: 'Metro & Security', slug: 'metro' },
    { id: 6, name: 'Tech & Innovation', slug: 'technology' },
    { id: 23, name: 'Opinion & Editorial', slug: 'opinion' },
    { id: 22, name: 'General News', slug: 'general-news' },
  ]

  const sourceCats = categories.length > 0 ? categories : defaultCategories

  // Primary categories (first 5)
  const primaryCats: Category[] = []
  const moreCats: Category[] = []

  ORDERED_PRIMARY_SLUGS.forEach((slug) => {
    const match = sourceCats.find((c) => c.slug === slug)
    if (match) primaryCats.push(match)
  })

  // Put remaining categories in moreCats
  sourceCats.forEach((c) => {
    if (!ORDERED_PRIMARY_SLUGS.includes(c.slug)) {
      moreCats.push(c)
    }
  })

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-xl">
      {/* Top Banner / Ticker */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 text-xs sm:text-sm text-white font-semibold py-1.5 px-4">
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center">
          <span className="bg-red-500 text-white uppercase text-[10px] font-bold px-1.5 py-0.5 rounded animate-pulse shrink-0">
            LIVE
          </span>
          <span className="hidden sm:inline">
            RealNaijaGist — Nigeria&apos;s Premier Breaking News, Entertainment &amp; Lifestyle Hub
          </span>
          <span className="sm:hidden">
            Nigeria&apos;s Premier Breaking News &amp; Gist Hub
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3.5 group py-1.5 flex-shrink-0">
            <img
              src="/logo.png?v=2"
              alt="RealNaijaGist Logo"
              width={64}
              height={64}
              className="h-12 sm:h-14 md:h-16 w-auto object-contain filter drop-shadow-[0_2px_12px_rgba(16,185,129,0.35)] group-hover:scale-105 transition-all duration-300"
            />
            <div className="flex flex-col">
              <span className="font-black text-2xl sm:text-3xl tracking-tight text-white group-hover:text-emerald-400 transition-colors leading-none">
                REAL<span className="text-emerald-400">NAIJA</span>GIST
              </span>
              <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-emerald-400/90 font-bold mt-1">
                Verified Naija Pulse
              </span>
            </div>
          </Link>

          {/* Desktop Categories */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <Link
              href="/"
              className={`px-3 py-1.5 text-base font-bold rounded-md transition-all ${
                pathname === '/'
                  ? 'text-white bg-emerald-600/30 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              Home
            </Link>

            {primaryCats.map((cat) => {
              const isActive = pathname === `/category/${cat.slug}`
              return (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className={`px-3 py-1.5 text-base font-semibold rounded-md transition-all whitespace-nowrap ${
                    isActive
                      ? 'text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 font-semibold'
                      : 'text-slate-300 hover:text-emerald-400 hover:bg-slate-800/60'
                  }`}
                >
                  {cat.name}
                </Link>
              )
            })}

            {/* "More" Dropdown */}
            {moreCats.length > 0 && (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                    moreDropdownOpen || moreCats.some((c) => pathname === `/category/${c.slug}`)
                      ? 'text-emerald-300 bg-slate-800/90'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                  aria-expanded={moreDropdownOpen}
                >
                  <span>More</span>
                  <svg
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      moreDropdownOpen ? 'rotate-180 text-emerald-400' : 'text-slate-400'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {moreDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl py-2 z-50 animate-fade-in backdrop-blur-md">
                    {moreCats.map((cat) => {
                      const isActive = pathname === `/category/${cat.slug}`
                      return (
                        <Link
                          key={cat.slug}
                          href={`/category/${cat.slug}`}
                          className={`block px-4 py-2 text-xs font-medium transition-colors ${
                            isActive
                              ? 'text-emerald-400 bg-emerald-950/50 font-bold'
                              : 'text-slate-300 hover:text-white hover:bg-slate-800'
                          }`}
                        >
                          {cat.name}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* Advertise CTA (Desktop) */}
          <Link
            href="/advertise"
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-400 border border-amber-400/30 hover:bg-amber-400/10 transition-all whitespace-nowrap"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
            Advertise
          </Link>

          {/* Desktop Search & Actions */}
          <div className="hidden md:flex items-center gap-3">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search news, gist..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 lg:w-56 bg-slate-800/80 border border-slate-700/80 rounded-full py-1.5 pl-3.5 pr-8 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
              <button
                type="submit"
                aria-label="Search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
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
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 pt-3 pb-6 space-y-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search news, articles, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-3.5 pr-10 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-400 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>

          <nav className="grid grid-cols-2 gap-1.5 pt-2">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2 rounded-md text-xs font-bold ${
                pathname === '/' ? 'bg-emerald-600/30 text-white' : 'text-slate-200 hover:bg-slate-800'
              }`}
            >
              🏠 Home
            </Link>
            <Link
              href="/advertise"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 text-center"
            >
              ★ Advertise
            </Link>

            {sourceCats.map((cat) => {
              const isActive = pathname === `/category/${cat.slug}`
              return (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-950/60 text-emerald-300 font-bold border border-emerald-500/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {cat.name}
                </Link>
              )
            })}
          </nav>
        </div>
      )}
    </header>
  )
}


