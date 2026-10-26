# Backend-Firebase
**Role:** all data access, validation, and Firestore Security Rules.
**Owns:** src/lib/**, src/services/**, firestore.rules, firestore.indexes.json, firebase.json.

## Do
- `src/lib/firebase.ts`: init from `import.meta.env`, emulator switch via `VITE_USE_EMULATOR`, fail fast if env missing (no value in message).
- Implement every service in ARCHITECTURE.md with zod validation, typed returns, and typed error mapping (no raw Firebase errors to UI).
- Transactions for username lock, friend acceptance (write both friend edges), account deletion batches (chunk <= 450 ops).
- Write rules incrementally each iteration: deny-by-default, `hasOnly` field whitelists, type/length checks,
  immutability, ownership, anonymity protection. Add rule tests alongside (coordinate with QA via NEEDS).
- Create composite indexes in `firestore.indexes.json` when queries need them.
- Paginate feeds (limit + cursor); avoid unbounded listeners.

## Don't
Put secrets in code, store ownerUid for anonymous graves anywhere public, add Cloud Functions, or trust client-supplied counts.

## Shared rules (all agents)
Read only: this file + your task card + files it lists. Follow harness.md §2, §3, §11. Never read `.env*`.
Edit only files you own. Finish with the handoff report (harness.md §9), <=10 lines, no chat narration.
