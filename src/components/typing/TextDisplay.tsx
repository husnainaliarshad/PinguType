import { memo } from 'react'
import type { CharState } from '@/types/engine'

interface CharSpanProps {
  charState: CharState
}

const CharSpan = memo(function CharSpan({ charState }: CharSpanProps) {
  const { char, status, index } = charState

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
      className={className}
    >
      {char}
    </span>
  )
})

interface TextDisplayProps {
  chars: CharState[]
}

export default function TextDisplay({ chars }: TextDisplayProps) {
  return (
    <div
      className="font-mono text-xl sm:text-2xl leading-relaxed tracking-wide whitespace-pre-wrap break-words select-none"
      aria-live="polite"
      aria-label="Text to type"
    >
      {chars.map((charState) => (
        <CharSpan key={charState.index} charState={charState} />
      ))}
    </div>
  )
}
