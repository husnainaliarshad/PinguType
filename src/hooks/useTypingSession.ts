import { useState, useCallback, useEffect } from 'react'
import { useTimer } from './useTimer'
import { useTypingEngine } from './useTypingEngine'
import { useTextSource } from './useTextSource'
import type { TextSourceConfig, PageInfo } from '@/types/text'
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
  pageInfo: PageInfo | null
  loadText: (sourceId: string, config?: TextSourceConfig) => Promise<string>
  startSession: () => void
  jumpToChar: (index: number) => void
  handleKeyDown: (e: KeyboardEvent) => void
  resetSession: () => void
  nextChunk: () => Promise<void>
  prevChunk: () => Promise<void>
  goToChunk: (n: number) => Promise<void>
}

export function useTypingSession(): UseTypingSessionReturn {
  const [phase, setPhase] = useState<SessionPhase>('idle')
  const timer = useTimer()
  const textSource = useTextSource()
  const {
    nextChunk: textNextChunk,
    prevChunk: textPrevChunk,
    goToChunk: textGoToChunk,
  } = textSource

  const getCurrentTime = useCallback(() => timer.elapsed, [timer.elapsed])

  const onStarted = useCallback(() => {
    timer.start()
    setPhase('active')
  }, [timer])

  const {
    snapshot,
    stats,
    init: engineInit,
    jumpTo: engineJumpTo,
    handleKeyDown,
    reset: engineReset,
  } = useTypingEngine(getCurrentTime, onStarted)

  const loadText = useCallback(
    async (sourceId: string, config?: TextSourceConfig): Promise<string> => {
      setPhase('idle')
      engineReset()
      timer.reset()
      const newText = await textSource.loadText(sourceId, config)
      engineInit(newText)
      setPhase('ready')
      return newText
    },
    [engineReset, engineInit, timer, textSource],
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

  const jumpToChar = useCallback((index: number) => {
    engineJumpTo(textSource.text, index)
  }, [engineJumpTo, textSource.text])

  const nextChunk = useCallback(async () => {
    setPhase('idle')
    engineReset()
    timer.reset()
    const newText = await textNextChunk()
    engineInit(newText)
    setPhase('ready')
  }, [engineReset, engineInit, timer, textNextChunk])

  const prevChunk = useCallback(async () => {
    setPhase('idle')
    engineReset()
    timer.reset()
    const newText = await textPrevChunk()
    engineInit(newText)
    setPhase('ready')
  }, [engineReset, engineInit, timer, textPrevChunk])

  const goToChunk = useCallback(async (n: number) => {
    setPhase('idle')
    engineReset()
    timer.reset()
    const newText = await textGoToChunk(n)
    engineInit(newText)
    setPhase('ready')
  }, [engineReset, engineInit, timer, textGoToChunk])

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
    pageInfo: textSource.pageInfo,
    loadText,
    startSession,
    jumpToChar,
    handleKeyDown,
    resetSession,
    nextChunk,
    prevChunk,
    goToChunk,
  }
}
