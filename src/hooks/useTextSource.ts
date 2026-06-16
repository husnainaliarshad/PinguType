import { useState, useCallback, useRef } from 'react'
import { getTextSource, isPaginatedSource } from '@/text'
import type { TextSourceConfig, PaginatedTextSource, PageInfo } from '@/types/text'

interface UseTextSourceReturn {
  text: string
  isLoading: boolean
  error: string | null
  sourceId: string
  pageInfo: PageInfo | null
  loadText: (sourceId: string, config?: TextSourceConfig) => Promise<string>
  setText: (text: string) => void
  nextChunk: () => Promise<string>
  prevChunk: () => Promise<string>
  goToChunk: (n: number) => Promise<string>
}

export function useTextSource(): UseTextSourceReturn {
  const [text, setText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sourceId, setSourceId] = useState('library')
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const activePaginatedRef = useRef<PaginatedTextSource | null>(null)

  const loadText = useCallback(
    async (id: string, config?: TextSourceConfig): Promise<string> => {
      const source = getTextSource(id)
      if (!source) {
        setError(`Unknown text source: ${id}`)
        return ''
      }

      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setIsLoading(true)
      setError(null)
      setSourceId(id)
      setPageInfo(null)

      try {
        const result = await source.getText(config)
        if (!controller.signal.aborted) {
          setText(result)
          setIsLoading(false)

          if (isPaginatedSource(source)) {
            activePaginatedRef.current = source
            setPageInfo(source.getPageInfo())
          } else {
            activePaginatedRef.current = null
          }

          return result
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          const message =
            err instanceof Error ? err.message : 'Failed to load text'
          setError(message)
          setIsLoading(false)
          activePaginatedRef.current = null
        }
      }

      return ''
    },
    [],
  )

  const nextChunk = useCallback(async (): Promise<string> => {
    const source = activePaginatedRef.current
    if (!source) throw new Error('No paginated source active')

    setIsLoading(true)
    setError(null)
    try {
      const chunk = await source.nextChunk()
      setText(chunk)
      setPageInfo(source.getPageInfo())
      return chunk
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load next chunk'
      setError(message)
      return ''
    } finally {
      setIsLoading(false)
    }
  }, [])

  const prevChunk = useCallback(async (): Promise<string> => {
    const source = activePaginatedRef.current
    if (!source) throw new Error('No paginated source active')

    setIsLoading(true)
    setError(null)
    try {
      const chunk = await source.prevChunk()
      setText(chunk)
      setPageInfo(source.getPageInfo())
      return chunk
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load previous chunk'
      setError(message)
      return ''
    } finally {
      setIsLoading(false)
    }
  }, [])

  const goToChunk = useCallback(async (n: number): Promise<string> => {
    const source = activePaginatedRef.current
    if (!source) throw new Error('No paginated source active')

    setIsLoading(true)
    setError(null)
    try {
      const chunk = await source.goToChunk(n)
      setText(chunk)
      setPageInfo(source.getPageInfo())
      return chunk
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to navigate'
      setError(message)
      return ''
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    text,
    isLoading,
    error,
    sourceId,
    pageInfo,
    loadText,
    setText,
    nextChunk,
    prevChunk,
    goToChunk,
  }
}
