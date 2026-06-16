import { memo, useRef, useEffect } from 'react'
import type { CharState } from '@/types/engine'

interface CharSpanProps {
  charState: CharState
  onClick?: (index: number) => void
}

const CharSpan = memo(function CharSpan({ charState, onClick }: CharSpanProps) {
  const { char, status, index } = charState

  if (char === '\n') {
    return (
      <br
        data-index={index}
        data-status={status}
      />
    )
  }

  let className = 'transition-colors duration-100'

  switch (status) {
    case 'untouched':
      className += ' text-text-muted/50'
      break
    case 'correct':
      className += ' text-correct animate-[char-pop_150ms_ease-out]'
      break
    case 'incorrect':
      className +=
        ' text-incorrect underline decoration-incorrect/60 decoration-wavy underline-offset-4 animate-[char-shake_250ms_ease-out]'
      break
    case 'current':
      className +=
        ' text-current-char bg-current-char/10 rounded-sm -mx-px px-px'
      break
    case 'extra':
      className += ' text-incorrect/70 line-through'
      break
  }

  return (
    <span
      data-index={index}
      data-status={status}
      className={`${className} cursor-pointer`}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.(index)
      }}
    >
      {char}
    </span>
  )
})

interface TextDisplayProps {
  chars: CharState[]
  onCharClick?: (index: number) => void
}

export default function TextDisplay({ chars, onCharClick }: TextDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const currentIndex = chars.findIndex((c) => c.status === 'current')

  useEffect(() => {
    if (currentIndex === -1 || !containerRef.current) return

    const container = containerRef.current
    const el = container.querySelector(
      `[data-index="${currentIndex}"]`,
    )
    if (el instanceof HTMLElement) {
      const elTop = el.offsetTop
      const elBottom = elTop + el.offsetHeight
      const viewTop = container.scrollTop
      const viewBottom = viewTop + container.clientHeight

      if (elTop < viewTop + 40) {
        container.scrollTo({ top: Math.max(0, elTop - 60), behavior: 'auto' })
      } else if (elBottom > viewBottom - 40) {
        container.scrollTo({ top: elBottom - container.clientHeight + 60, behavior: 'auto' })
      }
    }
  }, [currentIndex])

  return (
    <div
      ref={containerRef}
      className="font-mono text-xl sm:text-2xl leading-relaxed tracking-wide whitespace-pre-wrap break-words select-none max-h-[60vh] overflow-y-auto scrollbar-thin"
      aria-live="polite"
      aria-label="Text to type"
    >
      {chars.map((charState) => (
        <CharSpan
          key={charState.index}
          charState={charState}
          onClick={onCharClick}
        />
      ))}
    </div>
  )
}
