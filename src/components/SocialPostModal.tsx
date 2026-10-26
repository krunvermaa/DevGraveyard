import React, { useState, useMemo } from 'react';
import { Grave } from '../types';
import { motion } from 'motion/react';
import { Copy, Check, Sparkles, X, Share2, ExternalLink } from 'lucide-react';

interface SocialPostModalProps {
  grave: Grave;
  onClose: () => void;
}

type Tone = 'reflective' | 'technical' | 'humorous';

export const SocialPostModal: React.FC<SocialPostModalProps> = ({ grave, onClose }) => {
  const [tone, setTone] = useState<Tone>('reflective');
  const [copied, setCopied] = useState(false);
  const [customText, setCustomText] = useState<string | null>(null);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://devgraveyard.app';
  const graveUrl = `${baseUrl}/grave/${grave.id}`;

  const generatedPosts = useMemo(() => {
    const lifespan = grave.lived_for ? grave.lived_for : 'Several months of grit';
    const tech = grave.tech_stack ? grave.tech_stack : 'Modern full-stack';

    return {
      reflective: `I laid my project "${grave.project_name}" to rest on DevGraveyard today.

Here is the honest post-mortem:
⏱️ Lifespan: ${lifespan}
💻 Stack: ${tech}
💀 Cause of Death: ${grave.cause_of_death}

The hardest lesson I took away:
"${grave.lesson_learned}"

As developers, we celebrate launches and vanity metrics. But real engineering growth happens in the quiet graveyard of projects that didn't make it.

If you're currently grinding on a project that feels stuck:
1. Cut scope ruthlessly before it drains your momentum.
2. An imperfect v1 shipped teaches 10x more than an unreleased masterpiece.
3. Don't fear pulling the plug—memorialize the lesson and build the next one wiser.

Memorialized on DevGraveyard: ${graveUrl}

#buildinpublic #softwareengineering #indiehackers #postmortem #devgraveyard #learnfromfailure`,

      technical: `🛠️ Engineering Post-Mortem: Why "${grave.project_name}" didn't survive

Every software engineer has a quiet repo graveyard. Here is mine:

• Project: ${grave.project_name}
• Fatal Flaw: ${grave.cause_of_death}
• Tech Stack: ${tech}
• Operational Lifespan: ${lifespan}

Architectural & Strategic Lesson:
"${grave.lesson_learned}"

Key takeaways for engineering leaders & indie developers:
→ Beware premature optimization and complexity. Simple stacks that ship win over elegant architectures that stall.
→ Scope expands asymptotically unless aggressively pruned.
→ Code is a liability; solved user problems are the only asset.

Full archive & post-mortem record:
${graveUrl}

#techpostmortem #softwarearchitecture #webdev #cleancode #devgraveyard`,

      humorous: `Rest in Peace, "${grave.project_name}" (${lifespan}). 🪦

Officially giving my side project an honorable funeral on DevGraveyard today.

Cause of death: ${grave.cause_of_death}.
Tech stack: ${tech}.

What did this project teach me?
"${grave.lesson_learned}"

May its git branches rest in eternal peace. Now excuse me while I go brainstorm another side project that I swear I will finish this time. 🫡

Leave a eulogy or pay respects: ${graveUrl}

#developerhumor #programming #devlife #sideproject #buildinpublic #devgraveyard`
    };
  }, [grave, graveUrl]);

  const activeContent = customText !== null ? customText : generatedPosts[tone];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(
      `Rest in peace ${grave.project_name}. Cause of death: ${grave.cause_of_death}.\n\nLesson learned: "${grave.lesson_learned}"\n\nMemorialized on DevGraveyard: ${graveUrl}\n\n#buildinpublic #devgraveyard`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareLinkedIn = () => {
    // Copy the full content to clipboard for easy pasting, then open LinkedIn share dialog
    handleCopy();
    const shareUrl = encodeURIComponent(graveUrl);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6" role="dialog" aria-modal="true">
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
        className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.9)] p-5 sm:p-7 flex flex-col gap-4 overflow-hidden z-10 max-h-[92vh] overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#0077b5]/50 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0077b5]/20 border border-[#0077b5]/40 flex items-center justify-center text-[#0077b5]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                LinkedIn & Social Mistake Analysis
              </h3>
              <p className="text-xs text-zinc-400 font-mono">
                Transform this failure into thought-leadership & genuine lessons
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tone Selection Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-mono text-zinc-400 mr-1 uppercase tracking-wider">Tone:</span>
          {(['reflective', 'technical', 'humorous'] as Tone[]).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTone(t);
                setCustomText(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono tracking-wide transition-all ${
                tone === t && customText === null
                  ? 'bg-[#0077b5]/25 border border-[#0077b5]/60 text-cyan-200 shadow-[0_0_12px_rgba(0,119,181,0.3)]'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              {t === 'reflective' && '💡 Growth & Reflection'}
              {t === 'technical' && '🛠️ Engineering Post-Mortem'}
              {t === 'humorous' && '🔥 Honest & Humorous'}
            </button>
          ))}
        </div>

        {/* Post Preview / Editor */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>Ready-to-publish Post Content</span>
            <span>{activeContent.length} chars</span>
          </div>
          <div className="relative">
            <textarea
              value={activeContent}
              onChange={(e) => setCustomText(e.target.value)}
              rows={11}
              className="w-full bg-black/60 border border-zinc-800 rounded-xl p-4 text-xs sm:text-sm text-zinc-200 font-sans leading-relaxed focus:outline-none focus:border-[#0077b5]/60 focus:ring-1 focus:ring-[#0077b5]/40 transition-all resize-none custom-scrollbar"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-zinc-800/80">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider font-semibold transition-all shadow-md ${
                copied
                  ? 'bg-emerald-600/30 border border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'bg-white text-zinc-950 hover:bg-zinc-200'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" /> Copied to Clipboard!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> 1-Click Copy Post
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareLinkedIn}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0077b5]/20 border border-[#0077b5]/50 text-[#38bdf8] hover:bg-[#0077b5]/30 hover:border-[#0077b5] font-mono text-xs tracking-wider transition-all"
              title="Copy text & Open LinkedIn"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>LinkedIn</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </button>

            <button
              onClick={handleShareTwitter}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 font-mono text-xs tracking-wider transition-all"
              title="Share on X"
            >
              <span>X (Twitter)</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </button>
          </div>
        </div>

        {copied && (
          <p className="text-[11px] font-mono text-emerald-400 text-center animate-fade-in">
            ✓ Post copied! Paste it into LinkedIn or Twitter to share your hard-earned wisdom.
          </p>
        )}
      </motion.div>
    </div>
  );
};
