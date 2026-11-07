# 🪦 DevGraveyard

<div align="center">

> **"Not every project survives. Some still teach."**
> 
> DevGraveyard gives abandoned software, dead side projects, and fallen repositories a dignified resting place. Transform graveyard code into institutional wisdom through structured failure post-mortems, interactive memorial rituals, and community tributes.

<br />

[![Live Demo](https://img.shields.io/badge/Live_Demo-devgraveyard.vercel.app-10b981?style=for-the-badge&logo=vercel&logoColor=white)](https://devgraveyard.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

<br />

[![React 19](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript_5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_3.4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite_6-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Firebase](https://img.shields.io/badge/Firebase_Auth_&_Firestore-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com)
[![Vercel](https://img.shields.io/badge/Vercel_Hosting-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com)

</div>

---

## ⚰️ Why DevGraveyard?

Every software engineer maintains a closet of forgotten repositories—grand ideas crushed by scope creep, burn-out, market indifference, or architectural collapse. 

DevGraveyard transforms developer guilt into collective knowledge:
1. **Catharsis**: Inscribe an epitaph and lay your dead repo to rest.
2. **Analysis**: AI-assisted autopsies extract root causes, missed signals, and lessons learned.
3. **Respect**: The community pays respects, lights candles, and recites eulogies.

```
       .---.
      /     \
     | R.I.P |
     |       |
     | Your  |
     | Repo  |
     |  2026 |
  \\\|       |///
^^^^^^^^^^^^^^^^^^^^
```

---

## 🌟 Core Features

### 1. ⚱️ The Burial Ritual
- An interactive funeral rite for codebases. Inscribe the project title, cause of death (e.g. *Scope Creep*, *Tech Debt Collapse*, *Burnout*, *AI Superseded*), lifespan dates, tech stack chips, and final epitaph.
- Choose between **Honored Inscriptions** (tied to your developer profile) or **Unmarked Graves** (100% anonymous burials for controversial or sensitive projects).

### 2. ⚖️ GraveScore™ Engine
- Algorithmic rating determining the tragedy and weight of the abandonment.
- Calculates an objective composite score based on:
  - Codebase complexity and size
  - Duration of active life prior to burial
  - Financial & emotional sunk cost
  - Number of abandoned Git commits and discarded dependencies

### 3. 🕯️ Press 'F' to Pay Respects
- Real-time interactive tribute engine honoring the legendary gaming meme.
- Visitors can press `F` (or tap the floral button) to pay respects, incrementing community reverence.
- Leave heartfelt eulogies, light interactive candles, and leave floral offerings on any tombstone.

### 4. 🗝️ Confessions Crypt
- A somber community chamber where engineers whisper anonymous confessions:
  - *"I deleted the production database and blamed an AWS outage."*
  - *"We raised $2M on a pitch deck for an app that was just 10,000 lines of hardcoded `if` statements."*
- Filter by upvotes, tags, and recency with zero tracking or identity leakage.

### 5. 🎴 Tombstone Share Cards
- High-fidelity exportable digital gravestones generated on the fly using `html2canvas`.
- Includes customized gothic typography, project cause-of-death ribbons, dynamic QR codes pointing directly to the grave URL, and one-click download for sharing on X (Twitter), LinkedIn, or Discord.

### 6. 🧠 AI Failure Post-Mortems
- Built-in Gemini 1.5 Flash synthesis engine paired with an offline heuristic fallback autopsy generator.
- Generates structured, evidence-grounded post-mortems featuring:
  - Primary root cause hypothesis
  - Warning signs missed during development
  - Systemic failure taxonomy
  - Actionable 5-point prevention checklist for future endeavors

---

## 🛠️ Architecture & Tech Stack

```
DevGraveyard Architecture
┌─────────────────────────────────────────────────────────────┐
│                      Client (React 19)                      │
│  Tailwind CSS 3.4 • Motion/React • HTML5 Audio Engine       │
│  html2canvas Export • Lucide Icons • Space Mono / Crimson   │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
    ┌──────────────────────┐      ┌───────────────────────┐
    │  Firebase Firestore  │      │   Google Gemini API   │
    │  & OAuth (GitHub)    │      │   (Post-Mortem LLM)   │
    │  Strict Sec Rules    │      │   + Fallback Engine   │
    └──────────────────────┘      └───────────────────────┘
```

- **Framework**: [React 19](https://react.dev) with [TypeScript](https://www.typescriptlang.org)
- **Bundler & Tooling**: [Vite 6](https://vitejs.dev) with custom rollup chunk splitting
- **Styling**: [Tailwind CSS 3.4](https://tailwindcss.com) + [PostCSS](https://postcss.org) + [Autoprefixer](https://github.com/postcss/autoprefixer)
- **Database & Auth**: [Firebase v12](https://firebase.google.com) (Firestore & Firebase Auth)
- **Animations**: `motion/react` + custom keyframes (`soul-float`, `grave-descend`, `mist-rise`)
- **Card Generation**: `html2canvas` + `qrcode.react`

---

## 🚀 Quickstart Guide

### Prerequisites
- Node.js `18.x` or `20.x`+
- npm `9.x`+

### 1. Clone the repository
```bash
git clone https://github.com/krunvermaa/DevGraveyard.git
cd DevGraveyard
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env.local` file in the root directory:
```bash
cp .env.example .env.local
```

Populate the keys in `.env.local`:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Optional: Gemini API Key for dynamic LLM post-mortem synthesis
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 4. Run development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the graveyard locally.

### 5. Build for production
```bash
npm run build
```
The optimized bundle will be compiled into `dist/`.

---

## 🔒 Security & Privacy

- **Declarative Firestore Rules**: Access permissions are strictly managed in `firestore.rules`.
- **Anonymous Graves**: Unmarked graves scrub author IDs, preventing retrospective attribution.
- **Client Sanitization**: All tombstone inscriptions and confessions are validated before being committed to the database.
- **No Unsafe Secrets**: API keys in `.env.local` are scoped to read/write rules gated by user authentication and Firestore security policies.

---

## 🤝 Contributing

Contributions are warmly welcomed! Please read our [CONTRIBUTING.md](file:///Users/karanverma/Desktop/Projects/DevGraveyard/CONTRIBUTING.md) guide for information on code standards, commit conventions, and the gothic design philosophy.

---

## 📜 License

Distributed under the MIT License. See [LICENSE](file:///Users/karanverma/Desktop/Projects/DevGraveyard/LICENSE) for more information.

<div align="center">
  <sub>DevGraveyard is maintained with 🖤 for the global developer community.</sub>
</div>
