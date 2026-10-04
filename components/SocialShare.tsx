'use client'

interface SocialShareProps {
  url: string
  title: string
}

function getShareUrl(baseUrl: string, platform: string) {
  try {
    const u = new URL(baseUrl)
    u.searchParams.set('utm_source', platform)
    u.searchParams.set('utm_medium', 'social_share')
    u.searchParams.set('utm_campaign', 'article_share')
    return u.toString()
  } catch {
    return baseUrl
  }
}

export default function SocialShare({ url, title }: SocialShareProps) {
  const encodedTitle = encodeURIComponent(title)
  const waUrl = encodeURIComponent(getShareUrl(url, 'whatsapp'))
  const twUrl = encodeURIComponent(getShareUrl(url, 'twitter'))
  const fbUrl = encodeURIComponent(getShareUrl(url, 'facebook'))
  const copyShareUrl = getShareUrl(url, 'copylink')

  const shares = [
    {
      name: 'WhatsApp',
      href: `https://wa.me/?text=${encodedTitle}%20${waUrl}`,
      color: 'bg-green-600 hover:bg-green-500',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.092.539 4.06 1.481 5.776L0 24l6.445-1.455A11.946 11.946 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.003-1.368l-.36-.214-3.727.842.857-3.62-.235-.372A9.818 9.818 0 1112 21.818z"/>
        </svg>
      ),
    },
    {
      name: 'Twitter/X',
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${twUrl}&via=RealNaijaGist`,
      color: 'bg-slate-800 hover:bg-slate-700 border border-slate-700',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
    },
    {
      name: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${fbUrl}`,
      color: 'bg-blue-700 hover:bg-blue-600',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
    },
    {
      name: 'Copy Link',
      href: '#',
      color: 'bg-slate-700 hover:bg-slate-600',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
        </svg>
      ),
      onClick: (e: React.MouseEvent) => {
        e.preventDefault()
        navigator.clipboard.writeText(copyShareUrl).then(() => {
          const btn = e.currentTarget as HTMLElement
          const orig = btn.getAttribute('aria-label')
          btn.setAttribute('aria-label', 'Copied!')
          setTimeout(() => btn.setAttribute('aria-label', orig || 'Copy Link'), 2000)
        })
      },
    },
  ]

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Share:</span>
      {shares.map((s) => (
        <a
          key={s.name}
          href={s.href}
          aria-label={s.name}
          data-no-utm="true"
          target={s.name !== 'Copy Link' ? '_blank' : undefined}
          rel="noopener noreferrer"
          onClick={s.onClick as React.MouseEventHandler<HTMLAnchorElement> | undefined}
          className={`inline-flex items-center gap-1.5 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${s.color}`}
        >
          {s.icon}
          <span className="hidden sm:inline">{s.name}</span>
        </a>
      ))}
    </div>
  )
}
