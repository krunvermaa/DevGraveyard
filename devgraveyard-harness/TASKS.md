# TASKS.md
_Owner: Orchestrator. One card per task. Status: todo | doing | blocked | done._

## Card template
```
### T<iter>.<n> <title>      [status]
owner: <agent>   wave: A|B|C|D
inputs:  <files to read>
outputs: <files to create/change>   (must be disjoint within a wave)
accept:  <testable criteria>
tests:   <unit|integration|system|blackbox|whitebox needed>
```

## Iteration 0 — Setup
### T0.1 Scaffold project & deps   [todo]
owner: Architect+DevOps  wave: A
outputs: package.json, vite/ts/tailwind/eslint/vitest/playwright configs, folder skeleton, .env.example, .gitignore, .gitleaks.toml
accept: `npm run verify` passes on empty app; folder tree matches ARCHITECTURE.md
### T0.2 Firebase init + rules skeleton   [todo]
owner: Backend-Firebase  wave: B
outputs: src/lib/firebase.ts, firestore.rules (deny-all baseline), firebase.json, emulator config
accept: app boots against emulator; rules deny by default
### T0.3 CI + first Vercel deploy   [todo]
owner: DevOps  wave: B
outputs: .github/workflows/ci.yml, vercel.json
accept: CI green; live URL serves hello page with security headers
### T0.4 README + docs skeleton   [todo]
owner: Docs  wave: C

_Orchestrator: generate cards for Iterations 1–6 at the start of each iteration from harness.md §6._
