'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface PaginationProps {
  totalPages: number
  currentPage: number
  basePath: string
}

export default function Pagination({ totalPages, currentPage, basePath }: PaginationProps) {
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    return `${basePath}?${params.toString()}`
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-12 pt-6 border-t border-slate-800 text-xs">
      {currentPage > 1 && (
        <Link
          href={createPageUrl(currentPage - 1)}
          className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors font-medium"
        >
          &larr; Previous
        </Link>
      )}

      <span className="px-4 py-2 text-slate-400">
        Page <span className="text-white font-bold">{currentPage}</span> of{' '}
        <span className="text-slate-300">{totalPages}</span>
      </span>

      {currentPage < totalPages && (
        <Link
          href={createPageUrl(currentPage + 1)}
          className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors font-semibold shadow-md"
        >
          Next &rarr;
        </Link>
      )}
    </div>
  )
}