import type { TypingSnapshot, TypingStats } from '@/types/engine'

const PRINTABLE_KEY_REGEX = /^[ -~]$/

export function createInitialSnapshot(text: string): TypingSnapshot {
  const chars = text.split('').map((char, index) => ({
    char,
    index,
    status: index === 0 ? ('current' as const) : ('untouched' as const),
  }))

  return {
    chars,
    cursorPosition: 0,
    totalKeystrokes: 0,
    correctKeystrokes: 0,
    incorrectKeystrokes: 0,
    extraKeystrokes: 0,
    backspaceCount: 0,
    startTime: null,
    endTime: null,
    isComplete: false,
  }
}

export function createJumpSnapshot(
  text: string,
  targetIndex: number,
): TypingSnapshot {
  const chars = text.split('').map((char, index) => {
    if (index < targetIndex) return { char, index, status: 'correct' as const }
    if (index === targetIndex) return { char, index, status: 'current' as const }
    return { char, index, status: 'untouched' as const }
  })

  return {
    chars,
    cursorPosition: targetIndex,
    totalKeystrokes: 0,
    correctKeystrokes: 0,
    incorrectKeystrokes: 0,
    extraKeystrokes: 0,
    backspaceCount: 0,
    startTime: null,
    endTime: null,
    isComplete: false,
  }
}

export function processKeystroke(
  snapshot: TypingSnapshot,
  key: string,
  currentTime: number,
): TypingSnapshot {
  if (key === 'Backspace') {
    return processBackspace(snapshot)
  }

  if (key.length !== 1 || !PRINTABLE_KEY_REGEX.test(key)) {
    return snapshot
  }

  if (snapshot.isComplete) {
    return snapshot
  }

  const startTime = snapshot.startTime ?? currentTime

  let { cursorPosition, chars } = snapshot
  let correct = snapshot.correctKeystrokes
  let incorrect = snapshot.incorrectKeystrokes
  let extra = snapshot.extraKeystrokes

  const targetLen = chars.filter((c) => c.status !== 'extra').length

  if (cursorPosition < targetLen) {
    const targetChar = chars[cursorPosition]
    if (key === targetChar.char) {
      chars = chars.map((c, i) =>
        i === cursorPosition ? { ...c, status: 'correct' as const } : c,
      )
      correct++
    } else {
      chars = chars.map((c, i) =>
        i === cursorPosition ? { ...c, status: 'incorrect' as const } : c,
      )
      incorrect++
    }
  } else {
    chars = [
      ...chars,
      {
        char: key,
        index: cursorPosition,
        status: 'extra' as const,
      },
    ]
    extra++
  }

  cursorPosition++

  if (cursorPosition < targetLen) {
    chars = chars.map((c, i) =>
      i === cursorPosition ? { ...c, status: 'current' as const } : c,
    )
  }

  const completedTarget = chars
    .slice(0, targetLen)
    .every((c) => c.status === 'correct')
  const noExtras = cursorPosition <= targetLen

  return {
    chars,
    cursorPosition,
    totalKeystrokes: snapshot.totalKeystrokes + 1,
    correctKeystrokes: correct,
    incorrectKeystrokes: incorrect,
    extraKeystrokes: extra,
    backspaceCount: snapshot.backspaceCount,
    startTime,
    endTime: completedTarget && noExtras ? currentTime : null,
    isComplete: completedTarget && noExtras,
  }
}

export function processBackspace(snapshot: TypingSnapshot): TypingSnapshot {
  if (snapshot.cursorPosition === 0) {
    return snapshot
  }

  let { cursorPosition, chars } = snapshot
  let extra = snapshot.extraKeystrokes
  let correct = snapshot.correctKeystrokes
  let incorrect = snapshot.incorrectKeystrokes

  cursorPosition--

  const targetLen = chars.filter((c) => c.status !== 'extra').length
  const charAtCursor = chars[cursorPosition]

  if (charAtCursor && charAtCursor.status === 'extra') {
    chars = chars.slice(0, -1)
    extra = Math.max(0, extra - 1)
  } else if (charAtCursor) {
    const prevStatus = charAtCursor.status
    if (prevStatus === 'correct') {
      correct = Math.max(0, correct - 1)
    } else if (prevStatus === 'incorrect') {
      incorrect = Math.max(0, incorrect - 1)
    }
    chars = chars.map((c, i) =>
      i === cursorPosition ? { ...c, status: 'untouched' as const } : c,
    )
  }

  if (cursorPosition < targetLen) {
    chars = chars.map((c, i) =>
      i === cursorPosition ? { ...c, status: 'current' as const } : c,
    )
  }

  return {
    chars,
    cursorPosition,
    totalKeystrokes: snapshot.totalKeystrokes + 1,
    correctKeystrokes: correct,
    incorrectKeystrokes: incorrect,
    extraKeystrokes: extra,
    backspaceCount: snapshot.backspaceCount + 1,
    startTime: snapshot.startTime,
    endTime: null,
    isComplete: false,
  }
}

export function calculateStats(
  snapshot: TypingSnapshot,
  currentTime: number,
): TypingStats {
  const targetLen = snapshot.chars.filter((c) => c.status !== 'extra').length
  const startTime = snapshot.startTime ?? currentTime
  const endTime = snapshot.endTime ?? currentTime
  const timeElapsedMs = endTime - startTime
  const timeElapsedSec = Math.max(0.001, timeElapsedMs / 1000)
  const timeElapsedMin = timeElapsedSec / 60

  const totalKeystrokes = snapshot.totalKeystrokes - snapshot.backspaceCount
  const correctChars = snapshot.correctKeystrokes

  const rawWpm = timeElapsedMin > 0 ? totalKeystrokes / 5 / timeElapsedMin : 0
  const wpm = timeElapsedMin > 0 ? correctChars / 5 / timeElapsedMin : 0

  const accuracy =
    snapshot.totalKeystrokes > 0
      ? ((snapshot.totalKeystrokes -
          snapshot.incorrectKeystrokes -
          snapshot.extraKeystrokes -
          snapshot.backspaceCount) /
          snapshot.totalKeystrokes) *
        100
      : 100

  const accuracyClamped = Math.max(0, Math.min(100, accuracy))

  const completedChars = snapshot.chars
    .slice(0, targetLen)
    .filter((c) => c.status === 'correct').length

  return {
    wpm,
    rawWpm,
    accuracy: Math.round(accuracyClamped * 10) / 10,
    timeElapsed: Math.round(timeElapsedSec * 10) / 10,
    errorCount:
      snapshot.incorrectKeystrokes +
      snapshot.extraKeystrokes +
      snapshot.backspaceCount,
    totalChars: targetLen,
    completedChars,
  }
}
