# workflow
- Prioritize building the UI first before other modules when planning features. Confidence: 0.70

# tech-stack
- Use TypeScript strict mode with explicit types and no `any` — migrate `.jsx`/`.js` files to `.tsx`/`.ts`. Confidence: 0.70
- Use Tailwind CSS for styling with mobile-first responsive modifiers. Confidence: 0.70
- Use `@/*` path alias mapping to `src/*` for all internal imports. Confidence: 0.70
- Use Tesseract for OCR text extraction from scanned PDFs — do not use Gemini API. Confidence: 0.65

# code-style
- Group imports logically: React first, external libraries second, internal modules via `@/*` third. Confidence: 0.70

# ui-ux
- Every interactive element must have visible `:hover`, `:focus-visible`, and `:active` states. Confidence: 0.70
- Use semantic HTML (`<button>`, `<main>`, `<nav>`) and add `aria-*` attributes where native elements aren't enough. Confidence: 0.70
- Prefer minimal or hidden scrollbars in scrollable text areas — use subtle styling or hide entirely for a clean look. Confidence: 0.75

# rendering
- Explicitly map `\n` to `<br />` and use Tailwind's `whitespace-pre-wrap` on the parent container when rendering text with line breaks. Confidence: 0.50

# architecture
- For long text sources (books, PDFs), use page-wise batching/chunking instead of loading the entire document into memory at once. Confidence: 0.70
- Use SQLite for local persistence of uploaded/extracted text so users don't need to re-upload files. Confidence: 0.70

# typing-flow
- Auto-advance to the next chunk when the user finishes typing the current one — no manual pagination step needed. Confidence: 0.70
- Only PDF typing mode is needed — do not build or maintain other text source modes. Confidence: 0.85
