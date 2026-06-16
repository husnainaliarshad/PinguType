export type TextDifficulty = 'easy' | 'medium' | 'hard'

export interface TextSourceConfig {
  wordCount?: number
  difficulty?: TextDifficulty
  category?: string
}

export interface TextSource {
  id: string
  name: string
  description: string
  getText(config?: TextSourceConfig): Promise<string>
}
