'use client'

import { useState, useEffect, useRef } from 'react'

interface AudioPlayerProps {
  title: string
  content: string
}

export default function AudioPlayer({ title, content }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [speed, setSpeed] = useState<number>(1.0)
  const [supported, setSupported] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSupported(true)
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  if (!supported) return null

  // Strip html tags
  const cleanContent = content
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const fullTextToRead = `${title}. ... ${cleanContent}`

  const handlePlay = () => {
    if (!('speechSynthesis' in window)) return

    if (isPaused) {
      window.speechSynthesis.resume()
      setIsPaused(false)
      setIsPlaying(true)
      return
    }

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(fullTextToRead)
    utterance.rate = speed
    utterance.pitch = 1.0

    // Try finding an English voice
    const voices = window.speechSynthesis.getVoices()
    const englishVoice = voices.find(
      (v) => v.lang.startsWith('en-GB') || v.lang.startsWith('en-US') || v.lang.startsWith('en')
    )
    if (englishVoice) {
      utterance.voice = englishVoice
    }

    utterance.onend = () => {
      setIsPlaying(false)
      setIsPaused(false)
    }

    utterance.onerror = () => {
      setIsPlaying(false)
      setIsPaused(false)
    }

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
    setIsPlaying(true)
    setIsPaused(false)
  }

  const handlePause = () => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.pause()
    setIsPaused(true)
    setIsPlaying(false)
  }

  const handleStop = () => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    setIsPlaying(false)
    setIsPaused(false)
  }

  const toggleSpeed = () => {
    const nextSpeed = speed === 1.0 ? 1.25 : speed === 1.25 ? 1.5 : 1.0
    setSpeed(nextSpeed)
    if (isPlaying && utteranceRef.current) {
      // Re-trigger with new speed
      handleStop()
      setTimeout(() => {
        const u = new SpeechSynthesisUtterance(fullTextToRead)
        u.rate = nextSpeed
        utteranceRef.current = u
        u.onend = () => {
          setIsPlaying(false)
          setIsPaused(false)
        }
        window.speechSynthesis.speak(u)
        setIsPlaying(true)
      }, 100)
    }
  }

  return (
    <div className="my-5 rounded-xl bg-slate-900/90 border border-slate-800 p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
          isPlaying ? 'bg-emerald-500 text-slate-950 animate-pulse' : 'bg-slate-800 text-emerald-400'
        }`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        </div>
        <div>
          <span className="text-xs sm:text-sm font-bold text-white block">
            {isPlaying ? 'Now Playing Audio Briefing...' : isPaused ? 'Audio Paused' : 'Listen to this Story'}
          </span>
          <span className="text-[11px] text-slate-400">AI Narration · Web Speech Engine</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleSpeed}
          type="button"
          className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          title="Adjust reading speed"
        >
          {speed}x
        </button>

        {!isPlaying ? (
          <button
            onClick={handlePlay}
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md active:scale-95"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            <span>{isPaused ? 'Resume' : 'Play'}</span>
          </button>
        ) : (
          <button
            onClick={handlePause}
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition-all shadow-md active:scale-95"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
            <span>Pause</span>
          </button>
        )}

        {(isPlaying || isPaused) && (
          <button
            onClick={handleStop}
            type="button"
            className="p-1.5 rounded-lg text-xs bg-slate-800 hover:bg-red-900/60 text-slate-400 hover:text-red-300 transition-colors"
            title="Stop narration"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h12v12H6z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
