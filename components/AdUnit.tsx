'use client'

import { useEffect, useRef } from 'react'

interface AdUnitProps {
  slot: string
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical'
  className?: string
  style?: React.CSSProperties
}

/**
 * Google AdSense Ad Unit - Fully Compliant
 * Publisher ID: ca-pub-5426911739752799
 * - ADVERTISEMENT label required by AdSense policy
 * - Responsive with data-full-width-responsive
 * - Gracefully handles dev environment
 */
export default function AdUnit({ slot, format = 'auto', className = '', style }: AdUnitProps) {
  const adRef = useRef<HTMLModElement>(null)
  const pushed = useRef(false)

  useEffect(() => {
    if (pushed.current) return
    pushed.current = true
    try {
      if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
        ;(window as any).adsbygoogle.push({})
      }
    } catch {
      // Gracefully ignore in dev/preview
    }
  }, [])

  const minHeightMap: Record<string, string> = {
    horizontal: '90px',
    rectangle: '250px',
    vertical: '600px',
    auto: '90px',
  }

  return (
    <div className={`w-full text-center my-6 ${className}`} role="complementary" aria-label="Advertisement">
      <p className="text-[9px] uppercase font-bold tracking-widest text-slate-600 mb-1 select-none">
        Advertisement
      </p>
      <div
        className="bg-slate-900/30 border border-slate-800/60 rounded-lg overflow-hidden"
        style={{ minHeight: minHeightMap[format] || '90px' }}
      >
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', ...(style || {}) }}
          data-ad-client="ca-pub-5426911739752799"
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    </div>
  )
}
