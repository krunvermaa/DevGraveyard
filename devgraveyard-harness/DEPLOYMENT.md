# DEPLOYMENT.md — Vercel
_Owner: DevOps agent. Env var NAMES only; values live in Vercel and the human's machine._

## One-time setup (human + DevOps, Iteration 0)
1. Human creates a **private** GitHub repo and a Vercel project linked to it (or runs `vercel link`).
2. Human adds Production/Preview env vars in Vercel (names in `SECURITY.md §2`). Agent never sees values.
3. `vercel.json`: SPA rewrite (`/(.*) -> /index.html`), security headers, `buildCommand: npm run build`, `outputDirectory: dist`.
4. Firebase Console (human): add the Vercel domain to Auth **Authorized domains**; restrict the API key referrers.
5. Preview deployments protected; production public.

## After EVERY complete iteration (mandatory)
Preconditions: all gates green (harness §7), tag `iter-N` exists on `main`.
```
git checkout main && git pull
npm ci && npm run verify && npm run build        # fresh install, no cached state
vercel pull --yes --environment=production        # uses Vercel-held env, nothing printed
vercel build --prod && vercel deploy --prebuilt --prod
```
(If the repo is connected to Vercel Git integration, pushing the tag/`main` deploys automatically — still run the
smoke test below and confirm the deployment URL matches the latest commit SHA.)

## Post-deploy smoke test (QA + DevOps)
1. Open the production URL: `/`, `/auth`, `/feed`, `/grave/<id>` return 200 and render.
2. No console errors; `curl -I` shows the security headers; no `.map` files served.
3. Log in with a **test account**, create + delete a test grave, pay respects. Clean up test data.
4. Record URL, commit SHA, tag, and result in `PROGRESS.md` (`Last deploy`) and `CHANGELOG.md`.

## Rollback
If smoke fails: promote the previous good deployment (`vercel rollback` / dashboard), open a `blocked` fix task,
and do not start the next iteration until production is green. Never delete deployments without human approval.

## Rules
- Deploy only from `main` at a tagged commit. Never deploy uncommitted or red code.
- Never run `vercel env pull` into a tracked path; `.env.local` stays gitignored and unread by agents.
- Never print tokens; `VERCEL_TOKEN` (if used in CI) lives only in GitHub Actions secrets.
