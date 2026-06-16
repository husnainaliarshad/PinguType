import { useRef, useEffect, useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import TextDisplay from './TextDisplay'
import TypingInput from './TypingInput'
import StatsBar from './StatsBar'
import type { TypingSnapshot, TypingStats } from '@/types/engine'

interface TypingAreaProps {
  snapshot: TypingSnapshot
  stats: TypingStats
  isReady: boolean
  isActive: boolean
  isComplete: boolean
  isLoading: boolean
  onStart: () => void
  onReset: () => void
  onKeyDown: (e: KeyboardEvent) => void
}

export default function TypingArea({
  snapshot,
  stats,
  isReady,
  isActive,
  isComplete,
  isLoading,
  onStart,
  onReset,
  onKeyDown,
}: TypingAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const lastAnnouncementRef = useRef(0)
  const [liveMessage, setLiveMessage] = useState('')

  useEffect(() => {
    if (isReady || isActive) {
      inputRef.current?.focus()
    }
  }, [isReady, isActive])

  useEffect(() => {
    if (!isActive && !isReady) return

    const handler = (e: KeyboardEvent) => {
      onKeyDown(e)
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isActive, isReady, onKeyDown])

  useEffect(() => {
    if (isComplete) {
      setLiveMessage('Session complete. Check your results below.')
      return
    }
    if (!isActive) {
      setLiveMessage('')
      return
    }
    const now = Date.now()
    if (now - lastAnnouncementRef.current < 3000) return
    lastAnnouncementRef.current = now
    setLiveMessage(
      `WPM: ${stats.wpm.toFixed(0)}. Accuracy: ${stats.accuracy.toFixed(0)} percent.`,
    )
  }, [isActive, isComplete, stats.wpm, stats.accuracy])

  if (!isReady && !isActive && !isComplete) {
    return (
      <Card className="flex flex-col items-center justify-center gap-6 p-8 sm:p-12 min-h-[320px]">
        {isLoading ? (
          <p className="text-lg text-text-muted" role="status">
            Loading text...
          </p>
        ) : (
          <>
            <p className="text-lg text-text-muted">
              Ready to test your speed?
            </p>
            <Button size="lg" onClick={onStart}>
              Start Typing
            </Button>
          </>
        )}
      </Card>
    )
  }

  if (isComplete) {
    return (
      <Card className="flex flex-col items-center justify-center gap-6 p-8 sm:p-12 min-h-[320px]">
        <StatsBar stats={stats} />
        <p className="text-lg text-text-muted mt-2">Session complete!</p>
        <div className="flex gap-3">
          <Button onClick={onStart}>Try Again</Button>
          <Button variant="secondary" onClick={onReset}>
            Back
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <StatsBar stats={stats} />

      <div className="sr-only" aria-live="polite" aria-atomic="false">
        {liveMessage}
      </div>

      <Card
        className="relative p-6 sm:p-8 cursor-text min-h-[160px]"
        onClick={() => inputRef.current?.focus()}
      >
        <TextDisplay chars={snapshot.chars} />
        <TypingInput ref={inputRef} disabled={!isActive && !isReady} />
      </Card>

      <div className="flex justify-center">
        <Button variant="ghost" onClick={onReset}>
          Reset
        </Button>
      </div>
    </div>
  )
}
