# Contributing to DevGraveyard 🪦

First off, thank you for considering contributing to DevGraveyard! Every abandoned side project, forgotten repo, and hard-earned failure carries wisdom. By contributing to this project, you help create a dignified resting place for dead code and help developers everywhere learn from recurring pitfalls.

---

## 📜 Code of Conduct

DevGraveyard is a respectful, supportive space. We treat failed projects with dark humor and reverence, but we treat human contributors with kindness, empathy, and mutual respect. Zero tolerance for harassment or malice.

---

## 🧭 Repository Structure

```
DevGraveyard/
├── src/
│   ├── components/         # Reusable UI primitives, GraveCard, GraveModal, ShareCards
│   ├── contexts/           # React context providers (AuthContext, notifications)
│   ├── pages/              # Primary route views (Home, Cemetery, SubmitGrave, Leaderboard, etc.)
│   ├── services/           # Firebase & business logic (graveService, userService, accountService)
│   ├── types.ts            # Core TypeScript schemas (Grave, User, Eulogy, Confession)
│   ├── firebase.ts         # Firebase client config & authentication bindings
│   ├── pixelAvatars.ts     # Procedural & pixel avatar catalog
│   ├── index.css           # Tailwind directives & core global layers
│   └── index.tsx           # Application entry point
├── public/                 # Static assets, sound effects, favicons
├── scripts/                # Repository maintenance & Firebase binding utilities
├── firestore.rules         # Declarative Firestore security & access rules
├── tailwind.config.js      # Gothic palette, typography, custom animations
└── vite.config.ts          # Vite build config with vendor chunk splitting
```

---

## 🛠️ Setting Up Local Development

### Prerequisites
- **Node.js**: v18.x or v20.x+ recommended
- **npm**: v9.x+
- **Git**

### Installation

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/<your-username>/DevGraveyard.git
   cd DevGraveyard
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   Copy the example environment configuration:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Firebase config keys. If you just want to test UI components, mock fallbacks or personal Firebase test apps work out of the box.

4. **Start the local dev server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Typecheck & Lint:**
   ```bash
   npm run lint
   npm run build
   ```

---

## 🎨 Gothic Aesthetic & Design Guidelines

DevGraveyard blends high-craft developer tooling with a somber, gothic memorial atmosphere:

1. **Color Palette**:
   - `background`: `#050505` (Deep charcoal, near black)
   - `surface`: `#0a0a0a` (Elevated card surface)
   - `border`: `#27272a` (Subtle dark zinc boundaries)
   - `muted`: `#71717a` (De-emphasized text & inscriptions)
   - `text`: `#e4e4e7` (High contrast readable copy)
   - `'code-green'`: `#4ade80` (Terminal prompt, life, surviving concepts)
   - `'code-red'`: `#f87171` (Fatal errors, death dates, gravescore penalties)
   - `'code-cyan'`: `#22d3ee` (Soul wisps and cosmic accents)

2. **Typography**:
   - Primary UI: `font-sans` (`Inter`)
   - Code & Terminal telemetry: `font-mono` (`Space Mono`)
   - Epitaphs & Eulogies: `font-serif` (`Crimson Pro`) or `font-averia` (`Averia Serif Libre`)

3. **Motion & Feedback**:
   - Use subtle, atmospheric animations (`soul-float`, `breathe`, `fade-in-up`, `mist-rise`).
   - Honor `prefers-reduced-motion` where appropriate.
   - Micro-interactions (like pressing F to pay respects or lighting candles) should feel tactile and meaningful.

---

## 🏷️ Commit Message Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` A new feature (e.g., `feat: add tombstone audio reverberation`)
- `fix:` A bug fix (e.g., `fix: correct gravescore overflow calculation`)
- `docs:` Documentation only changes (e.g., `docs: update deployment guidelines`)
- `style:` Formatting, whitespace, or visual styling with no code logic changes
- `refactor:` Code change that neither fixes a bug nor adds a feature
- `perf:` Performance improvements
- `test:` Adding or updating tests
- `chore:` Maintenance tasks, dependency updates, build tooling

---

## 🚀 Submitting a Pull Request (PR)

1. **Create a topic branch:**
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. **Make your changes cleanly and write descriptive commit messages.**
3. **Ensure build & typecheck passes:**
   ```bash
   npm run lint
   npm run build
   ```
4. **Push your branch to your fork:**
   ```bash
   git push origin feat/your-feature-name
   ```
5. **Open a Pull Request** against the `main` branch:
   - Provide a concise summary of what was changed and why.
   - Include before/after screenshots or recordings for UI modifications.
   - Reference any linked issues (e.g., `Fixes #42`).

Thank you for helping dead software rest in peace while teaching the living! 🕯️
