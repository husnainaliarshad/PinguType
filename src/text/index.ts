import type { TextSource } from '@/types/text'
import { librarySource } from './library'
import { randomSource } from './random'
import { pdfSource } from './pdfParser'
import { customSource } from './custom'

const sources: Record<string, TextSource> = {
  library: librarySource,
  random: randomSource,
  pdf: pdfSource,
  custom: customSource,
}

export function getTextSource(id: string): TextSource | undefined {
  return sources[id]
}

export function listTextSources(): TextSource[] {
  return Object.values(sources)
}
