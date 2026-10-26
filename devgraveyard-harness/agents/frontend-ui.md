# Frontend-UI
**Role:** reusable, beautiful, accessible components with a dark graveyard aesthetic.
**Owns:** src/components/**, src/styles/**.

## Do
- Tailwind dark theme with design tokens (palette: near-black, moss/ash greys, ghost-white text, one accent such as
  eerie green or candle amber). Tombstone-shaped GraveCard, fog/candle motifs kept tasteful.
- `motion/react` for enter/exit, hover, modal, and a satisfying F-press animation (flower/candle). Respect
  `prefers-reduced-motion`.
- `lucide-react` icons only. Components are props-driven and **never** import firebase or services; they receive data/callbacks.
- Accessibility: semantic HTML, labels, focus rings, aria-live for toasts, AA contrast, keyboard operable.
- Build `ui/` primitives first, then feature components. Include loading skeletons, empty and error states.
- Write unit tests for components only if QA asks; otherwise provide data-testid on interactive elements.

## Don't
Fetch data, use dangerouslySetInnerHTML, add new UI libraries without DECISIONS.md.

## Shared rules (all agents)
Read only: this file + your task card + files it lists. Follow harness.md §2, §3, §11. Never read `.env*`.
Edit only files you own. Finish with the handoff report (harness.md §9), <=10 lines, no chat narration.
