import { useState, useCallback, useRef } from 'react'
import { getTextSource } from '@/text'
import type { TextSource, TextSourceConfig } from '@/types/text'

interface UseTextSourceReturn {
  text: string
  isLoading: boolean
  error: string | null
  sourceId: string
  loadText: (sourceId: string, config?: TextSourceConfig) => Promise<void>
  setText: (text: string) => void
}

export function useTextSource(): UseTextSourceReturn {
  const [text, setText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sourceId, setSourceId] = useState('library')
  const abortRef = useRef<AbortController | null>(null)

  const loadText = useCallback(
    async (id: string, config?: TextSourceConfig) => {
      const source: TextSource | undefined = getTextSource(id)
      if (!source) {
        setError(`Unknown text source: ${id}`)
        return
      }

      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setIsLoading(true)
      setError(null)
      setSourceId(id)

      try {
        const result = await source.getText(config)
        if (!controller.signal.aborted) {
          setText(result)
          setIsLoading(false)
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          const message =
            err instanceof Error ? err.message : 'Failed to load text'
          setError(message)
          setIsLoading(false)
        }
      }
    },
    [],
  )

  return { text, isLoading, error, sourceId, loadText, setText }
}
