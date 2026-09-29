'use client'
import { getOptimizedImageUrl } from '@/lib/images'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export interface Slide {
  id: number
  title: string
  subtitle?: string | null
  image?: string | null
  scrapedImageUrl?: string | null
  imageUrl?: string | null
  actionUrl?: string | null
  post?: { slug: string } | null
}

interface HeroCarouselProps {
  slides?: Slide[]
}

export default function HeroCarousel({ slides = [] }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (slides.length <= 1) return
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 5500)
    return () => clearInterval(interval)
  }, [slides.length])

  if (slides.length === 0) return null

  const activeSlide = slides[current]
  const targetUrl = activeSlide.actionUrl || (activeSlide.post?.slug ? `/post/${activeSlide.post.slug}` : '/')
  const displayImage = getOptimizedImageUrl(activeSlide.imageUrl || activeSlide.image || activeSlide.scrapedImageUrl)

  return (
    <div className="relative w-full h-[380px] sm:h-[460px] md:h-[520px] rounded-2xl overflow-hidden shadow-2xl bg-slate-900 border border-slate-800">
      {/* Background Image */}
      <img
        src={displayImage}
        alt={activeSlide.title}
        className="w-full h-full object-cover transition-all duration-700 brightness-75 scale-100"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />

      {/* Slide Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 max-w-4xl space-y-3">
        <div className="inline-flex items-center gap-2 bg-emerald-600/90 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          Top Spotlight
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight drop-shadow-md">
          <Link href={targetUrl} className="hover:text-emerald-400 transition-colors">
            {activeSlide.title}
          </Link>
        </h2>
        {activeSlide.subtitle && (
          <p className="text-sm sm:text-base text-slate-300 line-clamp-2 max-w-2xl drop-shadow">
            {activeSlide.subtitle}
          </p>
        )}
        <div className="pt-2">
          <Link
            href={targetUrl}
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-lg shadow-lg hover:shadow-emerald-500/25 transition-all"
          >
            Explore Story
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Indicator Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 right-6 flex items-center gap-1.5 z-10">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? 'w-6 bg-emerald-500' : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}