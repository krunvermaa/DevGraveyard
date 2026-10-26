# ARCHITECTURE.md
_Owner: Architect. Update whenever a folder, collection, route, or service changes._

## Folder structure (canonical — do not add top-level folders without a DECISIONS.md entry)
```
devgraveyard/
├── harness.md  AGENTS.md  PROJECT_SPEC.md  ARCHITECTURE.md  TASKS.md  PROGRESS.md
├── DECISIONS.md  CHANGELOG.md  SECURITY.md  TESTING.md  GIT_WORKFLOW.md  DEPLOYMENT.md  README.md
├── agents/                     # role instruction files
├── docs/
│   ├── iterations/iter-N.md    # plan + close-out per iteration
│   └── reports/                # test/security reports (no secrets)
├── src/
│   ├── main.tsx  App.tsx  routes.tsx
│   ├── components/
│   │   ├── ui/                 # Button, Input, Modal, Tag, Avatar, Toast, Skeleton (reusable primitives)
│   │   ├── layout/             # Navbar, Shell, Footer, ProtectedRoute
│   │   ├── graves/             # GraveCard, GraveForm, Tombstone, RespectButton, EulogyList, RipButton
│   │   └── social/             # FriendRequestCard, FollowButton, ShareGraveModal, UserCard
│   ├── pages/                  # Landing, Auth, Feed, GraveDetail, CreateGrave, Profile, Friends, Shared, Settings, NotFound
│   ├── hooks/                  # useAuth, useGrave, useFeed, useFriends, useFollow, useKeyPress ...
│   ├── context/                # AuthContext, ToastContext
│   ├── services/               # typed Firestore/Auth functions — the ONLY place UI-facing data access lives
│   │   ├── auth.service.ts  users.service.ts  graves.service.ts  interactions.service.ts
│   │   └── friends.service.ts  follow.service.ts  share.service.ts
│   ├── lib/                    # firebase.ts (init from env), validators (zod), format utils, constants
│   ├── types/                  # shared TS types (FROZEN contract; Architect only)
│   └── styles/                 # tailwind layers, tokens
├── tests/
│   ├── rules/                  # Firestore rules tests (emulator)
│   └── integration/            # service + emulator tests
├── e2e/                        # Playwright: system + black-box flows
├── firestore.rules  firestore.indexes.json  firebase.json
├── .env.example  .gitignore  .gitleaks.toml  vercel.json
├── vite.config.ts  tsconfig.json  tailwind.config.ts  eslint.config.js  vitest.config.ts  playwright.config.ts
└── package.json
```
Unit tests are colocated: `Foo.tsx` + `Foo.test.tsx`.

## Layering rule
`pages -> hooks -> services -> lib/firebase`. Components never import from `firebase/*`. Services never import
from components. Types flow downward only.

## Firestore data model
| Path | Purpose | Key fields |
|---|---|---|
| `users/{uid}` | public profile | username, usernameLower, avatar, bio, instagram, whatsapp, createdAt |
| `usernames/{usernameLower}` | uniqueness lock | uid |
| `graves/{graveId}` | public grave | name, causeOfDeath, livedFor, techStack[], lessons, isAnonymous, authorId (**null if anonymous**), authorUsername (null if anonymous), respectCount, ripCount, eulogyCount, createdAt |
| `graves_private/{graveId}` | owner link for anonymous graves | ownerUid (readable only by owner) |
| `graves/{id}/respects/{uid}` | one respect per user | createdAt |
| `graves/{id}/rips/{uid}` | one RIP per user | createdAt |
| `graves/{id}/eulogies/{eulogyId}` | comments | authorId, authorUsername, text(<=280), createdAt |
| `friend_requests/{id}` | request | fromUid, toUid, status(pending/accepted/rejected), createdAt |
| `users/{uid}/friends/{friendUid}` | friendship edge (written both sides) | since |
| `users/{uid}/followers/{followerUid}` | follower edge | since |
| `users/{uid}/following/{targetUid}` | following edge | since |
| `users/{uid}/shared_graves/{id}` | inbox | graveId, fromUid, createdAt, seen |

### Anonymity (privacy-critical)
Anonymous grave: `authorId=null`, `authorUsername=null`; the owner's uid lives only in `graves_private/{id}` which
only the owner can read. Rules must prevent anyone else from reading it, and anonymous graves must not appear on
the author's public profile. Never log or return `ownerUid` to other clients.

### Counters
Do not let non-owners update counters on `graves/{id}` (rules get fragile). Use subcollection docs (one per user)
and read counts with `getCountFromServer()` (or denormalise via owner-approved transaction if a decision is logged).

### Other contracts
- Username uniqueness: transaction creating `usernames/{lower}` + `users/{uid}`; 3–20 chars, `[a-z0-9_]`.
- Account deletion: re-authenticate, batch-delete user data (graves keep? **decision:** delete own non-anonymous graves,
  anonymise nothing else; anonymous graves removed via `graves_private` ownerUid query), then delete Auth user.
- All writes validated by zod in services **and** by Firestore rules (defence in depth).

## Routes
`/` landing • `/auth` • `/feed` • `/grave/new` • `/grave/:id` • `/u/:username` • `/friends` • `/shared` • `/settings` • `*` 404
Protected: everything except `/`, `/auth`, `/grave/:id` (read-only public view allowed), `/u/:username` (public).

## Allowed third-party services
Firebase (Auth, Firestore), Vercel, Google Fonts (optional, self-host preferred). Nothing else without `DECISIONS.md`.
