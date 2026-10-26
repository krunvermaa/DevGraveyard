# 🪦 DevGraveyard

> **"Not every project survives. Some still teach."**
> 
> DevGraveyard preserves the wisdom hidden inside abandoned software projects. It gives dead code a dignified resting place while generating structured failure post-mortems and practical prevention checklists so the community can learn from recurring mistakes.

[![Vercel Deployment](https://img.shields.io/badge/Deployed-Vercel-black?style=flat-square&logo=vercel)](https://devgraveyard.vercel.app)
[![React 19](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%26%20Firestore-orange?style=flat-square&logo=firebase)](https://firebase.google.com)

---

## 🌟 Features

- **Tombstone Memorials**: Inscribe project name, cause of death, lifespan, technology stack, and lessons learned.
- **Structured Failure Post-Mortems**: Evidence-grounded root cause hypothesis, contributing factors, missed warning signs, and actionable prevention steps.
- **Pay Respects & Eulogies**: Interactive 'RIP' respect counter, eulogy wall, and community tributes.
- **Social & Graveyard Network**: Developer profiles, pixel avatars, friend connections, and direct grave sharing.
- **Anonymous Burials**: Optional unmarked graves with strict privacy separation to share hard truths safely.
- **Gothic Developer Aesthetic**: Dark atmospheric UI, sound effects, particle soul animations, and shareable memorial cards.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling & Animation**: Tailwind CSS, `motion/react`, `lucide-react`
- **Backend / Storage**: Firebase Authentication (GitHub & Google OAuth) & Cloud Firestore
- **AI Failure Analysis**: Gemini 1.5 Flash API with intelligent domain heuristic fallback engine
- **Deployment**: Vercel

---

## 🚀 Getting Started

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
Create a `.env.local` file in the root directory from `.env.example`:

```bash
cp .env.example .env.local
```

Populate `.env.local` with your Firebase project credentials:
```env
VITE_FIREBASE_API_KEY=your_api_key
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

Visit [http://localhost:3000](http://localhost:3000) to view the graveyard.

### 5. Build for production
```bash
npm run build
```

---

## 🏛️ Project Structure

```
DevGraveyard/
├── src/
│   ├── components/       # UI primitives, GraveCard, GraveModal, ShareCards
│   ├── contexts/         # AuthContext and user session
│   ├── pages/            # Home, SubmitGrave, Profile, GraveView, Chats, Confessions
│   ├── services/         # graveService, userService, accountService
│   ├── types.ts          # Core schema interfaces (Grave, User, Eulogy)
│   ├── firebase.ts       # Firebase initialization from environment variables
│   ├── pixelAvatars.ts   # Pixel art avatar library
│   └── index.tsx         # React application entry point
├── public/               # Static assets & icons
├── firestore.rules       # Strict access control rules
├── vercel.json           # SPA rewrites & security headers
├── vite.config.ts        # Vite configuration
└── tsconfig.json         # TypeScript compiler configuration
```

---

## 📜 License
MIT License. Created for the developer community.
