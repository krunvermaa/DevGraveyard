# TESTING.md — Test strategy
_Owner: QA agent. Test with synthetic data and the Firebase **emulator** only — never production data._

## Tooling
Vitest + React Testing Library (unit/component) • Firebase Emulator Suite + `@firebase/rules-unit-testing`
(rules/integration) • Playwright (system/black-box) • `@vitest/coverage-v8` (white-box coverage).
Scripts: `npm run test:unit | test:rules | test:integration | test:e2e | test:coverage | verify`
(`verify` = typecheck + lint + unit + rules).

## The five test types
| Type | What | Where | Who writes |
|---|---|---|---|
| **Unit** | validators, utils, hooks, single components in isolation (mock services) | `*.test.ts(x)` colocated | QA (from contracts, in parallel with build) |
| **Integration** | services <-> Firestore/Auth emulator (create grave, username lock, friend flow, share) | `tests/integration` | QA + Backend |
| **System (E2E)** | full app in a browser against emulators: whole demo flow, multi-user | `e2e/system/*.spec.ts` | QA |
| **Black box** | testers use only `PROJECT_SPEC.md` + UI, no code knowledge: spec-driven scenarios, boundary values, invalid inputs, XSS strings, a11y | `e2e/blackbox/*.spec.ts` | QA agent **must not read src/ while writing these** |
| **White box** | code-aware: branch/line coverage, every rules path (allow+deny), error branches, anonymity leakage checks | `tests/rules`, coverage config | QA + Security |

## Stage matrix (when each runs)
| Moment | Unit | Integration | System | Black box | White box |
|---|---|---|---|---|---|
| Per task (before handoff) | ✅ | — | — | — | ✅ touched files |
| Per merge (end of Wave B) | ✅ | ✅ | smoke | — | ✅ rules tests |
| Per iteration gate (before tag/deploy) | ✅ | ✅ | ✅ iteration flows | ✅ new features | ✅ coverage |
| Iter 3 and Iter 5 (mid-project checkpoints) | ✅ | ✅ | ✅ full | ✅ full | ✅ full |
| Iter 6 (release) | ✅ | ✅ | ✅ full + live URL smoke | ✅ full + a11y + mobile viewport | ✅ >= thresholds |

## Thresholds (white-box gate)
Lines >= 80%, branches >= 70% on `src/services`, `src/lib`, `src/hooks`; **100% of Firestore rules paths** have an
allow and a deny test. Lower coverage needs a `DECISIONS.md` entry.

## Mandatory scenarios
- Auth: sign up, duplicate username rejected, login/logout, protected route redirect.
- Graves: create (all fields), validation errors, anonymous burial hides author everywhere, delete own only.
- Interactions: F toggles respect once per user; eulogy <= 280, XSS string rendered inert; RIP once per user.
- Social: request -> accept/reject; cannot friend self/duplicate; follow/unfollow; share only to friends.
- Settings: change username (lock transferred atomically), delete account removes data.
- Security: unauthenticated writes denied; user A cannot edit user B; `graves_private` unreadable by others.
- Live smoke (post-deploy): landing 200, auth page loads, feed loads, no console errors, headers present.

## Rules
- Tests are written **from contracts/spec**, in parallel with implementation, not after.
- A failing test is never deleted or skipped to pass the gate; fix the code or log a bug in `TASKS.md`.
- Flaky test -> quarantine with a TASKS.md card within the same iteration.
- Each iteration appends a results row to the table below (counts only, no logs).

## Results
| Iter | Unit | Integration | System | Black box | Coverage L/B | Rules paths |
|---|---|---|---|---|---|---|
