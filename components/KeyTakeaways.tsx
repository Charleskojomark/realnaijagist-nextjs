'use client'

import { useState } from 'react'

interface KeyTakeawaysProps {
  content: string
  excerpt?: string | null
  /** Prefer AI-generated bullets from Groq when available */
  aiPoints?: string[]
}

export default function KeyTakeaways({ content, excerpt, aiPoints }: KeyTakeawaysProps) {
  const [copied, setCopied] = useState(false)

  // Extract 3-4 bullet points from content or excerpt (fallback)
  const getLocalPoints = () => {
    const cleanText = content
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    const sentences = cleanText
      .split(/(?<=[.?!])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 25 && s.length < 220)

    if (sentences.length >= 3) {
      return sentences.slice(0, 3)
    }

    if (excerpt && excerpt.length > 20) {
      const excerptSentences = excerpt
        .split(/(?<=[.?!])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 15)
      if (excerptSentences.length >= 2) {
        return excerptSentences.slice(0, 3)
      }
    }

    return [
      cleanText.slice(0, 140) + '...',
      'Key updates and context verified by RealNaijaGist correspondents.',
      'Full details and ongoing developments highlighted below.',
    ]
  }

  const points =
    aiPoints && aiPoints.length >= 2 ? aiPoints.slice(0, 3) : getLocalPoints()

  const handleCopy = () => {
    const textToCopy = `📌 Key Takeaways (RealNaijaGist):\n` + points.map((p) => `• ${p}`).join('\n')
    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="my-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-emerald-950/20 border border-emerald-500/30 p-5 sm:p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />

      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </span>
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              Key Takeaways
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {aiPoints && aiPoints.length >= 2 ? 'AI summary' : '30-sec read'}
              </span>
            </h3>
          </div>
        </div>

        <button
          onClick={handleCopy}
          type="button"
          className="text-xs font-semibold text-slate-300 hover:text-emerald-400 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors"
          title="Copy summary bullet points"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-emerald-400 font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Share Highlights</span>
            </>
          )}
        </button>
      </div>

      <ul className="space-y-4 text-lg text-slate-100 font-semibold leading-relaxed">
        {points.map((point, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <span className="mt-2 flex-shrink-0 w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="flex-1">{point}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
