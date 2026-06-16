export type CharStatus =
  | 'untouched'
  | 'correct'
  | 'incorrect'
  | 'current'
  | 'extra'

export interface CharState {
  char: string
  index: number
  status: CharStatus
}

export interface TypingSnapshot {
  chars: CharState[]
  cursorPosition: number
  totalKeystrokes: number
  correctKeystrokes: number
  incorrectKeystrokes: number
  extraKeystrokes: number
  backspaceCount: number
  startTime: number | null
  endTime: number | null
  isComplete: boolean
}

export interface TypingStats {
  wpm: number
  rawWpm: number
  accuracy: number
  timeElapsed: number
  errorCount: number
  totalChars: number
  completedChars: number
}

export interface TimerControls {
  start: () => void
  pause: () => void
  resume: () => void
  reset: () => void
  getElapsed: () => number
  isRunning: () => boolean
}
