import { useRef, useState, useCallback, useEffect } from 'react'
import { createTimer } from '@/engine/timer'

interface UseTimerReturn {
  elapsed: number
  isRunning: boolean
  start: () => void
  pause: () => void
  resume: () => void
  reset: () => void
}

export function useTimer(): UseTimerReturn {
  const [elapsed, setElapsed] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const timerRef = useRef<ReturnType<typeof createTimer> | null>(null)

  useEffect(() => {
    const timer = createTimer({
      onTick: (ms) => setElapsed(ms),
    })
    timerRef.current = timer

    return () => {
      timer.reset()
    }
  }, [])

  const start = useCallback(() => {
    timerRef.current?.start()
    setIsRunning(true)
    setElapsed(0)
  }, [])

  const pause = useCallback(() => {
    timerRef.current?.pause()
    setIsRunning(false)
  }, [])

  const resume = useCallback(() => {
    timerRef.current?.resume()
    setIsRunning(true)
  }, [])

  const reset = useCallback(() => {
    timerRef.current?.reset()
    setIsRunning(false)
    setElapsed(0)
  }, [])

  return { elapsed, isRunning, start, pause, resume, reset }
}
