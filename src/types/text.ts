export type TextDifficulty = 'easy' | 'medium' | 'hard'

export interface TextSourceConfig {
  wordCount?: number
  difficulty?: TextDifficulty
  category?: string
}

export interface PageInfo {
  current: number
  total: number
  chunkSize: number
}

export interface PaginatedTextSource {
  id: string
  name: string
  description: string
  getText(config?: TextSourceConfig): Promise<string>
  getPageInfo(): PageInfo | null
  nextChunk(): Promise<string>
  prevChunk(): Promise<string>
  goToChunk(n: number): Promise<string>
  reset(): void
}

export type TextSource = {
  id: string
  name: string
  description: string
  getText(config?: TextSourceConfig): Promise<string>
}
