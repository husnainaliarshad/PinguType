# workflow
- Prioritize building the UI first before other modules when planning features. Confidence: 0.70

# tech-stack
- Use TypeScript strict mode with explicit types and no `any` — migrate `.jsx`/`.js` files to `.tsx`/`.ts`. Confidence: 0.70
- Use Tailwind CSS for styling with mobile-first responsive modifiers. Confidence: 0.70
- Use `@/*` path alias mapping to `src/*` for all internal imports. Confidence: 0.70

# code-style
- Group imports logically: React first, external libraries second, internal modules via `@/*` third. Confidence: 0.70

# ui-ux
- Every interactive element must have visible `:hover`, `:focus-visible`, and `:active` states. Confidence: 0.70
- Use semantic HTML (`<button>`, `<main>`, `<nav>`) and add `aria-*` attributes where native elements aren't enough. Confidence: 0.70
