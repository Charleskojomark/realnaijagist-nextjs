'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function CookieConsent() {
  const pathname = usePathname()
  const [showConsent, setShowConsent] = useState(false)

  useEffect(() => {
    // Check if user already accepted
    const consent = localStorage.getItem('realnaijagist_cookie_consent')
    if (!consent) {
      // Delay slightly for smooth appearance
      const timer = setTimeout(() => setShowConsent(true), 1200)
      return () => clearTimeout(timer)
    }
  }, [])

  if (pathname?.startsWith('/admin') || !showConsent) {
    return null
  }

  const handleAccept = () => {
    localStorage.setItem('realnaijagist_cookie_consent', 'accepted')
    setShowConsent(false)
  }

  return (
    <div className="fixed bottom-4 inset-x-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-slate-900/95 backdrop-blur-xl border border-slate-700 p-5 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-5">
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🍪</span>
          <div>
            <h4 className="text-sm font-bold text-white">Cookie &amp; Ad Consent</h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              We and our partners (including Google AdSense) use cookies to personalize content, deliver relevant advertisements, and analyze traffic. See our{' '}
              <Link href="/privacy" className="text-emerald-400 underline hover:text-emerald-300">
                Privacy Policy
              </Link>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleAccept}
            className="flex-1 py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            Accept Cookies
          </button>
          <button
            onClick={() => setShowConsent(false)}
            className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}
