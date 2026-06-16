import { useEffect, useState, useCallback } from 'react'
import { AlertCircle, ChevronLeft, ChevronRight, Upload } from 'lucide-react'
import TypingArea from '@/components/typing/TypingArea'
import Button from '@/components/ui/Button'
import { useTypingSession } from '@/hooks/useTypingSession'

function PaginationBar({
  pageInfo,
  isLoading,
  onPrev,
  onNext,
  onGoTo,
}: {
  pageInfo: { current: number; total: number }
  isLoading: boolean
  onPrev: () => void
  onNext: () => void
  onGoTo: (n: number) => void
}) {
  const [inputValue, setInputValue] = useState('')

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        const n = parseInt(inputValue, 10)
        if (!isNaN(n) && n >= 1 && n <= pageInfo.total) {
          onGoTo(n)
          setInputValue('')
        }
      }
    },
    [inputValue, pageInfo.total, onGoTo],
  )

  return (
    <div className="flex items-center justify-center gap-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={onPrev}
        disabled={isLoading || pageInfo.current <= 1}
      >
        <ChevronLeft size={16} className="mr-1" />
        Prev
      </Button>

      <div className="flex items-center gap-1.5">
        <input
          type="number"
          min={1}
          max={pageInfo.total}
          value={inputValue}
          placeholder={pageInfo.current.toString()}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          className="w-14 py-1 px-2 rounded-md bg-surface border border-surface/50 text-center text-sm text-text tabular-nums
            transition-all duration-200 ease-in-out
            hover:border-text-muted/30
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary
            disabled:opacity-50
            [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <span className="text-sm text-text-muted">/ {pageInfo.total}</span>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onNext}
        disabled={isLoading || pageInfo.current >= pageInfo.total}
      >
        Next
        <ChevronRight size={16} className="ml-1" />
      </Button>
    </div>
  )
}

export default function TypingPage() {
  const session = useTypingSession()

  useEffect(() => {
    if (
      session.phase === 'complete' &&
      session.pageInfo &&
      session.pageInfo.current < session.pageInfo.total
    ) {
      session.nextChunk()
    }
  }, [session.phase, session.pageInfo, session.nextChunk])

  const isReady =
    session.phase === 'ready' ||
    session.phase === 'active' ||
    session.phase === 'complete'

  const showPagination =
    session.pageInfo !== null && session.pageInfo.total > 1

  const needsUpload = session.phase === 'idle' && !session.text && !session.isLoading

  return (
    <div className="flex flex-col gap-4 max-w-3xl mx-auto pt-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider">
          PDF Typing Practice
        </h2>

        <Button
          size="sm"
          onClick={() => session.loadText('pdf')}
          disabled={session.isLoading}
        >
          <Upload size={16} className="mr-1.5" />
          {needsUpload ? 'Upload PDF' : 'New PDF'}
        </Button>
      </div>

      {session.error && (
        <div className="flex items-center gap-2 rounded-lg bg-incorrect/10 border border-incorrect/30 px-4 py-3 text-sm text-incorrect">
          <AlertCircle size={16} />
          {session.error}
        </div>
      )}

      {showPagination && session.pageInfo && (
        <PaginationBar
          pageInfo={session.pageInfo}
          isLoading={session.isLoading}
          onPrev={session.prevChunk}
          onNext={session.nextChunk}
          onGoTo={session.goToChunk}
        />
      )}

      <TypingArea
        snapshot={session.snapshot}
        stats={session.stats}
        isReady={isReady}
        isActive={session.phase === 'active'}
        isComplete={session.phase === 'complete'}
        isLoading={session.isLoading}
        onStart={session.startSession}
        onReset={session.resetSession}
        onJumpToChar={session.jumpToChar}
        onKeyDown={session.handleKeyDown}
      />
    </div>
  )
}
