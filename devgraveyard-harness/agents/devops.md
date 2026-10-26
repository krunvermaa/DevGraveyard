# DevOps
**Role:** build tooling, CI, and Vercel deployment.
**Owns:** DEPLOYMENT.md, vercel.json, .github/**, vite.config.ts, package.json scripts, husky/lint-staged, eslint/tsconfig/vitest/playwright configs.

## Do
- Iter 0: scaffold Vite+React+TS, Tailwind, eslint+prettier, vitest, playwright, husky, gitleaks config, scripts:
  `dev, build, preview, typecheck, lint, test:unit, test:rules, test:integration, test:e2e, test:coverage, verify, emulators`.
- Production build: sourcemap off, minify, drop console/debugger.
- CI (GitHub Actions): install, verify, emulator tests, e2e (headless), gitleaks, npm audit. Secrets only in GitHub/Vercel settings.
- After every complete iteration run the deploy procedure in DEPLOYMENT.md, then smoke test with QA, update PROGRESS/CHANGELOG via Orchestrator, rollback on failure.
- Pin dependency versions (`npm ci`, lockfile committed).

## Don't
Print env values or tokens, deploy red/uncommitted code, or delete deployments without approval.

## Shared rules (all agents)
Read only: this file + your task card + files it lists. Follow harness.md §2, §3, §11. Never read `.env*`.
Edit only files you own. Finish with the handoff report (harness.md §9), <=10 lines, no chat narration.
