import type { TextSource } from '@/types/text'

const STORAGE_KEY = 'pingutype-custom-text'

export function getCustomText(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? ''
  } catch {
    return ''
  }
}

export function saveCustomText(text: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, text)
  } catch {
    // localStorage unavailable — silently fail
  }
}

export const customSource: TextSource = {
  id: 'custom',
  name: 'Custom Text',
  description: 'Type or paste your own text in Settings.',
  async getText(): Promise<string> {
    const text = getCustomText()
    if (!text) {
      throw new Error(
        'No custom text saved. Go to Settings to enter some text first.',
      )
    }
    return text
  },
}
