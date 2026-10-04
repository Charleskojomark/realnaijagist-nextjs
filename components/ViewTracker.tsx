'use client'

import { useEffect } from 'react'

export default function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    // Fire-and-forget: increment view count after 3 seconds (confirms real read, not bot)
    const timer = setTimeout(() => {
      fetch(`/api/posts/${slug}`, { method: 'POST' }).catch(() => {})
    }, 3000)
    return () => clearTimeout(timer)
  }, [slug])

  return null // Invisible component
}