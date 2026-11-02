import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PlusCircle, 
  Search, 
  Ghost, 
  Trophy, 
  Flame, 
  ShieldCheck, 
  ArrowRight, 
  HelpCircle, 
  ChevronDown
} from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "What kind of projects belong in the Dev Graveyard?",
    answer: "Any project you worked on and eventually put aside, shelved, or rewrote. Whether it was a 48 hour hackathon build, a weekend experiment with a new framework, a side project that ran out of steam, or an open source library you no longer maintain. If you wrote code and stopped, you can lay it to rest here."
  },
  {
    question: "Do I have to connect my GitHub account or make my code public?",
    answer: "No. GitHub integration is completely optional. It is there so you can pull repository details like stars and languages with one click and earn the Open Source Sanctity bonus points. You can also enter your project details manually, or leave the repository link empty."
  },
  {
    question: "Can I bury a project anonymously?",
    answer: "Yes. During the burial ritual, toggle Unmarked Grave. Your post mortem, cause of death, and lessons learned will remain visible for other developers, while your username and avatar stay hidden."
  },
  {
    question: "How does the GraveScore Engine calculate tombstone tiers?",
    answer: "GraveScore evaluates the depth of your written lessons, community respects and eulogies, project lifespan, open source status, and tech stack complexity. Scores determine your tombstone tier: Humble Headstone, Venerable Crypt, Monument of the Slain, or Mythic Mausoleum."
  },
  {
    question: "What does 'Press F to Pay Respects' actually do?",
    answer: "Pressing F increments the memorial respect counter, triggers rising soul embers, and acknowledges the hours invested into the build. Long pressing the button reveals the list of peers who visited the grave."
  },
  {
    question: "Can I edit or delete my grave if I decide to revive the project?",
    answer: "Yes. You retain full control over your memorials. Through your developer profile Crypt, you can view your buried projects, update the details, or delete them whenever you want."
  },
  {
    question: "Is Dev Graveyard free to use?",
    answer: "Yes, completely free. Dev Graveyard is built by developers for developers to share honest post mortems and celebrate the real learning that happens through abandoned builds."
  }
];

export const Home: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(prev => prev === index ? null : index);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="space-y-16 md:space-y-24 max-w-6xl mx-auto mb-20 px-4 sm:px-6 lg:px-8"
    >
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-10 md:py-16 space-y-6 relative overflow-hidden">
        {/* Subtle Ambient Crimson Glow behind Title */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-[500px] h-36 bg-[#c53030]/10 blur-[80px] pointer-events-none rounded-full" />

        <motion.div 
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-4 w-full max-w-3xl relative z-10 px-4"
        >
          <motion.h1 
            className="font-bold tracking-tighter font-mono drop-shadow-[0_0_15px_rgba(205,32,32,0.5)] leading-tight text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[96px] w-full text-center text-[#b91c1c]"
          >
            Dev Graveyard
          </motion.h1>

          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-zinc-300 leading-relaxed font-serif font-light max-w-xl mx-auto italic">
            A resting place for abandoned developer projects and the lessons they left behind.
          </p>

          <p className="text-xs sm:text-sm md:text-base text-zinc-400 max-w-2xl mx-auto font-sans leading-relaxed pt-2">
            Every developer has projects that never made it to production. Late night ideas, side projects that lost momentum, or prototypes that hit a dead end. Instead of letting that code sit forgotten on your drive, lay it to rest here and share what you learned along the way.
          </p>
        </motion.div>

        {/* Primary Call to Actions */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="relative z-10 flex flex-wrap items-center justify-center gap-3.5 pt-2"
        >
          <Link to="/cemetery">
            <Button className="h-10 px-6 text-xs sm:text-sm font-mono uppercase tracking-widest border border-[#c53030] bg-[#c53030] text-white hover:bg-[#b02727] hover:border-[#b02727] shadow-[0_0_20px_rgba(197,48,48,0.35)] hover:shadow-[0_0_30px_rgba(197,48,48,0.6)] transition-all cursor-pointer rounded-sm flex items-center gap-2">
              <Search className="w-3.5 h-3.5" />
              <span>Explore Cemetery</span>
            </Button>
          </Link>

          <Link to="/submit">
            <Button variant="secondary" className="h-10 px-6 text-xs sm:text-sm font-mono uppercase tracking-widest border border-zinc-700 bg-surface/80 text-zinc-200 hover:text-white hover:bg-zinc-800 hover:border-[#c53030]/60 transition-all cursor-pointer rounded-sm flex items-center gap-2">
              <PlusCircle className="w-3.5 h-3.5 text-[#c53030]" />
              <span>Bury a Project</span>
            </Button>
          </Link>

          <Link to="/confessions">
            <Button variant="secondary" className="h-10 px-5 text-xs sm:text-sm font-mono uppercase tracking-widest border border-zinc-800 bg-black/40 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-all cursor-pointer rounded-sm flex items-center gap-2">
              <Ghost className="w-3.5 h-3.5 text-[#c53030]" />
              <span>Confessions</span>
            </Button>
          </Link>

          <Link to="/leaderboard">
            <Button variant="secondary" className="h-10 px-5 text-xs sm:text-sm font-mono uppercase tracking-widest border border-zinc-800 bg-black/40 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-all cursor-pointer rounded-sm flex items-center gap-2">
              <Trophy className="w-3.5 h-3.5 text-[#c53030]" />
              <span>Pantheon</span>
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Core Philosophy Section */}
      <section className="border-t border-b border-zinc-900/80 py-12 md:py-16">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="font-mono text-xs uppercase tracking-widest text-[#c53030]">Our Purpose</span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono">
            Why We Memorialize Dead Code
          </h2>
          <p className="text-sm text-zinc-400 font-sans">
            Software development is an iterative craft of experiments. Here is what we believe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl border border-zinc-800/80 bg-zinc-950/40 space-y-3 relative overflow-hidden group hover:border-[#c53030]/50 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-[#c53030]/10 border border-[#c53030]/20 flex items-center justify-center text-[#c53030] font-mono text-lg">
              🥀
            </div>
            <h3 className="font-mono text-base font-semibold text-zinc-100">Normalize Failure</h3>
            <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
              Every experienced engineer has scrapped dozens of repositories. Stepping away from an unfeasible architecture or wrong idea is a normal part of building.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-zinc-800/80 bg-zinc-950/40 space-y-3 relative overflow-hidden group hover:border-[#c53030]/50 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-[#c53030]/10 border border-[#c53030]/20 flex items-center justify-center text-[#c53030] font-mono text-lg">
              📜
            </div>
            <h3 className="font-mono text-base font-semibold text-zinc-100">Preserve The Epitaph</h3>
            <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
              The project may be retired, but the technical autopsy remains valuable. Writing down what went wrong turns a discarded project into shared insight.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-zinc-800/80 bg-zinc-950/40 space-y-3 relative overflow-hidden group hover:border-[#c53030]/50 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-[#c53030]/10 border border-[#c53030]/20 flex items-center justify-center text-[#c53030] font-mono text-lg">
              🪦
            </div>
            <h3 className="font-mono text-base font-semibold text-zinc-100">Honor The Effort</h3>
            <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
              Even if a project never launched to millions, your late nights and weekend sprints still taught you something real. Give your code an honorable resting place.
            </p>
          </div>
        </div>
      </section>

      {/* Complete Platform Features Tour for Newbies */}
      <section className="space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="font-mono text-xs uppercase tracking-widest text-[#c53030]">Platform Guide</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white font-mono">
            Everything in Dev Graveyard
          </h2>
          <p className="text-sm text-zinc-400 font-sans">
            A walkthrough of the tools and features available to every developer in the sanctuary.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1: The Cemetery Feed */}
          <div className="p-6 rounded-xl border border-zinc-800 bg-surface/50 backdrop-blur-sm space-y-4 hover:border-[#c53030]/60 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-[#c53030]">
                  <Search className="w-5 h-5" />
                </span>
                <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Sanctuary</span>
              </div>
              <h3 className="font-mono text-lg font-semibold text-white">The Cemetery Feed</h3>
              <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
                Browse projects laid to rest by the community. Filter by programming language, framework, or cause of death such as Scope Creep, Technical Roadblocks, or Market Fit Missing.
              </p>
            </div>
            <div className="pt-4 border-t border-zinc-900">
              <Link to="/cemetery" className="inline-flex items-center gap-1.5 text-xs font-mono text-[#c53030] hover:text-[#ef4444] transition-colors">
                <span>Browse Cemetery Graves</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Feature 2: Burial Ritual */}
          <div className="p-6 rounded-xl border border-zinc-800 bg-surface/50 backdrop-blur-sm space-y-4 hover:border-[#c53030]/60 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-[#c53030]">
                  <PlusCircle className="w-5 h-5" />
                </span>
                <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">The Ritual</span>
              </div>
              <h3 className="font-mono text-lg font-semibold text-white">The Burial Ritual</h3>
              <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
                A simple 3 step ceremony. Connect GitHub to auto fill repo details, choose what brought the project down, and write your key lesson in the Epitaph.
              </p>
            </div>
            <div className="pt-4 border-t border-zinc-900">
              <Link to="/submit" className="inline-flex items-center gap-1.5 text-xs font-mono text-[#c53030] hover:text-[#ef4444] transition-colors">
                <span>Bury a Fallen Project</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Feature 3: Respects & Eulogies */}
          <div className="p-6 rounded-xl border border-zinc-800 bg-surface/50 backdrop-blur-sm space-y-4 hover:border-[#c53030]/60 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-[#c53030]">
                  <Flame className="w-5 h-5" />
                </span>
                <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Tributes</span>
              </div>
              <h3 className="font-mono text-lg font-semibold text-white">Pay Respects &amp; Eulogies</h3>
              <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
                Press F to salute hours put into terminal windows. Leave technical thoughts on the Eulogy Wall, or dispatch a memorial directly to a peer developer.
              </p>
            </div>
            <div className="pt-4 border-t border-zinc-900">
              <Link to="/chats" className="inline-flex items-center gap-1.5 text-xs font-mono text-[#c53030] hover:text-[#ef4444] transition-colors">
                <span>View Crypt Dispatches</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Feature 4: The GraveScore Engine */}
          <div className="p-6 rounded-xl border border-zinc-800 bg-surface/50 backdrop-blur-sm space-y-4 hover:border-[#c53030]/60 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-[#c53030]">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Scoring</span>
              </div>
              <h3 className="font-mono text-lg font-semibold text-white">The GraveScore Engine</h3>
              <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
                A 5 factor scoring engine evaluating lesson depth, community tributes, duration, and open source authenticity. Unlocks Headstone, Crypt, Monument, and Mausoleum tiers.
              </p>
            </div>
            <div className="pt-4 border-t border-zinc-900">
              <span className="text-[11px] font-mono text-zinc-500">
                🪦 Headstone &rarr; 🏛️ Crypt &rarr; ⚔️ Monument &rarr; 👑 Mausoleum
              </span>
            </div>
          </div>

          {/* Feature 5: Wall of Confessions */}
          <div className="p-6 rounded-xl border border-zinc-800 bg-surface/50 backdrop-blur-sm space-y-4 hover:border-[#c53030]/60 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-[#c53030]">
                  <Ghost className="w-5 h-5" />
                </span>
                <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Confessions</span>
              </div>
              <h3 className="font-mono text-lg font-semibold text-white">Wall of Confessions</h3>
              <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
                Anonymous developer confessions etched in stone. Pushed straight to main on a Friday? Bought multiple domains at 2 AM? Post your confession with complete privacy.
              </p>
            </div>
            <div className="pt-4 border-t border-zinc-900">
              <Link to="/confessions" className="inline-flex items-center gap-1.5 text-xs font-mono text-[#c53030] hover:text-[#ef4444] transition-colors">
                <span>Read Confessions</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Feature 6: Pantheon of the Dead */}
          <div className="p-6 rounded-xl border border-zinc-800 bg-surface/50 backdrop-blur-sm space-y-4 hover:border-[#c53030]/60 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-[#c53030]">
                  <Trophy className="w-5 h-5" />
                </span>
                <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Hall of Fame</span>
              </div>
              <h3 className="font-mono text-lg font-semibold text-white">The Pantheon</h3>
              <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
                The leaderboard ranking the top 50 verified open source projects resting in the cemetery. Ranked by GraveScore and inspected by developers looking for ideas to learn from.
              </p>
            </div>
            <div className="pt-4 border-t border-zinc-900">
              <Link to="/leaderboard" className="inline-flex items-center gap-1.5 text-xs font-mono text-[#c53030] hover:text-[#ef4444] transition-colors">
                <span>View Pantheon Leaderboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="p-8 sm:p-12 rounded-2xl border border-zinc-800 bg-zinc-950/60 relative overflow-hidden">
        <div className="text-center max-w-xl mx-auto space-y-2 mb-10">
          <span className="font-mono text-xs uppercase tracking-widest text-[#c53030]">Workflow</span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono">
            How to Lay Code to Rest
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-sans">
            Burying a dead repository takes two minutes. The wisdom preserved lasts forever.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#c53030]/20 border border-[#c53030] text-[#c53030] font-mono text-sm font-bold flex items-center justify-center">
                1
              </div>
              <h3 className="font-mono text-base font-semibold text-white">Identify the Project</h3>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed pl-11">
              Give your project its name and record how long you worked on it. Connect GitHub to pull repository stars and languages automatically.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#c53030]/20 border border-[#c53030] text-[#c53030] font-mono text-sm font-bold flex items-center justify-center">
                2
              </div>
              <h3 className="font-mono text-base font-semibold text-white">Select Cause of Death</h3>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed pl-11">
              Select what brought the project down, like Scope Creep, Lack of Time, Technical Roadblocks, or Co-founder Conflict. Tag your tech stack.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#c53030]/20 border border-[#c53030] text-[#c53030] font-mono text-sm font-bold flex items-center justify-center">
                3
              </div>
              <h3 className="font-mono text-base font-semibold text-white">Inscribe the Epitaph</h3>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed pl-11">
              Write the core lesson learned. What would you do differently next time? Your takeaway becomes an etched monument for other engineers.
            </p>
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link to="/submit">
            <Button className="h-10 px-8 text-xs font-mono uppercase tracking-widest border border-[#c53030] bg-[#c53030]/20 text-white hover:bg-[#c53030] transition-all rounded-sm">
              Begin the Burial Ceremony
            </Button>
          </Link>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="space-y-8 pt-4">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-zinc-800 bg-surface text-[11px] font-mono uppercase tracking-widest text-[#c53030]">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white font-mono">
            Everything You Need to Know
          </h2>
          <p className="text-sm text-zinc-400 font-sans">
            Common questions from builders before burying their first project or exploring the cemetery.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {FAQS.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className={`rounded-xl border transition-all overflow-hidden ${
                  isOpen 
                    ? 'border-[#c53030]/60 bg-zinc-950/90 shadow-[0_0_20px_rgba(197,48,48,0.1)]' 
                    : 'border-zinc-800/80 bg-zinc-950/40 hover:border-zinc-700'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-4 text-left cursor-pointer focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="font-mono text-sm sm:text-base font-medium text-zinc-200">
                    {faq.question}
                  </span>
                  <div className={`p-1 rounded border border-zinc-800 bg-zinc-900 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180 border-[#c53030]/50 text-[#c53030]' : 'text-zinc-500'}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed border-t border-zinc-900/80">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pre-Footer Final Call to Action */}
      <section className="relative p-10 sm:p-14 rounded-2xl border border-[#c53030]/30 bg-gradient-to-b from-surface/80 to-black text-center space-y-6 overflow-hidden">
        <div className="absolute inset-0 bg-[#c53030]/5 pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl mx-auto space-y-3">
          <span className="font-mono text-xs uppercase tracking-widest text-[#c53030]">The Cemetery Awaits</span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-mono">
            Stop Letting Dead Code Haunt Your Hard Drive
          </h2>
          <p className="text-sm sm:text-base text-zinc-300 font-serif italic">
            Give your old projects a proper sendoff. Share what went wrong, what you learned, and make room for your next build.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link to="/submit">
            <Button className="h-11 px-8 text-xs font-mono uppercase tracking-widest border border-[#c53030] bg-[#c53030] text-white hover:bg-[#b02727] transition-all shadow-[0_0_25px_rgba(197,48,48,0.4)] rounded-sm">
              Inscribe Your First Grave
            </Button>
          </Link>
          <Link to="/cemetery">
            <Button variant="secondary" className="h-11 px-8 text-xs font-mono uppercase tracking-widest border border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white hover:border-[#c53030]/60 transition-all rounded-sm">
              Explore The Cemetery
            </Button>
          </Link>
        </div>
      </section>
    </motion.div>
  );
};
