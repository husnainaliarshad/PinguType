import type { TextSource, TextSourceConfig, TextDifficulty } from '@/types/text'

interface Passage {
  text: string
  difficulty: TextDifficulty
  category: string
}

const passages: Passage[] = [
  // --- Easy: Pangrams and short sentences ---
  {
    text: 'The quick brown fox jumps over the lazy dog.',
    difficulty: 'easy',
    category: 'pangrams',
  },
  {
    text: 'Pack my box with five dozen liquor jugs.',
    difficulty: 'easy',
    category: 'pangrams',
  },
  {
    text: 'How vexingly quick daft zebras jump!',
    difficulty: 'easy',
    category: 'pangrams',
  },
  {
    text: 'The five boxing wizards jump quickly.',
    difficulty: 'easy',
    category: 'pangrams',
  },
  {
    text: 'Sphinx of black quartz, judge my vow.',
    difficulty: 'easy',
    category: 'pangrams',
  },
  {
    text: 'Waltz, bad nymph, for quick jigs vex.',
    difficulty: 'easy',
    category: 'pangrams',
  },
  {
    text: 'A wizard\'s job is to vex chumps quickly in fog.',
    difficulty: 'easy',
    category: 'pangrams',
  },

  // --- Easy: Quotes ---
  {
    text: 'The best way to predict the future is to invent it.',
    difficulty: 'easy',
    category: 'quotes',
  },
  {
    text: 'Simplicity is the ultimate sophistication.',
    difficulty: 'easy',
    category: 'quotes',
  },
  {
    text: 'Stay hungry, stay foolish.',
    difficulty: 'easy',
    category: 'quotes',
  },
  {
    text: 'Less but better.',
    difficulty: 'easy',
    category: 'quotes',
  },

  // --- Medium: Code snippets ---
  {
    text: 'const greeting = "Hello, world!"; console.log(greeting);',
    difficulty: 'medium',
    category: 'code',
  },
  {
    text: 'function add(a: number, b: number): number { return a + b; }',
    difficulty: 'medium',
    category: 'code',
  },
  {
    text: 'const items = data.filter(item => item.active).map(item => item.name);',
    difficulty: 'medium',
    category: 'code',
  },
  {
    text: 'export default function App() { const [state, setState] = useState(null); return <div>{state}</div>; }',
    difficulty: 'medium',
    category: 'code',
  },

  // --- Medium: Quotes ---
  {
    text: 'First, solve the problem. Then, write the code.',
    difficulty: 'medium',
    category: 'quotes',
  },
  {
    text: 'Any fool can write code that a computer can understand. Good programmers write code that humans can understand.',
    difficulty: 'medium',
    category: 'quotes',
  },
  {
    text: 'Measuring programming progress by lines of code is like measuring aircraft building progress by weight.',
    difficulty: 'medium',
    category: 'quotes',
  },

  // --- Medium: Prose ---
  {
    text: 'It was a bright cold day in April, and the clocks were striking thirteen. Winston Smith, his chin nuzzled into his breast in an effort to escape the vile wind, slipped quickly through the glass doors of Victory Mansions.',
    difficulty: 'medium',
    category: 'prose',
  },

  // --- Hard: Code ---
  {
    text: 'async function fetchData<T>(url: string): Promise<T> { const res = await fetch(url); if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); }',
    difficulty: 'hard',
    category: 'code',
  },
  {
    text: 'const debounce = <T extends (...args: any[]) => void>(fn: T, delay: number) => { let timer: ReturnType<typeof setTimeout>; return (...args: Parameters<T>) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); }; };',
    difficulty: 'hard',
    category: 'code',
  },

  // --- Hard: Prose ---
  {
    text: 'In the beginning the Universe was created. This has made a lot of people very angry and been widely regarded as a bad move. Many races believe that it was created by some sort of God.',
    difficulty: 'hard',
    category: 'prose',
  },
  {
    text: 'It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife. However little known the feelings or views of such a man may be on his first entering a neighbourhood.',
    difficulty: 'hard',
    category: 'prose',
  },
  {
    text: 'The ships hung in the sky in much the same way that bricks don\'t. The Vogon Constructor Fleet coasted away into the inky starry void, leaving an ordinary, unremarkable planet behind it.',
    difficulty: 'hard',
    category: 'prose',
  },
  {
    text: 'All human beings are born free and equal in dignity and rights. They are endowed with reason and conscience and should act towards one another in a spirit of brotherhood.',
    difficulty: 'hard',
    category: 'quotes',
  },
]

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export const librarySource: TextSource = {
  id: 'library',
  name: 'Built-in Library',
  description: 'Curated passages from literature, coding, and famous quotes.',
  async getText(config?: TextSourceConfig): Promise<string> {
    let filtered = [...passages]

    if (config?.difficulty) {
      filtered = filtered.filter((p) => p.difficulty === config.difficulty)
    }

    if (config?.category) {
      filtered = filtered.filter(
        (p) => p.category.toLowerCase() === config.category?.toLowerCase(),
      )
    }

    if (filtered.length === 0) {
      filtered = [...passages]
    }

    const shuffled = shuffleArray(filtered)

    if (config?.wordCount && config.wordCount > 0) {
      let words: string[] = []
      let i = 0
      while (words.length < config.wordCount) {
        const passage = shuffled[i % shuffled.length]
        words = words.concat(passage.text.split(/\s+/))
        i++
      }
      return words.slice(0, config.wordCount).join(' ')
    }

    return shuffled[0].text
  },
}
