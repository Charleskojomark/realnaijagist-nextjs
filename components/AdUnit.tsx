'use client'

import { useEffect } from 'react'

interface AdUnitProps {
  slot: string
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical'
  className?: string
}

/**
 * AdSense Compliant Banner
 * - Labeled with standard "ADVERTISEMENT"
 * - Styled cleanly without overlapping content
 * - Automatically degrades gracefully when ads are not loaded
 */
export default function AdUnit({ slot, format = 'auto', className = '' }: AdUnitProps) {
  const clientPubId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-XXXXXXXXXXXXXXXX'

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({})
      }
    } catch (e) {
      // Ignore adsense errors in development
    }
  }, [])

  return (
    <div className={`w-full text-center my-6 ${className}`}>
      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">
        ADVERTISEMENT
      </span>
      <div className="min-h-[90px] bg-slate-900/40 border border-slate-800/80 rounded-lg flex items-center justify-center overflow-hidden">
        {/* Real AdSense tag will render here in production */}
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', minHeight: '90px' }}
          data-ad-client={clientPubId}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    </div>
  )
}