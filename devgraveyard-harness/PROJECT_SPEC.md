# PROJECT_SPEC.md — DevGraveyard

## Overview
DevGraveyard is a social platform where developers lay abandoned, failed, or sunset projects to rest: log the
dead project, share a post-mortem / lessons learned, and connect with developers who hit similar roadblocks.
Tone: dark, gothic-but-friendly, humorous yet respectful. Cathartic, not mocking.

## Features
### Project Graves
- **Create grave:** Project Name, Cause of Death (preset list: Scope Creep, Loss of Interest, Technical
  Roadblocks, Burnout, Ran Out of Time/Money, Better Alternative Appeared, Other), Lived For (duration),
  Tech Stack (tags), Lessons Learned (text).
- **Anonymous burial:** toggle; author identity must be unrecoverable from public data.
- **Interactions:** Pay Respects (press **F**, one per user per grave, toggle), Eulogies (short comments),
  RIPs (quick one-tap acknowledgment, one per user per grave).

### Social & Community
- **Profiles:** unique username, avatar, social links (Instagram, WhatsApp), list of their graves.
- **Friends:** send / accept / reject requests; manage friends.
- **Follow:** one-way follow/unfollow; followers/following lists; follow-feed of graves.
- **Grave sharing:** share a specific grave with friends inside the platform (inbox of shared graves).

### Account
- Firebase Auth (email/password + Google). Settings: change username, edit social links, delete account.

## Non-functional requirements
- Responsive (mobile-first), dark theme, WCAG AA contrast, keyboard accessible (F key works but is not the only way).
- Smooth animations via `motion/react`, respecting `prefers-reduced-motion`.
- Fast: route-level code splitting, Lighthouse perf >= 85 mobile.
- Secure & private (see `SECURITY.md`). Strict Firestore rules; no client trust.

## Tech stack (fixed — deviations need a `DECISIONS.md` entry)
React 18 + Vite, TypeScript (strict), Tailwind CSS, `motion/react`, `lucide-react`, React Router,
Firebase (Auth, Firestore, Security Rules). Tests: Vitest, React Testing Library, Playwright,
`@firebase/rules-unit-testing`, Firebase Emulator Suite. Hosting: Vercel.

## Out of scope (do not build)
Cloud Functions, payments, real-time chat, image uploads (avatars via preset gallery or URL initials), push notifications.

## Hackathon demo flow (final polish target)
Landing -> sign up -> bury a project (anonymous + public) -> another user pays respects (F) + eulogy ->
friend request -> follow -> share a grave -> settings. The demo must work with zero errors on the live URL.
