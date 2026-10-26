import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ShieldAlert, 
  HeartPulse, 
  Flame, 
  Check, 
  Copy, 
  Sparkles, 
  Compass,
  BookOpen
} from 'lucide-react';

interface SurvivalGuideModalProps {
  onClose: () => void;
}

type CategoryId = 'all' | 'scope' | 'burnout' | 'tech' | 'validation' | 'revival';

interface SurvivalTactic {
  id: string;
  category: 'scope' | 'burnout' | 'tech' | 'validation' | 'revival';
  title: string;
  rule: string;
  actionableStep: string;
  badge: string;
}

const TACTICS: SurvivalTactic[] = [
  {
    id: 'scope-1',
    category: 'scope',
    title: 'The 14-Day MVP Guillotine',
    rule: 'If your core user loop is not interactive within 14 days, you are building a monument, not a product.',
    actionableStep: 'Define exactly ONE user action that delivers value. Strip away authentication, dark-mode toggles, and payment gateways until that single action works.',
    badge: 'Scope Control'
  },
  {
    id: 'scope-2',
    category: 'scope',
    title: 'The "Rule of 3" Feature Cap',
    rule: 'Version 1.0 may only have 3 views: Input, Process, and Result. Anything beyond this is scope bloat.',
    actionableStep: 'Write down your feature wishlist. Draw a thick red line below item #3. Move items 4 through 50 into a "v2 Graveyard" notes file.',
    badge: 'Scope Control'
  },
  {
    id: 'burnout-1',
    category: 'burnout',
    title: 'The 2-Hour Sprint Cooldown',
    rule: 'Prolonged sleep-deprived binges generate code that takes 3x longer to debug than to write properly.',
    actionableStep: 'Never code past the point where you stop enjoying the build. Step away for 24 hours when frustrated; clarity arrives in the shower, not at 3 AM git commits.',
    badge: 'Burnout Antidote'
  },
  {
    id: 'burnout-2',
    category: 'burnout',
    title: 'Public Accountability Ghost',
    rule: 'Coding in isolation breeds impostor syndrome and slow project strangulation.',
    actionableStep: 'Tweet or post an unpolished screenshot or git commit diff every 48 hours. Even 2 likes or comments creates the social proof needed to push through.',
    badge: 'Burnout Antidote'
  },
  {
    id: 'tech-1',
    category: 'tech',
    title: 'The Boring Technology Doctrine',
    rule: 'Choose boring technology. Every new, unproven tool incurs a novelty tax that drains your limited willpower.',
    actionableStep: 'Permit yourself at most ONE unfamiliar library or paradigm per project. Build everything else on the battle-tested stack you can code blindfolded.',
    badge: 'Architecture'
  },
  {
    id: 'tech-2',
    category: 'tech',
    title: 'The 120-Minute Rabbit Hole Ceiling',
    rule: 'If a single bug, build error, or dependency conflict blocks you for >2 hours, you are solving the wrong problem.',
    actionableStep: 'Immediately pivot: substitute the library, mock the feature, or simplify the requirement. Never let a peripheral tool kill a core vision.',
    badge: 'Architecture'
  },
  {
    id: 'val-1',
    category: 'validation',
    title: 'The Smoke Test Landing Page',
    rule: 'Never build a database schema for customers who haven\'t confirmed they want the solution.',
    actionableStep: 'Put up a 1-page site with a mock screenshot and an email waitlist. If 10 strangers don\'t sign up, rethink the value proposition before writing backend code.',
    badge: 'Validation'
  },
  {
    id: 'val-2',
    category: 'validation',
    title: 'The 5-Conversation Rule',
    rule: 'Your code is an assumption until validated by real human interaction.',
    actionableStep: 'DM 5 people in your target niche. Ask: "How do you currently handle X problem?" If their pain isn\'t acute, your project will die of indifference.',
    badge: 'Validation'
  },
  {
    id: 'revival-1',
    category: 'revival',
    title: 'The Triage Guillotine or Burial',
    rule: 'A zombie project hanging over your head drains emotional RAM from your next great creation.',
    actionableStep: 'If a project has sat untouched for 60 days: give yourself 48 hours to ship a barebones functional v1, or lay it to rest with pride here on DevGraveyard.',
    badge: 'Emergency Triage'
  }
];

const DANGER_SIGNS = [
  "Spent more than 2 weeks on Auth, Settings, or Dark Mode before the core loop works",
  "Rewriting the UI in a newer framework or state management library before v1 launched",
  "Backlog has >25 planned features while active real-world users is exactly 0",
  "Haven't shown anyone outside your immediate circle in over 3 weeks",
  "Refactoring architecture for 'scale' when you have zero database records",
  "Dreading opening the repository due to tangled, undocumented spaghetti code"
];

export const SurvivalGuideModal: React.FC<SurvivalGuideModalProps> = ({ onClose }) => {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [checkedDangers, setCheckedDangers] = useState<number[]>([]);

  const toggleDanger = (index: number) => {
    setCheckedDangers(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleCopyTactic = async (tactic: SurvivalTactic) => {
    const text = `💡 Dev Survival Rule: ${tactic.title}\nRule: "${tactic.rule}"\nAction: ${tactic.actionableStep}\n(via DevGraveyard Project Survival Guide)`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(tactic.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const filteredTactics = activeCategory === 'all' 
    ? TACTICS 
    : TACTICS.filter(t => t.category === activeCategory);

  const dangerScore = checkedDangers.length;
  let dangerStatus = {
    label: '🟢 HEALTHY VITAL SIGNS',
    desc: 'Low mortality risk. Keep shipping ruthlessly and avoid scope creep!',
    color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30'
  };

  if (dangerScore >= 4) {
    dangerStatus = {
      label: '🔴 CRITICAL PERIL: CODEBASE FLATLINING',
      desc: 'High mortality risk! Slash 80% of your scope today or execute the Emergency Revival Checklist.',
      color: 'text-red-400 border-red-500/40 bg-red-950/30'
    };
  } else if (dangerScore >= 2) {
    dangerStatus = {
      label: '🟡 WARNING: CRYPT DRIFT DETECTED',
      desc: 'Moderate risk. You are spending time on non-essentials. Cut scope and talk to users.',
      color: 'text-amber-400 border-amber-500/40 bg-amber-950/30'
    };
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-6" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-[0_0_80px_rgba(0,0,0,0.95)] p-5 sm:p-8 flex flex-col gap-6 overflow-hidden z-10 max-h-[90vh] overflow-y-auto custom-scrollbar ring-1 ring-white/5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
        <div className="absolute -top-24 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-2xl font-bold font-serif text-white tracking-wide">
                  Project Survival Guide
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Antidote Manual
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 font-mono mt-0.5">
                Tactics & field tests to prevent your code from ending up in this cemetery
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Interactive Danger Signs Risk Meter */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-zinc-200 font-mono text-xs sm:text-sm font-semibold">
              <HeartPulse className="w-4 h-4 text-rose-400 animate-pulse" />
              <span>Project Mortality Risk Self-Assessment</span>
            </div>
            <span className="text-[11px] font-mono text-zinc-400">
              Check all symptoms that apply to your current project:
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
            {DANGER_SIGNS.map((sign, idx) => (
              <label 
                key={idx} 
                className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                  checkedDangers.includes(idx)
                    ? 'bg-rose-950/30 border-rose-500/50 text-rose-200'
                    : 'bg-black/30 border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
                }`}
              >
                <input 
                  type="checkbox" 
                  checked={checkedDangers.includes(idx)} 
                  onChange={() => toggleDanger(idx)} 
                  className="mt-0.5 accent-rose-500 w-3.5 h-3.5 rounded cursor-pointer shrink-0"
                />
                <span className="leading-snug">{sign}</span>
              </label>
            ))}
          </div>

          <div className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-1 ${dangerStatus.color}`}>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span className="font-mono font-bold text-xs tracking-wider">{dangerStatus.label}</span>
            </div>
            <span className="text-xs font-mono">{dangerStatus.desc}</span>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { id: 'all', label: 'All Tactics', icon: BookOpen },
              { id: 'scope', label: 'Scope Guillotine', icon: ShieldAlert },
              { id: 'burnout', label: 'Burnout Antidote', icon: Flame },
              { id: 'tech', label: 'Tech Roadblocks', icon: Sparkles },
              { id: 'validation', label: 'Early Validation', icon: Compass },
              { id: 'revival', label: 'Emergency Revival', icon: HeartPulse }
            ] as const
          ).map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id as CategoryId)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono tracking-wide transition-all ${
                  activeCategory === tab.id
                    ? 'bg-amber-500/20 border border-amber-500/60 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tactical Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredTactics.map((tactic) => (
              <motion.div
                key={tactic.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-zinc-900/40 border border-zinc-800/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-3 hover:border-zinc-700 hover:bg-zinc-900/60 transition-all group"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {tactic.badge}
                    </span>
                    <button
                      onClick={() => handleCopyTactic(tactic)}
                      className="text-zinc-500 hover:text-amber-400 p-1 rounded transition-colors"
                      title="Copy Rule to Clipboard"
                    >
                      {copiedId === tactic.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-200 transition-colors">
                    {tactic.title}
                  </h3>

                  <p className="text-xs sm:text-sm font-serif italic text-zinc-300 bg-black/40 p-3 rounded-xl border border-white/5">
                    "{tactic.rule}"
                  </p>
                </div>

                <div className="border-t border-zinc-800/80 pt-2.5 flex flex-col gap-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400/90 font-semibold">
                    Actionable Prescription:
                  </span>
                  <p className="text-xs text-zinc-400 font-mono leading-relaxed">
                    {tactic.actionableStep}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-zinc-800 pt-4 text-xs font-mono text-zinc-500">
          <span>DevGraveyard Survival Codex v1.0</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
          >
            Close Guide
          </button>
        </div>
      </motion.div>
    </div>
  );
};
