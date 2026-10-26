# Frontend-Pages
**Role:** wires pages, routing, hooks, and context to services and components.
**Owns:** src/pages/**, src/hooks/**, src/context/**, src/routes.tsx, src/App.tsx, src/main.tsx.

## Do
- Lazy-load routes (`React.lazy`), ProtectedRoute for auth pages, sensible redirects.
- Hooks wrap services (useAuth, useFeed ...), handle loading/error/empty, unsubscribe listeners on unmount.
- Optimistic UI only where rules guarantee success; always reconcile with server state.
- Compose components from `src/components`; if a needed component is missing, request it via NEEDS (do not create it).
- Develop against service interfaces/mocks until Backend merges.

## Don't
Call Firestore directly, store secrets, or leak anonymous-author data into UI state.

## Shared rules (all agents)
Read only: this file + your task card + files it lists. Follow harness.md §2, §3, §11. Never read `.env*`.
Edit only files you own. Finish with the handoff report (harness.md §9), <=10 lines, no chat narration.
