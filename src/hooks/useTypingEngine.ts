import { useReducer, useCallback, useMemo, useRef } from 'react'
import {
  createInitialSnapshot,
  createJumpSnapshot,
  processKeystroke,
  calculateStats,
} from '@/engine/typingEngine'
import type { TypingSnapshot, TypingStats } from '@/types/engine'

type EngineAction =
  | { type: 'KEYSTROKE'; key: string; currentTime: number }
  | { type: 'INIT'; text: string }
  | { type: 'JUMP'; text: string; index: number }
  | { type: 'RESET' }

function engineReducer(
  state: TypingSnapshot,
  action: EngineAction,
): TypingSnapshot {
  switch (action.type) {
    case 'INIT':
      return createInitialSnapshot(action.text)
    case 'JUMP':
      return createJumpSnapshot(action.text, action.index)
    case 'KEYSTROKE':
      return processKeystroke(state, action.key, action.currentTime)
    case 'RESET':
      return createInitialSnapshot(
        state.chars
          .filter((c) => c.status !== 'extra')
          .map((c) => c.char)
          .join(''),
      )
    default:
      return state
  }
}

interface UseTypingEngineReturn {
  snapshot: TypingSnapshot
  stats: TypingStats
  init: (text: string) => void
  jumpTo: (text: string, index: number) => void
  handleKeyDown: (e: KeyboardEvent) => void
  reset: () => void
  isActive: boolean
}

export function useTypingEngine(
  getCurrentTime: () => number,
  onStarted?: () => void,
): UseTypingEngineReturn {
  const [snapshot, dispatch] = useReducer(
    engineReducer,
    createInitialSnapshot(''),
  )

  const hasStartedRef = useRef(false)
  const onStartedRef = useRef(onStarted)
  onStartedRef.current = onStarted

  const getCurrentTimeRef = useRef(getCurrentTime)
  getCurrentTimeRef.current = getCurrentTime

  const init = useCallback((text: string) => {
    hasStartedRef.current = false
    dispatch({ type: 'INIT', text })
  }, [])

  const jumpTo = useCallback((text: string, index: number) => {
    dispatch({ type: 'JUMP', text, index })
  }, [])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (
      e.key === 'Shift' ||
      e.key === 'Control' ||
      e.key === 'Alt' ||
      e.key === 'Meta' ||
      e.key === 'CapsLock' ||
      e.key === 'Tab' ||
      e.key === 'Escape' ||
      e.key === 'ArrowLeft' ||
      e.key === 'ArrowRight' ||
      e.key === 'ArrowUp' ||
      e.key === 'ArrowDown' ||
      e.key === 'Home' ||
      e.key === 'End'
    ) {
      return
    }

    if (!hasStartedRef.current && e.key.length === 1) {
      hasStartedRef.current = true
      onStartedRef.current?.()
    }

    const time = getCurrentTimeRef.current()
    dispatch({ type: 'KEYSTROKE', key: e.key, currentTime: time })
  }, [])

  const reset = useCallback(() => {
    hasStartedRef.current = false
    dispatch({ type: 'RESET' })
  }, [])

  const stats = useMemo(
    () => calculateStats(snapshot, getCurrentTime()),
    [snapshot, getCurrentTime],
  )

  const isActive = snapshot.totalKeystrokes > 0 && !snapshot.isComplete

  return {
    snapshot,
    stats,
    init,
    jumpTo,
    handleKeyDown,
    reset,
    isActive,
  }
}
