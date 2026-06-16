import { useRef, useEffect } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import TextDisplay from './TextDisplay'
import TypingInput from './TypingInput'
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
  onJumpToChar: (index: number) => void
  onKeyDown: (e: KeyboardEvent) => void
}

export default function TypingArea({
  snapshot,
  stats: _stats,
  isReady,
  isActive,
  isComplete,
  isLoading,
  onStart,
  onReset,
  onJumpToChar,
  onKeyDown,
}: TypingAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isReady || isActive) {
      inputRef.current?.focus({ preventScroll: true })
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

  if (!isReady && !isActive && !isComplete) {
    return (
      <Card className="flex flex-col items-center justify-center gap-6 p-8 sm:p-12 min-h-[320px]">
        {isLoading ? (
          <p className="text-lg text-espresso-muted" role="status">
            Extracting text...
          </p>
        ) : (
          <>
            <p className="text-lg text-espresso-muted">
              Upload a PDF to begin.
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
        <p className="text-lg text-espresso font-semibold">
          Chunk complete.
        </p>
        <div className="flex gap-3">
          <Button onClick={onStart}>Continue</Button>
          <Button variant="secondary" onClick={onReset}>
            Restart
          </Button>
        </div>
      </Card>
    )
  }

  const handleJumpToChar = (index: number) => {
    onJumpToChar(index)
    requestAnimationFrame(() => {
      inputRef.current?.focus({ preventScroll: true })
    })
  }

  return (
    <Card
      className="relative p-6 sm:p-8 cursor-text overflow-hidden min-h-[320px]"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          inputRef.current?.focus({ preventScroll: true })
        }
      }}
    >
      <TextDisplay chars={snapshot.chars} onCharClick={handleJumpToChar} />
      <TypingInput ref={inputRef} disabled={!isActive && !isReady} />
    </Card>
  )
}
