import type { TimerControls } from '@/types/engine'

interface TimerOptions {
  onTick: (elapsedMs: number) => void
}

export function createTimer({ onTick }: TimerOptions): TimerControls {
  let startTimestamp: number | null = null
  let accumulatedMs = 0
  let rafId: number | null = null
  let running = false

  function loop() {
    if (!running || startTimestamp === null) return

    const now = performance.now()
    const elapsed = accumulatedMs + (now - startTimestamp)
    onTick(elapsed)

    rafId = requestAnimationFrame(loop)
  }

  function start() {
    if (running) return
    running = true
    startTimestamp = performance.now()
    accumulatedMs = 0
    rafId = requestAnimationFrame(loop)
  }

  function pause() {
    if (!running || startTimestamp === null) return
    running = false
    accumulatedMs += performance.now() - startTimestamp
    startTimestamp = null
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  function resume() {
    if (running) return
    running = true
    startTimestamp = performance.now()
    rafId = requestAnimationFrame(loop)
  }

  function reset() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
    running = false
    startTimestamp = null
    accumulatedMs = 0
  }

  function getElapsed(): number {
    if (!running || startTimestamp === null) {
      return accumulatedMs
    }
    return accumulatedMs + (performance.now() - startTimestamp)
  }

  function isRunning(): boolean {
    return running
  }

  return { start, pause, resume, reset, getElapsed, isRunning }
}
