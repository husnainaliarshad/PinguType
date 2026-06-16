# PinguType — Architecture & Implementation Plan

**UI-First approach.** Each phase builds a complete, visually polished layer before wiring in logic underneath.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      PAGES / ROUTES                      │
│   HomePage    TypingPage    ResultsPage    SettingsPage  │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                   UI COMPONENTS                          │
│   Layout    TypingArea    StatsPanel    NavBar    etc.   │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                    HOOKS LAYER                           │
│   useTypingEngine   useTimer   useTextSource   useStats  │
└────────┬──────────────────────────────────┬─────────────┘
         │                                  │
┌────────▼──────────┐          ┌────────────▼─────────────┐
│   TYPING ENGINE    │          │     TEXT SOURCES          │
│  (pure functions)  │          │  Library | Random | PDF   │
└────────────────────┘          └──────────────────────────┘
```

**Inter-module contracts are defined by TypeScript interfaces.** Each module is independently testable and has zero knowledge of the UI layer.

---

## Phase 0 — Project Foundations

**Goal:** Migrate to TypeScript + Tailwind. Set up tooling, aliases, and dependency baseline.

### Step 0.1 — TypeScript Migration
- Install `typescript`, `@types/react`, `@types/react-dom`
- Create `tsconfig.json` with strict mode, path aliases (`@/*` → `src/*`)
- Rename all `.jsx`/`.js` → `.tsx`/`.ts`
- Add type declarations for Vite env and assets

### Step 0.2 — Tailwind CSS Setup
- Install `tailwindcss`, `@tailwindcss/vite`, `postcss`
- Create `tailwind.config.ts` with content paths
- Add `@tailwind` directives to `src/index.css`
- Configure Vite plugin for Tailwind

### Step 0.3 — Path Aliases
- Wire `@/*` → `src/*` in both `tsconfig.json` and `vite.config.ts`
- Verify imports work across the project

### Step 0.4 — Core Dependencies
| Package | Purpose |
|---|---|
| `lucide-react` | Icon library |
| `react-router-dom` | Client-side routing |
| `pdfjs-dist` | PDF text extraction |

### Step 0.5 — Directory Structure
```
src/
├── components/        # Reusable UI components
│   ├── layout/        # App shell, nav, header
│   ├── typing/        # Typing area sub-components
│   └── ui/            # Generic primitives (Button, Modal, etc.)
├── engine/            # Pure typing logic (no React)
├── hooks/             # Custom React hooks
├── pages/             # Route-level page components
├── text/              # Text sources & parsers
├── types/             # Shared TypeScript interfaces
├── utils/             # Pure utility functions
├── App.tsx            # Root with router
├── main.tsx           # Entry point
└── index.css          # Tailwind directives + globals
```

---

## Phase 1 — UI Foundation (Build visuals first, no logic)

**Goal:** A complete, polished, static UI for the typing experience. Every component renders with mock data. Zero business logic.

### Step 1.1 — Design Tokens & Theme (`src/index.css`)
- Define CSS custom properties: `--color-primary`, `--color-bg`, `--color-surface`, `--color-text`, `--color-accent`, `--color-error`, `--color-correct`, `--color-incorrect`, `--color-current`
- Define font stack (monospace for typing area, sans-serif for chrome)
- Define spacing scale
- Dark theme as default, light theme toggleable later

### Step 1.2 — Layout Shell (`src/components/layout/`)
- **`Layout.tsx`** — Full-page flexbox shell: header (top bar), `<main>` (content slot via `<Outlet />`), footer
- **`Header.tsx`** — Logo/title, navigation links, theme toggle placeholder
- **`Footer.tsx`** — Minimal footer with credits/links

### Step 1.3 — Typing Area (`src/components/typing/`)
This is the heart of the UI. Break into sub-components:

- **`TypingArea.tsx`** — Orchestrator: renders target text display + input + stats
  - Props: `text: string`, `isActive: boolean` (mock defaults)
  - Layout: centered card, max-w-3xl, responsive padding

- **`TextDisplay.tsx`** — Renders target text character-by-character with per-character styling
  - Each character is a `<span>` with a data attribute for its index
  - Visual states per character: `untouched` (muted), `current` (highlighted with cursor), `correct` (green), `incorrect` (red underline)
  - Props: `text: string`, `userInput: string`

- **`TypingInput.tsx`** — Hidden/styled text input that captures keystrokes
  - Auto-focused on mount/activation
  - Handles paste prevention, disabled state
  - Emits: `onInput(value: string)`, `onComplete()`

- **`Cursor.tsx`** — Blinking cursor overlay positioned at the current character

- **`StatsBar.tsx`** — Real-time stats display (mock values initially)
  - Shows: WPM, Accuracy %, Time elapsed, Error count
  - Compact horizontal layout below or beside the typing area
  - Props: `wpm: number`, `accuracy: number`, `time: number`, `errors: number`

### Step 1.4 — Navigation (`src/components/layout/NavBar.tsx`)
- Horizontal nav links: Home, Practice, Results, Settings
- Active route highlighting
- Mobile: hamburger menu (implement later)

### Step 1.5 — UI Primitives (`src/components/ui/`)
- **`Button.tsx`** — Styled button with variants: `primary`, `secondary`, `ghost`, `danger`
  - Props: `variant`, `size`, `disabled`, `onClick`, `children`
  - States: hover, focus-visible, active, disabled
- **`Card.tsx`** — Generic card container with shadow/rounded corners
- **`Modal.tsx`** — Overlay modal with backdrop, close button, focus trap
- **`ProgressBar.tsx`** — Thin horizontal progress indicator
- **`Select.tsx`** — Styled dropdown
- **`Toggle.tsx`** — Switch/toggle component

### Step 1.6 — Pages (Static shells)
- **`HomePage.tsx`** — Hero section with logo, tagline, "Start Typing" CTA, mode selection cards
- **`TypingPage.tsx`** — Composes `TypingArea` + `StatsBar`, start/restart controls
- **`ResultsPage.tsx`** — Mock results card with WPM, accuracy, errors, time, a "Try Again" button
- **`SettingsPage.tsx`** — Settings form (duration, difficulty, text source) — non-functional UI only

### Step 1.7 — Router Setup (`src/App.tsx`)
- `react-router-dom` BrowserRouter with routes:
  - `/` → `HomePage`
  - `/practice` → `TypingPage`
  - `/results` → `ResultsPage`
  - `/settings` → `SettingsPage`

**Phase 1 exit criteria:** Navigate between all pages. Typing area renders with mock text and styled characters. All components have proper hover/focus/active states. Responsive at mobile breakpoints.

---

## Phase 2 — Typing Engine (Pure logic, zero UI dependency)

**Goal:** A standalone, framework-agnostic typing engine with well-defined inputs/outputs.

### Step 2.1 — Core Types (`src/types/engine.ts`)

```ts
interface CharState {
  char: string;
  index: number;
  status: 'untouched' | 'correct' | 'incorrect' | 'current' | 'extra';
}

interface TypingSnapshot {
  chars: CharState[];
  cursorPosition: number;
  totalKeystrokes: number;
  correctKeystrokes: number;
  incorrectKeystrokes: number;
  startTime: number | null;
  endTime: number | null;
  isComplete: boolean;
}

interface TypingStats {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  timeElapsed: number;
  errorCount: number;
  totalChars: number;
  completedChars: number;
}
```

### Step 2.2 — Engine Core (`src/engine/typingEngine.ts`)

Pure functions — no classes, no side effects:

- **`createInitialSnapshot(text: string): TypingSnapshot`**
  - Builds `CharState[]` from the target text string
  - All chars start as `'untouched'`, first char is `'current'`

- **`processKeystroke(snapshot: TypingSnapshot, key: string): TypingSnapshot`**
  - Compares `key` against the character at `cursorPosition`
  - Updates char status: `correct` (match), `incorrect` (mismatch), `extra` (typing past end)
  - Advances cursor for correct keystrokes
  - Tracks keystroke counts
  - Sets `startTime` on first keystroke if null
  - Sets `endTime` when all target chars are correctly typed and no extras remain (or on explicit completion)
  - Ignores non-printable characters, backspace handled separately

- **`processBackspace(snapshot: TypingSnapshot): TypingSnapshot`**
  - Moves cursor back one position
  - Resets the previous char to `'untouched'`
  - If at an `'extra'` char, removes it
  - Handles edge: cursor at position 0 (no-op)

- **`calculateStats(snapshot: TypingSnapshot, currentTime: number): TypingStats`**
  - WPM = (correctKeystrokes / 5) / (timeElapsed in minutes)
  - rawWPM = (totalKeystrokes / 5) / (timeElapsed in minutes)
  - accuracy = (correctKeystrokes / totalKeystrokes) * 100
  - timeElapsed = (endTime ?? currentTime) - startTime
  - Error count, total/completed chars

### Step 2.3 — Timer (`src/engine/timer.ts`)

- **`createTimer(onTick: (elapsed: number) => void, interval?: number): Timer`**
  - Returns `{ start, pause, resume, reset, getElapsed }`
  - Uses `performance.now()` for precision
  - `onTick` called at configurable interval (default 100ms)

### Step 2.4 — Engine Tests (future)

**Phase 2 exit criteria:** Pure functions are independently testable. `processKeystroke` handles all edge cases (backspace, extra chars, completion). `calculateStats` returns correct WPM/accuracy math.

---

## Phase 3 — Text Sources

**Goal:** Multiple text input sources, all conforming to a common interface.

### Step 3.1 — Text Source Interface (`src/types/text.ts`)

```ts
interface TextSource {
  id: string;
  name: string;
  description: string;
  getText(config?: TextSourceConfig): Promise<string>;
}

interface TextSourceConfig {
  wordCount?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string;
  file?: File;
}
```

### Step 3.2 — Built-in Library (`src/text/library.ts`)
- Curated array of ~50 text passages of varying length and difficulty
- Categories: quotes, code snippets, prose, pangrams
- `getText()` returns a random passage, optionally filtered by difficulty/length

### Step 3.3 — Random Word Generator (`src/text/random.ts`)
- Word lists by difficulty tier
- Generates N random words as a space-separated string
- No consecutive repeats, sensible punctuation

### Step 3.4 — PDF Parser (`src/text/pdfParser.ts`)
- Uses `pdfjs-dist` with CDN worker
- Asynchronous page-by-page token ingestion
- Sanitization pipeline: collapse multi-spaces, trim, normalize typography (smart quotes → straight quotes, em-dashes → hyphens)
- Returns plain text string

### Step 3.5 — Custom Text Input
- Simple textarea-based input on the Settings page
- Stored in `localStorage` for persistence
- Min/max length validation

**Phase 3 exit criteria:** All text sources return clean, typable strings. PDF parser handles real-world PDFs. Random generator produces varied, non-repetitive text.

---

## Phase 4 — Hooks Layer (Bridge engine ↔ UI)

**Goal:** React hooks that connect the pure engine to React state, exposing clean APIs to components.

### Step 4.1 — `useTypingEngine(text: string)` (`src/hooks/useTypingEngine.ts`)
- Takes target text, returns:
  - `snapshot: TypingSnapshot` — current state
  - `stats: TypingStats` — recalculated on each render
  - `handleKeyDown: (e: KeyboardEvent) => void` — attach to input
  - `reset: () => void`
  - `isActive: boolean`
  - `isComplete: boolean`
- Uses `useReducer` internally (engine is pure, reducer calls `processKeystroke` / `processBackspace`)
- Attaches/detaches keyboard listener

### Step 4.2 — `useTimer()` (`src/hooks/useTimer.ts`)
- Wraps the `timer.ts` engine
- Returns `{ elapsed, isRunning, start, pause, resume, reset }`
- Uses `useRef` for timer instance, `useState` for elapsed display

### Step 4.3 — `useTextSource()` (`src/hooks/useTextSource.ts`)
- Manages text source selection, loading state, errors
- Returns `{ text, isLoading, error, loadText, source }`
- Handles async text fetching with AbortController

### Step 4.4 — `useTypingSession()` (`src/hooks/useTypingSession.ts`)
- Composes `useTypingEngine` + `useTimer` + `useTextSource` into one hook
- Orchestrates: load text → start timer on first keystroke → track completion
- Returns everything pages need in one object

**Phase 4 exit criteria:** Hooks are fully typed. Components can swap from mock data to real hooks with minimal changes. `useTypingSession` handles the full typing lifecycle.

---

## Phase 5 — Wire Everything Together

**Goal:** Replace all static/mock data in UI components with real hooks and state.

### Step 5.1 — Wire TypingPage
- Replace mock `TextDisplay` props with `useTypingSession` data
- Wire `TypingInput` to `handleKeyDown`
- Wire `StatsBar` to live `stats` object
- Add start/restart flow: "Click to start" → typing → completion → results

### Step 5.2 — Wire ResultsPage
- Receive session results via route state or context
- Display: WPM, accuracy, raw WPM, time, error breakdown
- "Try Again" and "New Text" buttons

### Step 5.3 — Wire SettingsPage
- Text source selector (library, random, PDF, custom)
- Word count / difficulty sliders
- Duration setting (timed mode or free typing)
- Persist settings to `localStorage`

### Step 5.4 — Keyboard Visualization (Bonus)
- On-screen keyboard that highlights pressed keys
- Color-coded for correct/incorrect finger positioning
- Toggleable in settings

---

## Phase 6 — Polish & Production Readiness

### Step 6.1 — Animations
- Character transitions on state change (correct/incorrect flash)
- Cursor blink animation
- Page transitions between routes
- Stats counting animation on results page

### Step 6.2 — Sound (Optional)
- Subtle keystroke sounds
- Error feedback sound
- Completion chime
- Toggleable in settings

### Step 6.3 — Accessibility
- Full keyboard navigation
- Screen reader announcements for stats changes
- Focus management on page transitions
- `prefers-reduced-motion` respects

### Step 6.4 — Performance
- `React.memo` on `CharDisplay` (individual character spans)
- `useMemo` for `CharState[]` array and stats calculations
- Virtual scrolling if handling very long texts
- Lazy-loaded routes with `React.lazy`

### Step 6.5 — Error Handling
- PDF parse failure → user-friendly error toast
- Text source load failure → fallback to library
- Graceful degradation if `localStorage` is unavailable

### Step 6.6 — Responsive / Mobile
- Full mobile layout with adjusted font sizes
- On-screen keyboard as primary input on touch devices
- Touch-friendly button sizes

---

## Module Dependency Graph

```
                    ┌──────────┐
                    │  types/  │  (zero deps)
                    └────┬─────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
    ┌──────────┐  ┌──────────┐  ┌──────────┐
    │ engine/  │  │  text/   │  │  utils/  │  (depend on types/)
    └────┬─────┘  └────┬─────┘  └──────────┘
         │              │
         └──────┬───────┘
                ▼
          ┌──────────┐
          │  hooks/  │  (depend on engine/, text/, types/)
          └────┬─────┘
               │
               ▼
         ┌──────────┐
         │components/│ (depend on hooks/, types/)
         └────┬─────┘
              │
              ▼
         ┌──────────┐
         │  pages/  │  (depend on components/, hooks/)
         └────┬─────┘
              │
              ▼
         ┌──────────┐
         │  App.tsx │  (composes pages with router)
         └──────────┘
```

**Integration is guaranteed by the type contracts.** Each layer only imports from the layers below it. No circular dependencies. A component can be built with mock data first (Phase 1), then swap in real hooks (Phase 5) without changing its prop interface.

---

## Implementation Order Summary

| Phase | What | Output |
|---|---|---|
| **0** | TS + Tailwind + deps + structure | Buildable project |
| **1** | Complete static UI | All pages visible, styled, responsive |
| **2** | Typing engine | Pure functions, testable |
| **3** | Text sources | Library, random, PDF parser |
| **4** | React hooks | Bridge engine ↔ UI |
| **5** | Wire everything | Working typing app |
| **6** | Polish | Animations, a11y, perf, error handling |

**Ready to start Phase 0 on your signal.**
