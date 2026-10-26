# SECURITY.md — Secrets, privacy, and code protection
_Owner: Security agent. Read before any task touching env vars, rules, deploy config, or dependencies._

## 1. Honest threat model (read first)
- **Anything in the browser bundle is public.** `VITE_*` variables are inlined into client JS. Firebase web config
  (apiKey, authDomain, projectId...) is an *identifier*, not a secret — real protection is **Firestore Rules +
  Auth + API-key restrictions + App Check**. Still, we keep it in env vars (never hard-coded/committed).
- **True secrets** (service-account JSON, admin SDK keys, Vercel tokens, any private API key) must **never** be in
  client code, `VITE_*` vars, the repo, logs, or md files. This app should need none at runtime.
- Client source cannot be made fully secret. We reduce leakage: private repo, no source maps in prod, minify,
  no secrets in history, protected deployments for previews.

## 2. Environment variables
- Names in `.env.example` (placeholders only):
  `VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_STORAGE_BUCKET,
  VITE_FIREBASE_MESSAGING_SENDER_ID, VITE_FIREBASE_APP_ID, VITE_USE_EMULATOR`
- Real values: local `.env.local` (gitignored, human-created) and **Vercel Project Settings -> Environment Variables**
  (Production / Preview / Development separately).
- Agents **must not open, print, echo, or cat** `.env`, `.env.local`, or any `.env.*` except `.env.example`.
- Code reads config only through `src/lib/firebase.ts` via `import.meta.env`. Fail fast with a clear (non-leaking)
  error if a var is missing. Never `console.log(import.meta.env)` or the config object.
- Never put a value in docs/commits/PR text/test snapshots. Docs list **names only**.

## 3. Repository & code-leak protection
- GitHub repo is **Private** (human confirms). No public forks, no public gists, no pasting code in third-party sites.
- `.gitignore` must include: `.env*` (except `.env.example`), `.vercel`, `node_modules`, `dist`, `*.log`, `coverage`,
  `playwright-report`, `test-results`, `*.pem`, `*-service-account*.json`, `.firebase`, `firebase-debug.log`.
- **Pre-commit:** secret scan (`gitleaks protect --staged`) + lint-staged. **CI:** `gitleaks detect` on every push.
- If a secret is ever committed: STOP, tell the human, rotate the key immediately, then purge history
  (`git filter-repo`) only with human approval. Rotating comes first; deleting the commit alone is not enough.
- `vite.config.ts` production: `build.sourcemap = false`, minify on, strip `console.*`/`debugger`
  (`esbuild.drop`). No comments with internal notes in shipped code.
- Vercel: enable **Deployment Protection** for Preview deployments; production domain public. Do not expose
  `/.git`, `/docs`, `/agents`, or md files via the static output (only `dist/` is served).
- Do not add analytics/telemetry/third-party scripts. Pin dependency versions; review new packages
  (downloads, maintainer, recent commits); run `npm audit --audit-level=high` — fix or log in DECISIONS.md.

## 4. Firebase hardening checklist
- [ ] Firestore rules are **deny-by-default**; every collection has explicit rules.
- [ ] Rules validate schema: field whitelist (`hasOnly`), types, string lengths, enums for causeOfDeath, timestamps
      from `request.time`, immutable fields (`createdAt`, `authorId`).
- [ ] `isSignedIn()`, `isOwner(uid)` helpers; users can only write their own docs; no listing of `graves_private`.
- [ ] Username lock doc created atomically with profile; cannot overwrite another user's username.
- [ ] Friend request: only `fromUid` can create (status=pending), only `toUid` can accept/reject; friend edges
      only created when request accepted (`getAfter`/`get` check); no self-requests/follows.
- [ ] One respect/RIP per user enforced by doc id == uid.
- [ ] Anonymous grave never exposes uid (see ARCHITECTURE §Anonymity). Test it explicitly.
- [ ] Eulogy: length <= 280, only author deletes their own; grave owner may delete eulogies on their grave.
- [ ] Firebase Console (human): restrict API key to the Vercel domain(s) + localhost (HTTP referrers), enable
      **App Check** (reCAPTCHA v3) if time permits, limit authorised domains, enable email enumeration protection.

## 5. App-level security
- Validate all input with zod in services; escape/encode user text (React escapes by default; **never** use
  `dangerouslySetInnerHTML`). Allow only `https:` / `instagram`/`wa.me` formats for social links; sanitise.
- Route guards for protected pages; never rely on UI hiding for authorisation (rules enforce it).
- Rate-limit-ish UX: disable buttons while pending; debounce username checks.
- Errors shown to users are generic; no stack traces, no Firebase error dumps in production.
- Security headers in `vercel.json`: `Content-Security-Policy` (self + Firebase/Google endpoints, no inline eval),
  `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`,
  `Permissions-Policy`, `Strict-Transport-Security`.
- Account deletion requires recent re-authentication and removes all of the user's data.

## 6. Security gate (every iteration, before commit to `main`)
1. `gitleaks detect` clean  2. `npm audit --audit-level=high` clean or logged  3. rules tests green
4. grep check: no `VITE_` value literals, no keys/tokens in `src/`, no `console.log` of env/config
5. verify built `dist/` has no `.map` files and no secret-looking strings
6. checklist §4 items touched this iteration are ticked  7. findings -> `docs/reports/security-iter-N.md`
