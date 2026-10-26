import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Bot, GitFork, Radio, Database, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface UpcomingFeature {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  status: string;
  badgeColor: string;
  icon: React.ComponentType<{ className?: string }>;
}

const UPCOMING_FEATURES: UpcomingFeature[] = [
  {
    number: '1',
    title: 'Necromancer AI Autopsy',
    subtitle: 'Automated codebase scanning to salvage reusable utilities',
    description: 'LLM-powered agentic excavation that digs into your abandoned repositories, extracts high-value helper utilities, cleans uncommitted scripts, and packages them into reusable npm/PyPI modules or standalone gists.',
    status: 'Spectral R&D',
    badgeColor: 'border-purple-500/40 bg-purple-950/40 text-purple-300',
    icon: Bot
  },
  {
    number: '2',
    title: 'Ghost Bounty & Adoption Exchange',
    subtitle: 'Transfer ownership of dead repos to eager open-source maintainers',
    description: 'Don\'t let brilliant ideas rot forever. Post your abandoned project on the Ghost Exchange to transfer repo custody, issue bounties, and pass the torch to developers seeking adopted projects to maintain.',
    status: 'Incubating',
    badgeColor: 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300',
    icon: GitFork
  },
  {
    number: '3',
    title: 'Midnight Multiplayer Mourning Vigils',
    subtitle: 'Real-time collaborative audio/synth mourning rooms with interactive candles',
    description: 'Gather around the digital crypt after dark. Ambient generative synth drones, synchronized candle-lighting ceremonies, and live audio eulogy broadcasts for legendary projects being put to rest.',
    status: 'Ritual Scheduled',
    badgeColor: 'border-amber-500/40 bg-amber-950/40 text-amber-300',
    icon: Radio
  },
  {
    number: '4',
    title: 'Permanent Decentralized Sarcophagus',
    subtitle: 'Immutable decentralized repo snapshots on IPFS & Arweave',
    description: 'Cryptographic immortality. Mint an eternal decentralized cold-storage archive of your dead project\'s commit history, documentation, and releases on IPFS and Arweave before GitHub account deletion.',
    status: 'Vault Blueprint',
    badgeColor: 'border-cyan-500/40 bg-cyan-950/40 text-cyan-300',
    icon: Database
  }
];

export const Upcoming: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-80px)] w-full px-4 py-10 sm:p-6 md:p-12 relative overflow-hidden flex flex-col items-center justify-center">
      
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-radial from-[#c53030]/10 to-transparent blur-[120px] pointer-events-none" />

      <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 lg:gap-16 relative z-10">
        
        {/* Left Column: 3D-like Grim Reaper with Scythe */}
        <div className="w-full max-w-[240px] sm:max-w-[280px] lg:max-w-[320px] flex flex-col items-center text-center shrink-0 lg:sticky lg:top-24">
          <div className="w-full aspect-[4/5] relative drop-shadow-[0_0_50px_rgba(0,0,0,0.9)] animate-pulse">
            <div 
              className="w-full h-full"
              style={{
                backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 300\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3CradialGradient id=\'glow\' cx=\'50%25\' cy=\'30%25\' r=\'50%25\'%3E%3Cstop offset=\'0%25\' stop-color=\'%23c53030\' stop-opacity=\'0.2\'/%3E%3Cstop offset=\'100%25\' stop-color=\'black\' stop-opacity=\'0\'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width=\'200\' height=\'300\' fill=\'url(%23glow)\'/%3E%3Cpath d=\'M60 50 C80 10, 120 10, 140 50 C160 100, 150 250, 150 250 L50 250 C50 250, 40 100, 60 50 Z\' fill=\'%23050505\'/%3E%3Cpath d=\'M90 70 C100 65, 110 70, 110 70 C105 80, 95 80, 90 70 Z\' fill=\'%23c53030\' opacity=\'0.8\'/%3E%3Cpath d=\'M150 80 Q190 60, 180 20 Q190 40, 170 70 L150 250 Z\' fill=\'%231a1a1a\'/%3E%3Cpath d=\'M165 45 C150 20, 110 15, 90 30 C120 30, 140 40, 165 45 Z\' fill=\'%23888\'/%3E%3C/svg%3E")',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.8))'
              }}
            />
          </div>

          <div className="mt-4 p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800 text-center w-full">
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest block mb-1">
              Ritual In Progress
            </span>
            <p className="text-xs text-zinc-300 font-sans">
              "Death is merely a transition into open-source enlightenment."
            </p>
          </div>

          {/* Recently Shipped Features callout */}
          <div className="mt-4 p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-left w-full">
            <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px] uppercase tracking-wider font-semibold mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Recently Resurrected
            </div>
            <ul className="text-[11px] font-mono text-zinc-400 space-y-1">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Resurrection Protocol</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Project Survival Guide</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>LinkedIn Mistake Generator</span>
              </li>
            </ul>
            <Link 
              to="/" 
              className="inline-block mt-2 text-[10px] font-mono text-emerald-400 hover:text-emerald-300 underline decoration-emerald-500/50"
            >
              Explore Cemetery & Guides →
            </Link>
          </div>
        </div>
        
        {/* Right Column: Upcoming Resurrections Roadmap */}
        <div className="flex-1 w-full bg-zinc-950/80 p-6 sm:p-8 md:p-10 rounded-3xl border border-zinc-800/80 backdrop-blur-md shadow-2xl">
          <div className="border-b border-white/10 pb-4 md:pb-6 mb-6 md:mb-8 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#c53030]/30 bg-[#c53030]/10 text-[#f87171] text-[10px] font-mono uppercase tracking-[0.2em] mb-2">
              <Sparkles className="w-3 h-3" /> Necromancer Roadmap
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif text-white tracking-widest uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              Upcoming Resurrections
            </h1>
            <p className="text-xs sm:text-sm font-mono text-zinc-400 mt-1">
              The next cycle of forbidden rituals currently undergoing invocation in the DevGraveyard crypts.
            </p>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {UPCOMING_FEATURES.map((feat) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={feat.number}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  className="group relative p-4 sm:p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 hover:border-[#c53030]/50 hover:bg-zinc-900/70 transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-[#c53030]/15 border border-[#c53030]/30 text-[#f87171] font-mono font-bold text-xs flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        {feat.number}
                      </span>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
                        <h2 className="text-base sm:text-lg font-bold text-white group-hover:text-red-200 transition-colors font-sans tracking-tight">
                          {feat.title}
                        </h2>
                      </div>
                    </div>

                    <span className={`self-start sm:self-center px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider border ${feat.badgeColor} shrink-0`}>
                      {feat.status}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-mono text-zinc-400 font-semibold mb-1.5 pl-10">
                    {feat.subtitle}
                  </p>

                  <p className="text-xs sm:text-sm font-sans text-zinc-400 leading-relaxed pl-10 border-l border-zinc-800 ml-3.5 group-hover:border-[#c53030]/40 transition-colors">
                    {feat.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
