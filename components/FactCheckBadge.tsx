'use client'

import { useState } from 'react'
import Link from 'next/link'

interface FactCheckBadgeProps {
  categoryName?: string
}

export default function FactCheckBadge({ categoryName }: FactCheckBadgeProps) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <div className="inline-flex items-center gap-2">
        <button
          onClick={() => setShowModal(true)}
          type="button"
          className="group inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 hover:border-emerald-400 hover:bg-emerald-900/90 transition-all shadow-sm cursor-pointer"
          title="Click to view RealNaijaGist Verification Standards"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <svg className="w-3.5 h-3.5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span>Fact-Checked &amp; Verified</span>
          <span className="text-[10px] text-emerald-400/80 group-hover:text-emerald-200">ⓘ</span>
        </button>
      </div>

      {/* Verification Details Modal */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Editorial Verification Standards</h4>
                  <p className="text-[11px] text-emerald-400 font-medium">RealNaijaGist Trust Initiative</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed border-y border-slate-800 py-3">
              <div className="flex gap-2">
                <span className="text-emerald-400 font-bold">1.</span>
                <p><strong className="text-white">Primary Source Corroboration:</strong> Reported facts are cross-referenced with government gazettes, court filings, official spokespersons, or verified eye-witness statements.</p>
              </div>
              <div className="flex gap-2">
                <span className="text-emerald-400 font-bold">2.</span>
                <p><strong className="text-white">Editorial Board Oversight:</strong> All breaking items undergo multi-tier editorial vetting to prevent sensationalism and disinformation.</p>
              </div>
              <div className="flex gap-2">
                <span className="text-emerald-400 font-bold">3.</span>
                <p><strong className="text-white">Corrections Transparency:</strong> We enforce an open corrections policy. If any factual error arises, it is corrected prominently within 2 hours.</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <Link
                href="/disclaimer"
                onClick={() => setShowModal(false)}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
              >
                Read Full Fact-Checking Policy →
              </Link>
              <button
                onClick={() => setShowModal(false)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
