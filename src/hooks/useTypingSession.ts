import { useState, useCallback, useEffect } from 'react'
import { useTimer } from './useTimer'
import { useTypingEngine } from './useTypingEngine'
import { useTextSource } from './useTextSource'
import type { TextSourceConfig } from '@/types/text'
import type { TypingSnapshot, TypingStats } from '@/types/engine'

export type SessionPhase = 'idle' | 'ready' | 'active' | 'complete'

interface UseTypingSessionReturn {
  phase: SessionPhase
  snapshot: TypingSnapshot
  stats: TypingStats
  text: string
  isLoading: boolean
  error: string | null
  sourceId: string
  loadText: (sourceId: string, config?: TextSourceConfig) => Promise<void>
  startSession: () => void
  handleKeyDown: (e: KeyboardEvent) => void
  resetSession: () => void
}

export function useTypingSession(): UseTypingSessionReturn {
  const [phase, setPhase] = useState<SessionPhase>('idle')
  const timer = useTimer()
  const textSource = useTextSource()

  const getCurrentTime = useCallback(() => timer.elapsed, [timer.elapsed])

  const onStarted = useCallback(() => {
    timer.start()
    setPhase('active')
  }, [timer])

  const {
    snapshot,
    stats,
    init: engineInit,
    handleKeyDown,
    reset: engineReset,
  } = useTypingEngine(getCurrentTime, onStarted)

  const loadText = useCallback(
    async (sourceId: string, config?: TextSourceConfig) => {
      setPhase('idle')
      engineReset()
      timer.reset()
      await textSource.loadText(sourceId, config)
      setPhase('ready')
    },
    [engineReset, timer, textSource],
  )

  const startSession = useCallback(() => {
    if (!textSource.text) return
    engineInit(textSource.text)
    timer.reset()
    setPhase('ready')
  }, [engineInit, timer, textSource.text])

  const resetSession = useCallback(() => {
    engineReset()
    timer.reset()
    setPhase('idle')
  }, [engineReset, timer])

  useEffect(() => {
    if (snapshot.isComplete && phase === 'active') {
      setPhase('complete')
      timer.pause()
    }
  }, [snapshot.isComplete, phase, timer])

  return {
    phase,
    snapshot,
    stats,
    text: textSource.text,
    isLoading: textSource.isLoading,
    error: textSource.error,
    sourceId: textSource.sourceId,
    loadText,
    startSession,
    handleKeyDown,
    resetSession,
  }
}
