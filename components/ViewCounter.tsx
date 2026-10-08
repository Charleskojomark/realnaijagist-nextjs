'use client'

import { useEffect, useRef, useState } from 'react'

interface ViewCounterProps {
  slug: string
  initialViews: number
}

/**
 * ViewCounter - Increments view count on mount and shows the LIVE count.
 *
 * Why this exists: The post page is Server-Side Rendered (SSR), so
 * post.views is baked in at render time (before the current visit is counted).
 * This component calls the API, gets the NEW count back, and displays it
 * so users see an up-to-date number including their own visit.
 */
export default function ViewCounter({ slug, initialViews }: ViewCounterProps) {
  const [views, setViews] = useState<number>(initialViews)
  // Use a ref (not state) for the "already counted" guard so flipping it
  // doesn't trigger a re-render that would cancel the pending timer below
  // before it ever fires.
  const hasCountedRef = useRef(false)

  useEffect(() => {
    if (hasCountedRef.current) return
    hasCountedRef.current = true

    // Small delay to avoid counting bots that bounce immediately
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/posts/${slug}`, { method: 'POST' })
        const data = await res.json()
        if (data.ok && typeof data.views === 'number') {
          setViews(data.views) // Update display with the real new count
        }
      } catch {
        // Fail silently - non-critical
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [slug])

  return (
    <span>
      {views.toLocaleString()} {views === 1 ? 'view' : 'views'}
    </span>
  )
}
