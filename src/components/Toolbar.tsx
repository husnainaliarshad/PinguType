import { useState, useRef, type KeyboardEvent } from 'react'
import { X } from 'lucide-react'
import type { TypingStats } from '@/types/engine'

interface ToolbarProps {
  stats: TypingStats
  pageInfo: { current: number; total: number } | null
  isLoading: boolean
  onUpload: () => void
  onPrevPage: () => void
  onNextPage: () => void
  onGoToPage: (n: number) => void
}

export default function Toolbar({
  stats,
  pageInfo,
  isLoading,
  onUpload,
  onPrevPage,
  onNextPage,
  onGoToPage,
}: ToolbarProps) {
  const [expanded, setExpanded] = useState(false)
  const [pageInput, setPageInput] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePageKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && pageInfo) {
      const n = parseInt(pageInput, 10)
      if (!isNaN(n) && n >= 1 && n <= pageInfo.total) {
        onGoToPage(n)
        setPageInput('')
      }
    }
  }

  const showPagination = pageInfo && pageInfo.total > 1
  const totalPills = showPagination ? 4 : 3

  return (
    <div className="flex items-center justify-center gap-2 py-3 animate-[slide-up_200ms_ease-out]">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={() => {
          onUpload()
          setExpanded(false)
        }}
      />

      <div
        className={`inline-flex items-center gap-1.5 transition-all duration-300 ease-out ${
          expanded ? 'gap-2' : ''
        }`}
      >
        {expanded ? (
          <>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="h-10 px-5 rounded-full bg-sand-light border border-espresso/10 text-espresso text-sm font-medium
                transition-all duration-200 hover:bg-sand hover:border-espresso/20
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta
                disabled:opacity-50 animate-[fade-in_200ms_ease-out]"
            >
              new book
            </button>

            <button
              disabled
              className="h-10 px-4 rounded-full bg-sand-light border border-espresso/10 text-espresso text-sm font-medium
                tabular-nums opacity-100 animate-[fade-in_200ms_ease-out_100ms]"
            >
              {stats.wpm.toFixed(0)} wpm / {stats.accuracy.toFixed(0)}% acc
            </button>

            {showPagination && pageInfo && (
              <div className="flex items-center gap-1 animate-[fade-in_200ms_ease-out_150ms]">
                <button
                  onClick={onPrevPage}
                  disabled={isLoading || pageInfo.current <= 1}
                  className="h-10 w-8 rounded-full bg-sand-light border border-espresso/10 text-espresso text-sm
                    transition-all duration-200 hover:bg-sand hover:border-espresso/20
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta
                    disabled:opacity-30 flex items-center justify-center"
                >
                  ‹
                </button>

                <input
                  type="number"
                  min={1}
                  max={pageInfo.total}
                  value={pageInput}
                  placeholder={pageInfo.current.toString()}
                  onChange={(e) => setPageInput(e.target.value)}
                  onKeyDown={handlePageKeyDown}
                  disabled={isLoading}
                  className="h-10 w-12 rounded-full bg-sand-light border border-espresso/10 text-espresso text-sm text-center tabular-nums
                    font-medium transition-all duration-200
                    hover:border-espresso/20
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta
                    disabled:opacity-50
                    [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />

                <span className="text-sm text-espresso-muted mx-0.5">/ {pageInfo.total}</span>

                <button
                  onClick={onNextPage}
                  disabled={isLoading || pageInfo.current >= pageInfo.total}
                  className="h-10 w-8 rounded-full bg-sand-light border border-espresso/10 text-espresso text-sm
                    transition-all duration-200 hover:bg-sand hover:border-espresso/20
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta
                    disabled:opacity-30 flex items-center justify-center"
                >
                  ›
                </button>
              </div>
            )}

            <button
              onClick={() => setExpanded(false)}
              className="h-10 w-10 rounded-full bg-espresso text-sand-light text-sm font-bold
                transition-all duration-200 hover:brightness-125
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-espresso/50
                animate-[fade-in_200ms_ease-out_200ms] flex items-center justify-center"
              aria-label="Close toolbar"
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <>
            {Array.from({ length: totalPills }).map((_, i) => (
              <button
                key={i}
                onClick={() => setExpanded(true)}
                className="w-10 h-10 rounded-md bg-terracotta
                  transition-all duration-200 ease-out
                  hover:scale-105 hover:brightness-110
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2"
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
}
