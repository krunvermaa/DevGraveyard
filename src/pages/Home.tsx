import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getGraves } from '../services/graveService';
import { Grave } from '../types';
import { Button } from '../components/ui/Button';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PlusCircle, 
  Search, 
  Ghost, 
  Trophy, 
  Clock, 
  Flame, 
  BookOpen, 
  ShieldCheck, 
  Terminal, 
  GitBranch, 
  ArrowRight, 
  HelpCircle, 
  ChevronDown, 
  MessageSquare,
  Sparkles,
  Heart
} from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "What kind of projects belong in the Dev Graveyard?",
    answer: "Any project you built and eventually abandoned, shelved, or rewrote. Whether it was a 48-hour hackathon prototype, a weekend experiment with a new framework, a side-hustle SaaS that never gained traction, or an open-source library you no longer have time to maintain. If you wrote code and stopped, it has a dignified resting place here."
  },
  {
    question: "Do I have to connect my GitHub account or make my code public?",
    answer: "No. GitHub integration is completely optional. It is provided for your convenience to auto-populate repository metadata (stars, primary languages, last commit) with one click and earn the Open Source Sanctity bonus (+75 GraveScore). You can also enter project details entirely by hand, or omit repository URLs altogether."
  },
  {
    question: "Can I bury a project anonymously?",
    answer: "Yes. During the burial ritual, you can toggle 'Unmarked Grave (Anonymous)'. Your technical autopsy, cause of death, and lessons learned will be preserved for the community to learn from, but your personal handle and avatar will remain hidden in the mist."
  },
  {
    question: "How does the GraveScore Engine calculate tombstone tiers?",
    answer: "GraveScore is an automated 5-dimensional scoring model that evaluates the depth of wisdom in the epitaph (up to 300 pts), community respects and eulogies (+15 pts per Respect, +35 pts per Eulogy), lifespan endurance (up to 150 pts), open source sanctity (+75 pts for verified repos), and tech stack complexity (+10 pts per tool). Scores determine your tombstone tier: Humble Headstone (0–99), Venerable Crypt (100–299), Monument of the Slain (300–699), or Mythic Mausoleum (700+)."
  },
  {
    question: "What does 'Press F to Pay Respects' actually do?",
    answer: "Pressing 'F' (or clicking the tribute flame) increments the memorial's permanent RIP counter, triggers rising soul particles, and contributes to the author's community standing. Long-pressing the tribute button opens the mourners roster, showing fellow engineers who paused to acknowledge the effort."
  },
  {
    question: "Can I edit or delete my grave if I decide to revive the project?",
    answer: "Yes. You maintain full ownership over your memorials. Through your developer profile Crypt (/profile), you can view all graves you have laid to rest, update their post-mortem details, or permanently exhume and delete them whenever you wish."
  },
  {
    question: "Is Dev Graveyard free to use?",
    answer: "100% free and open. Dev Graveyard is built by developers, for developers, to destigmatize failed side-projects, preserve hard-won technical wisdom, and celebrate the messy reality of software engineering."
  }
];

export const Home: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [graves, setGraves] = useState<Grave[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getGraves();
        setGraves(data);
      } catch (error) {
        console.error("Failed to fetch graves count", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalRespects = graves.reduce((acc, g) => acc + (g.respects_count || 0), 0);
  const totalEulogies = graves.reduce((acc, g) => acc + (g.comments_count || 0), 0);

  const toggleFaq = (index: number) => {
    setOpenFaq(prev => prev === index ? null : index);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="space-y-20 md:space-y-28 max-w-6xl mx-auto mb-24 px-4 sm:px-6 lg:px-8"
    >
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center pt-8 pb-12 md:pt-16 md:pb-20 space-y-8 overflow-hidden">
        {/* Ambient Crimson Glow behind Title */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-[500px] h-36 bg-[#c53030]/12 blur-[80px] pointer-events-none rounded-full" />

        <motion.div 
          initial={{ y: -25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="space-y-5 max-w-3xl relative z-10 px-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#c53030]/30 bg-surface/80 text-[11px] font-mono uppercase tracking-widest text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c53030] animate-pulse" />
            <span>Digital Post-Mortems &amp; Open Repositories</span>
          </div>

          <h1 className="font-mono font-bold tracking-tighter text-[#c53030] drop-shadow-[0_0_20px_rgba(197,48,48,0.45)] leading-tight text-5xl sm:text-6xl md:text-7xl lg:text-8xl">
            Dev Graveyard
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-zinc-300 leading-relaxed font-serif font-light max-w-2xl mx-auto italic">
            "A resting place for abandoned developer projects — and the lessons they left behind."
          </p>

          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto font-sans leading-relaxed pt-2">
            Every software engineer has a folder of dead repositories: the 2:00 AM spark, the unmerged branches, the domain renewing next Tuesday. You didn't fail — you explored and learned what not to build. Dev Graveyard turns dead code into collective engineering wisdom.
          </p>
        </motion.div>

        {/* Primary Call to Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
          className="relative z-10 flex flex-wrap items-center justify-center gap-3.5 pt-2"
        >
          <Link to="/cemetery">
            <Button className="h-11 px-7 text-xs font-mono uppercase tracking-widest border border-[#c53030] bg-[#c53030] text-white hover:bg-[#b02727] hover:border-[#b02727] shadow-[0_0_20px_rgba(197,48,48,0.35)] hover:shadow-[0_0_30px_rgba(197,48,48,0.6)] transition-all cursor-pointer rounded-sm flex items-center gap-2">
              <Search className="w-3.5 h-3.5" />
              <span>Explore Cemetery</span>
            </Button>
          </Link>

          <Link to="/submit">
            <Button variant="secondary" className="h-11 px-7 text-xs font-mono uppercase tracking-widest border border-zinc-700 bg-surface/80 text-zinc-200 hover:text-white hover:bg-zinc-800 hover:border-[#c53030]/60 transition-all cursor-pointer rounded-sm flex items-center gap-2">
              <PlusCircle className="w-3.5 h-3.5 text-[#c53030]" />
              <span>Bury a Project</span>
            </Button>
          </Link>

          <Link to="/confessions">
            <Button variant="secondary" className="h-11 px-5 text-xs font-mono uppercase tracking-widest border border-zinc-800 bg-black/40 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-all cursor-pointer rounded-sm flex items-center gap-2">
              <Ghost className="w-3.5 h-3.5 text-[#c53030]" />
              <span>Confessions</span>
            </Button>
          </Link>

          <Link to="/leaderboard">
            <Button variant="secondary" className="h-11 px-5 text-xs font-mono uppercase tracking-widest border border-zinc-800 bg-black/40 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-all cursor-pointer rounded-sm flex items-center gap-2">
              <Trophy className="w-3.5 h-3.5 text-[#c53030]" />
              <span>Pantheon</span>
            </Button>
          </Link>
        </motion.div>

        {/* Live Cemetery Pulse Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full max-w-4xl pt-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 p-4 rounded-xl border border-zinc-800/80 bg-zinc-950/60 backdrop-blur-sm">
            <div className="text-center p-3 border-r border-zinc-900 last:border-none">
              <div className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">
                {loading ? '...' : graves.length}
              </div>
              <div className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-zinc-500 mt-1">
                Graves Laid to Rest
              </div>
            </div>

            <div className="text-center p-3 border-r border-zinc-900 last:border-none">
              <div className="text-2xl sm:text-3xl font-mono font-bold text-[#c53030] tracking-tight">
                {loading ? '...' : totalRespects}
              </div>
              <div className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-zinc-500 mt-1">
                Respects Paid (F)
              </div>
            </div>

            <div className="text-center p-3 border-r border-zinc-900 last:border-none">
              <div className="text-2xl sm:text-3xl font-mono font-bold text-zinc-200 tracking-tight">
                {loading ? '...' : totalEulogies}
              </div>
              <div className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-zinc-500 mt-1">
                Eulogies Inscribed
              </div>
            </div>

            <div className="text-center p-3">
              <div className="text-2xl sm:text-3xl font-mono font-bold text-zinc-300 tracking-tight">
                100%
              </div>
              <div className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-zinc-500 mt-1">
                Open Wisdom
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Core Philosophy Section */}
      <section className="border-t border-b border-zinc-900/80 py-12 md:py-16">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="font-mono text-xs uppercase tracking-widest text-[#c53030]">Our Manifesto</span>
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
            <h3 className="font-mono text-base font-semibold text-zinc-100">Destigmatize Failure</h3>
            <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
              Every experienced engineer has scrapped dozens of repositories. Abandoning an unfeasible architecture or wrong market hypothesis is a badge of pragmatism, not defeat.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-zinc-800/80 bg-zinc-950/40 space-y-3 relative overflow-hidden group hover:border-[#c53030]/50 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-[#c53030]/10 border border-[#c53030]/20 flex items-center justify-center text-[#c53030] font-mono text-lg">
              📜
            </div>
            <h3 className="font-mono text-base font-semibold text-zinc-100">Preserve The Epitaph</h3>
            <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
              The project may be dead, but the technical autopsy is permanent. Writing down what actually broke transforms a discarded side-project into a public masterclass.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-zinc-800/80 bg-zinc-950/40 space-y-3 relative overflow-hidden group hover:border-[#c53030]/50 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-[#c53030]/10 border border-[#c53030]/20 flex items-center justify-center text-[#c53030] font-mono text-lg">
              🪦
            </div>
            <h3 className="font-mono text-base font-semibold text-zinc-100">Honor The Midnight Hours</h3>
            <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
              Just because a project didn't become a venture-backed unicorn doesn't mean your late nights and weekend sprints were worthless. Lay your code to rest with dignity.
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
            A walkthrough of the tools and rituals available to every builder in the sanctuary.
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
                <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">01 // Sanctuary</span>
              </div>
              <h3 className="font-mono text-lg font-semibold text-white">The Cemetery Feed</h3>
              <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
                Browse hundreds of community-buried projects. Filter by programming language, framework, or standardized Cause of Death (Scope Creep, Technical Roadblocks, Market Fit Missing).
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
                <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">02 // The Ritual</span>
              </div>
              <h3 className="font-mono text-lg font-semibold text-white">The Burial Ritual</h3>
              <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
                A 3-step ceremonial submission. Connect GitHub to auto-fill repo stars and languages, declare what brought the project down, and carve your vital takeaway in The Epitaph.
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
                <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">03 // Tributes</span>
              </div>
              <h3 className="font-mono text-lg font-semibold text-white">Pay Respects &amp; Eulogies</h3>
              <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
                Press 'F' to salute hours poured into terminal windows. Leave technical condolences on the Eulogy Wall, or dispatch a fallen stone directly to a peer developer’s crypt inbox.
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
                <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">04 // Algorithm</span>
              </div>
              <h3 className="font-mono text-lg font-semibold text-white">The GraveScore Engine</h3>
              <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
                An objective 5-factor scoring engine evaluating lesson depth, community mourning, duration, and open-source sanctity. Unlocks Headstone, Crypt, Monument, and Mausoleum tiers.
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
                <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">05 // Raw Truth</span>
              </div>
              <h3 className="font-mono text-lg font-semibold text-white">Wall of Confessions</h3>
              <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
                Anonymous developer sins etched in slate. Pushed directly to main on a Friday? Bought 12 domains at 2 AM? Inscribe your confession without corporate filters or recruitment judgment.
              </p>
            </div>
            <div className="pt-4 border-t border-zinc-900">
              <Link to="/confessions" className="inline-flex items-center gap-1.5 text-xs font-mono text-[#c53030] hover:text-[#ef4444] transition-colors">
                <span>Inscribe or Read Sins</span>
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
                <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">06 // Hall of Fame</span>
              </div>
              <h3 className="font-mono text-lg font-semibold text-white">The Pantheon</h3>
              <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
                Our Hall of Fame honoring the top 50 verified open-source projects resting in the cemetery. Ranked by GraveScore and inspected by developers seeking code to fork or salvage.
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

      {/* How It Works - 3 Step Ritual */}
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
              <h3 className="font-mono text-base font-semibold text-white">Identify the Departed</h3>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed pl-11">
              Give your project its name and record how long you wrestled with it. Connect GitHub to pull repository stars and languages automatically.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#c53030]/20 border border-[#c53030] text-[#c53030] font-mono text-sm font-bold flex items-center justify-center">
                2
              </div>
              <h3 className="font-mono text-base font-semibold text-white">Perform the Autopsy</h3>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed pl-11">
              Declare what brought the project down: Scope Creep, Lack of Time, Technical Roadblocks, or Co-founder Conflict. Tag your tech stack.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#c53030]/20 border border-[#c53030] text-[#c53030] font-mono text-sm font-bold flex items-center justify-center">
                3
              </div>
              <h3 className="font-mono text-base font-semibold text-white">Carve the Epitaph</h3>
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

      {/* Frequently Asked Questions (Professional Accordion) */}
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
            Common questions from builders before burying their first project or browsing the catacombs.
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
          <span className="font-mono text-xs uppercase tracking-widest text-[#c53030]">The Cemetery Gates Await</span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-mono">
            Stop Letting Dead Code Haunt Your Hard Drive
          </h2>
          <p className="text-sm sm:text-base text-zinc-300 font-serif italic">
            "That repo you haven't touched in eight months isn't an MVP anymore — it's an autopsy waiting to be written. Give it an honorable burial, share what it taught you, and clear your headspace for the next build."
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
