import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowLeft, HeartHandshake, AlertOctagon, Scale } from 'lucide-react';

export const TermsOfService: React.FC = () => {
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
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-mono text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Terms of Service
            </h1>
            <p className="font-mono text-xs text-zinc-500 uppercase tracking-wider">
              Effective Date: November 2026
            </p>
          </div>
        </div>
      </header>

      <section className="space-y-4">
        <h2 className="font-mono text-lg font-semibold text-white flex items-center gap-2">
          <Scale className="w-4 h-4 text-[#c53030]" />
          1. Acceptance of Sanctuary Terms
        </h2>
        <p className="font-sans text-sm text-zinc-400 leading-relaxed">
          By accessing or interacting with DevGraveyard, including viewing tombstones, burying projects, pressing 'F' to pay respects, leaving eulogies, or posting confessions, you agree to be bound by these Terms of Service.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-mono text-lg font-semibold text-white flex items-center gap-2">
          <HeartHandshake className="w-4 h-4 text-[#c53030]" />
          2. The Cemetery Etiquette
        </h2>
        <p className="font-sans text-sm text-zinc-400 leading-relaxed">
          DevGraveyard is dedicated to celebrating the hard work, late-night hacks, and vulnerable lessons learned from abandoned code. Users agree to adhere to the following community standards:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-sm text-zinc-400 font-sans">
          <li><strong>Respectful Eulogies:</strong> Comments and eulogies left on memorials must remain constructive, humorous, or empathetic. Harassment, derogatory comments, and spam will result in immediate removal and crypt revocation.</li>
          <li><strong>Authentic Submissions:</strong> Memorialize projects you participated in or have rightful knowledge of. Do not create malicious parodies of other developers' live software.</li>
          <li><strong>No Doxxing or Sensitive Data:</strong> Never include API keys, production credentials, proprietary trade secrets, or personal identifiable info in causes of death or lessons learned.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-mono text-lg font-semibold text-white flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-[#c53030]" />
          3. User Content & Intellectual Property
        </h2>
        <p className="font-sans text-sm text-zinc-400 leading-relaxed">
          You retain full intellectual property ownership of your project code and written retrospective text. By submitting to DevGraveyard, you grant the platform a non-exclusive license to display the memorial card, calculate GraveScores, and render the tombstone to visitors.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-mono text-lg font-semibold text-white">
          4. Disclaimer of Warranties
        </h2>
        <p className="font-sans text-sm text-zinc-400 leading-relaxed">
          DevGraveyard is provided on an "as is" and "as available" basis without warranties of any kind. We are not liable for accidental data loss, third-party service downtime, or discrepancies in automated AI post-mortem synthesis.
        </p>
      </section>

      <section className="space-y-4 border-t border-zinc-800 pt-6">
        <h2 className="font-mono text-lg font-semibold text-white">
          5. Modifications to Terms
        </h2>
        <p className="font-sans text-sm text-zinc-400 leading-relaxed">
          We may update these terms as new necrological features (such as project resurrecting and crypt leagues) evolve. Significant revisions will be highlighted in the repository release notes.
        </p>
      </section>
    </article>
  );
};
