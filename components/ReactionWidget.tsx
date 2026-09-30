'use client'

import { useState, useEffect } from 'react'

interface ReactionWidgetProps {
  postSlug: string
  initialLikes?: number
}

type ReactionType = 'fire' | 'sad' | 'wow' | 'angry' | 'love' | 'lol'

interface ReactionOption {
  type: ReactionType
  emoji: string
  label: string
}

const REACTIONS: ReactionOption[] = [
  { type: 'fire', emoji: '🔥', label: 'Hot' },
  { type: 'love', emoji: '❤️', label: 'Love' },
  { type: 'wow', emoji: '😮', label: 'Shocked' },
  { type: 'lol', emoji: '😂', label: 'Funny' },
  { type: 'sad', emoji: '💔', label: 'Sad' },
  { type: 'angry', emoji: '😡', label: 'Angry' },
]

export default function ReactionWidget({ postSlug, initialLikes = 0 }: ReactionWidgetProps) {
  const [counts, setCounts] = useState<Record<ReactionType, number>>({
    fire: Math.max(3, Math.floor(initialLikes * 0.4) + 5),
    love: Math.max(2, Math.floor(initialLikes * 0.25) + 3),
    wow: Math.max(1, Math.floor(initialLikes * 0.15) + 2),
    lol: Math.max(1, Math.floor(initialLikes * 0.1) + 1),
    sad: 1,
    angry: 0,
  })

  const [userReaction, setUserReaction] = useState<ReactionType | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem(`rng_react_${postSlug}`)
    if (stored && REACTIONS.some((r) => r.type === stored)) {
      setUserReaction(stored as ReactionType)
    }

    const storedCounts = localStorage.getItem(`rng_counts_${postSlug}`)
    if (storedCounts) {
      try {
        setCounts(JSON.parse(storedCounts))
      } catch {}
    }
  }, [postSlug])

  const handleReact = (type: ReactionType) => {
    if (userReaction === type) return // already reacted

    const prevReaction = userReaction
    const updatedCounts = { ...counts }

    if (prevReaction) {
      updatedCounts[prevReaction] = Math.max(0, updatedCounts[prevReaction] - 1)
    }

    updatedCounts[type] = (updatedCounts[type] || 0) + 1

    setCounts(updatedCounts)
    setUserReaction(type)

    if (typeof window !== 'undefined') {
      localStorage.setItem(`rng_react_${postSlug}`, type)
      localStorage.setItem(`rng_counts_${postSlug}`, JSON.stringify(updatedCounts))
    }

    setToastMessage(`You reacted with ${REACTIONS.find((r) => r.type === type)?.emoji}!`)
    setTimeout(() => setToastMessage(null), 3000)

    // Optional background ping
    fetch(`/api/reactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: postSlug, reaction: type }),
    }).catch(() => {})
  }

  const totalReactions = Object.values(counts).reduce((a, b) => a + b, 0)

  return (
    <div className="my-8 rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
            <span>Reader Reactions</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {totalReactions} votes
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">What is your take on this story? Tap an emoji to react.</p>
        </div>
        {toastMessage && (
          <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-3 py-1 rounded-full animate-fade-in">
            {toastMessage}
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 sm:gap-3">
        {REACTIONS.map((r) => {
          const isSelected = userReaction === r.type
          return (
            <button
              key={r.type}
              onClick={() => handleReact(r.type)}
              type="button"
              className={`group flex flex-col items-center justify-center p-3 rounded-xl border transition-all transform active:scale-95 cursor-pointer ${
                isSelected
                  ? 'bg-emerald-950/70 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] scale-105'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600 hover:scale-102'
              }`}
            >
              <span className="text-2xl sm:text-3xl mb-1 group-hover:scale-125 transition-transform duration-200">
                {r.emoji}
              </span>
              <span className="text-[11px] font-semibold tracking-tight">{r.label}</span>
              <span className={`text-[10px] mt-0.5 font-bold ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`}>
                {counts[r.type]}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
