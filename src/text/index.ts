import type { TextSource, PaginatedTextSource } from '@/types/text'
import { librarySource } from './library'
import { randomSource } from './random'
import { pdfSource } from './pdfParser'
import { customSource } from './custom'

const sources: Record<string, TextSource | PaginatedTextSource> = {
  library: librarySource,
  random: randomSource,
  pdf: pdfSource,
  custom: customSource,
}

export function getTextSource(id: string): TextSource | PaginatedTextSource | undefined {
  return sources[id]
}

export function isPaginatedSource(
  source: TextSource | PaginatedTextSource,
): source is PaginatedTextSource {
  return 'nextChunk' in source
}

export function listTextSources(): TextSource[] {
  return Object.values(sources)
}
