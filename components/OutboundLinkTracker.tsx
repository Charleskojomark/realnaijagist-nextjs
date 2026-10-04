'use client'

import { useEffect } from 'react'

// Domains that should not have outbound UTM tags appended
const IGNORED_HOSTS = [
  'localhost',
  'realnaijagist.com',
  'wa.me',
  'whatsapp.com',
  'twitter.com',
  'x.com',
  'facebook.com',
  'linkedin.com',
  't.me',
  'telegram.me',
  'reddit.com',
  'pinterest.com',
  'googlesyndication.com',
  'doubleclick.net',
  'google.com',
]

/**
 * OutboundLinkTracker
 * Automatically appends UTM referral parameters to all external links
 * across the site when a visitor clicks them.
 * 
 * Example:
 * Clicking https://example.com/article becomes:
 * https://example.com/article?utm_source=realnaijagist.com&utm_medium=referral&utm_campaign=outbound
 */
export default function OutboundLinkTracker() {
  useEffect(() => {
    function handleAnchorClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement | null)?.closest('a')
      if (!anchor || !anchor.href) return

      // Allow opting out via attribute data-no-utm
      if (anchor.hasAttribute('data-no-utm')) return

      try {
        const url = new URL(anchor.href, window.location.origin)

        // Only process http / https
        if (url.protocol !== 'http:' && url.protocol !== 'https:') return

        // Skip internal links
        const currentHostname = window.location.hostname
        if (
          url.hostname === currentHostname ||
          url.hostname.endsWith('.' + currentHostname) ||
          url.hostname.includes('realnaijagist.com')
        ) {
          return
        }

        // Skip social sharing, AdSense, and search engines
        const isIgnored = IGNORED_HOSTS.some(
          (host) => url.hostname === host || url.hostname.endsWith('.' + host)
        )
        if (isIgnored) return

        // Ensure safe target and rel for outbound links
        if (!anchor.target) anchor.target = '_blank'
        if (!anchor.rel) anchor.rel = 'noopener noreferrer'

        // Only append UTM if not already present
        if (!url.searchParams.has('utm_source')) {
          url.searchParams.set('utm_source', 'realnaijagist.com')
          url.searchParams.set('utm_medium', 'referral')
          url.searchParams.set('utm_campaign', 'outbound')
          anchor.href = url.toString()
        }
      } catch {
        // Silently ignore malformed URLs
      }
    }

    document.addEventListener('click', handleAnchorClick, { capture: true })
    return () => {
      document.removeEventListener('click', handleAnchorClick, { capture: true })
    }
  }, [])

  return null
}
