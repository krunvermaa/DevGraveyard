# GIT_WORKFLOW.md
_Read before the first commit and when merging._

## Branching
- `main` = always deployable. Only the **Orchestrator** merges to `main`.
- Agent branches: `agent/<role>/<task-id>-<slug>` (e.g. `agent/backend-firebase/T2.3-graves-service`).
  If agy supports it, give each parallel agent its own **git worktree** to avoid file clashes.
- Because ownership is disjoint, merges should be conflict-free; if not, Orchestrator resolves and logs it.

## Commit cadence (commit early, commit often)
- Commit after **every completed task** and at least every ~30 minutes of work; never leave > 1 task uncommitted.
- Before risky refactors: commit a checkpoint. After green gates: merge + tag.
- Never commit a broken build to `main`. WIP on agent branches is fine.

## Message format (Conventional Commits)
`type(scope): summary` — types: `feat fix refactor test docs chore perf security ci`
Examples: `feat(graves): add anonymous burial toggle` • `test(rules): cover friend_requests deny paths`
Body (optional): what/why; reference task id `T2.3`. **Never** include secrets, tokens, or personal data.

## Pre-commit (husky + lint-staged)
typecheck on staged TS, eslint --fix, prettier, `gitleaks protect --staged`. Do not bypass with `--no-verify`.

## Per-iteration release steps
1. All agent branches merged into `main` via `--no-ff` merge commits (squash allowed for noisy WIP).
2. `npm run verify` + gates pass.
3. Update `CHANGELOG.md`, `PROGRESS.md`; commit `chore(release): iter-N`.
4. `git tag -a iter-N -m "Iteration N: <summary>"` and push `main --follow-tags`.
5. Hand over to DevOps for deploy of that exact tag/commit.

## Forbidden without human approval
force-push, history rewrite, branch/tag deletion, committing generated `dist/`, committing `.env*` or `.vercel/`.
Remote must be the **private** repo the human created; never add other remotes.
