import type { TextSource, TextSourceConfig, TextDifficulty } from '@/types/text'

const easyWords: string[] = [
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had',
  'her', 'was', 'one', 'our', 'out', 'has', 'him', 'his', 'how', 'its',
  'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did',
  'cat', 'dog', 'sun', 'big', 'red', 'run', 'sit', 'top', 'fun', 'hot',
  'cup', 'bed', 'map', 'pen', 'box', 'hat', 'sky', 'bus', 'day', 'egg',
  'fox', 'gem', 'ink', 'jam', 'key', 'log', 'net', 'owl', 'pie', 'rug',
]

const mediumWords: string[] = [
  'about', 'after', 'again', 'begin', 'below', 'carry', 'clean', 'close',
  'could', 'drive', 'early', 'every', 'field', 'first', 'found', 'great',
  'group', 'heard', 'horse', 'house', 'large', 'learn', 'light', 'money',
  'music', 'never', 'north', 'often', 'order', 'other', 'paper', 'party',
  'place', 'plant', 'point', 'press', 'quick', 'quite', 'reach', 'ready',
  'right', 'river', 'round', 'seven', 'shall', 'shape', 'sharp', 'since',
  'sleep', 'small', 'sound', 'south', 'speak', 'stand', 'start', 'state',
  'still', 'story', 'study', 'table', 'their', 'there', 'these', 'thing',
  'think', 'three', 'today', 'under', 'until', 'water', 'where', 'which',
  'while', 'white', 'whole', 'woman', 'world', 'would', 'write', 'young',
]

const hardWords: string[] = [
  'algorithm', 'ambiguous', 'bandwidth', 'benevolent', 'camouflage',
  'chronological', 'dichotomy', 'disseminate', 'ecclesiastical',
  'ephemeral', 'facetious', 'flabbergasted', 'grandiose', 'hierarchy',
  'idiosyncratic', 'juxtaposition', 'kaleidoscope', 'labyrinthine',
  'magnanimous', 'nomenclature', 'onomatopoeia', 'perspicacious',
  'quintessential', 'rambunctious', 'serendipity', 'tempestuous',
  'ubiquitous', 'verisimilitude', 'whimsical', 'xenophobia',
  'yesterday', 'zephyr', 'acquiesce', 'bourgeoisie', 'connoisseur',
  'disingenuous', 'entrepreneur', 'fluorescence', 'guerrilla',
  'hemorrhage', 'incandescent', 'jurisdiction', 'lackadaisical',
  'mnemonic', 'nonchalant', 'oscillate', 'precocious', 'questionnaire',
  'resilience', 'surreptitious',
]

const wordsByDifficulty: Record<TextDifficulty, string[]> = {
  easy: easyWords,
  medium: mediumWords,
  hard: hardWords,
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export const randomSource: TextSource = {
  id: 'random',
  name: 'Random Words',
  description: 'Generate random words at your chosen difficulty level.',
  async getText(config?: TextSourceConfig): Promise<string> {
    const difficulty: TextDifficulty = config?.difficulty ?? 'medium'
    const count = config?.wordCount ?? 25
    const wordList = wordsByDifficulty[difficulty]

    const result: string[] = []
    let lastWord = ''

    while (result.length < count) {
      const shuffled = shuffleArray(wordList)
      for (const word of shuffled) {
        if (result.length >= count) break
        if (word !== lastWord) {
          result.push(word)
          lastWord = word
        }
      }
    }

    return result.join(' ')
  },
}
