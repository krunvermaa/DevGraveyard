import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Lock, Database, EyeOff } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10 animate-fade-in text-zinc-300">
      <header className="space-y-4 border-b border-zinc-800 pb-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-zinc-500 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to DevGraveyard Sanctuary</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#c53030]/10 border border-[#c53030]/30 text-[#c53030]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-mono text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Privacy Policy
            </h1>
            <p className="font-mono text-xs text-zinc-500 uppercase tracking-wider">
              Last Updated: November 2026
            </p>
          </div>
        </div>
      </header>

      <section className="space-y-4">
        <h2 className="font-mono text-lg font-semibold text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#c53030]" />
          1. Our Core Privacy Promise
        </h2>
        <p className="font-sans text-sm text-zinc-400 leading-relaxed">
          DevGraveyard was created by developers for developers. We treat your code, identity, and failures with the highest respect. We operate under strict principles: we do not sell your personal data, we do not inspect or clone private repositories, and we request only the bare minimum permissions needed to power your developer memorial.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-mono text-lg font-semibold text-white flex items-center gap-2">
          <EyeOff className="w-4 h-4 text-[#c53030]" />
          2. Authentication & GitHub Scopes
        </h2>
        <p className="font-sans text-sm text-zinc-400 leading-relaxed">
          When signing into DevGraveyard via GitHub, we request the restricted <code className="font-mono bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-200">public_repo</code> and public profile scopes.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-sm text-zinc-400 font-sans">
          <li><strong>Zero Access to Private Code:</strong> We cannot see, browse, or read any of your private repositories or organizations.</li>
          <li><strong>Repository Auto-Fill:</strong> The optional GitHub repository picker merely fetches your public repo names, primary language, and star counts so you can memorialize them without manual copy-pasting.</li>
          <li><strong>Google Sign-In:</strong> When using Google OAuth, we only receive your email address, display name, and avatar URL to provision your crypt profile.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-mono text-lg font-semibold text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-[#c53030]" />
          3. Memorial Data Storage (Firestore)
        </h2>
        <p className="font-sans text-sm text-zinc-400 leading-relaxed">
          When you submit a project to the cemetery, the project name, cause of death, lessons learned, and optional repository links are stored in Google Cloud Firestore.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-sm text-zinc-400 font-sans">
          <li><strong>Public Cemetery:</strong> Graves in the cemetery are public documents meant to educate the broader developer community.</li>
          <li><strong>Unmarked Graves:</strong> If you select "Unmarked Grave", your username and avatar are withheld from the public tombstone card.</li>
          <li><strong>Full Ownership:</strong> You retain ownership of your submissions. You may update or delete your memorialized projects at any time from your profile crypt.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-mono text-lg font-semibold text-white">
          4. Anonymous Confessions
        </h2>
        <p className="font-sans text-sm text-zinc-400 leading-relaxed">
          Confessions posted to the Wall of Developer Regret are stored without user identification. We do not store your user ID or email alongside public confession slips.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-mono text-lg font-semibold text-white">
          5. Analytics & Cookies
        </h2>
        <p className="font-sans text-sm text-zinc-400 leading-relaxed">
          We use privacy-friendly Vercel Web Analytics to measure site uptime and aggregate visitor numbers. We do not use third-party advertising cookies or cross-site tracking pixels. Local storage is strictly used to persist your login token, theme preferences, and cookie consent state.
        </p>
      </section>

      <section className="space-y-4 border-t border-zinc-800 pt-6">
        <h2 className="font-mono text-lg font-semibold text-white">
          6. Contact & Inquiries
        </h2>
        <p className="font-sans text-sm text-zinc-400 leading-relaxed">
          If you have questions about your data or wish to request complete deletion of your account and memorials, open an issue on our GitHub repository or contact the sanctuary maintainers.
        </p>
      </section>
    </article>
  );
};
