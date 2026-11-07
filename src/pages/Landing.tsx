import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { motion } from 'motion/react';
import { 
  PlusCircle, 
  Search, 
  Ghost, 
  Trophy, 
  Sparkles, 
  Share2, 
  ShieldCheck, 
  ArrowRight, 
  HelpCircle, 
  ChevronDown,
  Flame,
  KeyRound,
  ExternalLink
} from 'lucide-react';
import { Grave } from '../types';
import { getGraves } from '../services/graveService';
import { GraveCard } from '../components/GraveCard';
import { GraveModal } from '../components/GraveModal';
import { useAuth } from '../contexts/AuthContext';

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
    answer: "Yes. During the burial ritual, toggle Unmarked Grave. Your post-mortem, cause of death, and lessons learned will remain visible for other developers, while your username and avatar stay hidden."
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
    question: "Is Dev Graveyard free to use?",
    answer: "Yes, completely free and open source. Dev Graveyard is built by developers for developers to share honest post-mortems and celebrate the real learning that happens through abandoned builds."
  }
];

// Fallback curated sample graves if database is empty or loading
const SAMPLE_SHOWCASE_GRAVES: Grave[] = [
  {
    id: 'sample-neural-scribe',
    project_name: 'NeuralScribe AI',
    user_id: 'sample-user-1',
    user_name: 'vector_ghost',
    user_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    created_at: '2025-04-12T00:00:00.000Z',
    lived_for: '8 months',
    cause_of_death: 'Scope Creep & API Costs',
    tech_stack: 'Next.js, Python, LangChain, Pinecone, OpenAI',
    lesson_learned: 'Built an entire orchestration engine before having 3 paying users. Should have launched with a simple wrapper and validated willingness to pay before scaling vector databases.',
    respects: 42,
    rips: ['alice_dev', 'kernel_panic', 'syntax_error'],
    eulogies: [
      {
        id: 'e1',
        text: 'The architecture diagram was poetry. May the vector embeddings rest in peace.',
        user_name: 'alice_dev',
        user_id: 'alice-uid',
        created_at: '2025-05-01T12:00:00.000Z'
      }
    ],
    github_link: 'https://github.com',
    is_anonymous: false
  },
  {
    id: 'sample-rust-game-engine',
    project_name: 'VoxelForge Engine',
    user_id: 'sample-user-2',
    user_name: 'byte_sorcerer',
    user_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    created_at: '2024-11-20T00:00:00.000Z',
    lived_for: '1.5 years',
    cause_of_death: 'Engine Rewrite Rabbit Hole',
    tech_stack: 'Rust, WGPU, ECS, WGSL shaders',
    lesson_learned: 'I spent 18 months writing an entity component system from scratch instead of making an actual game. If you want to build games, use an existing engine. If you want to build engines, accept that games won\'t emerge.',
    respects: 89,
    rips: ['game_dev_veteran', 'zero_cost', 'borrow_checker'],
    eulogies: [
      {
        id: 'e2',
        text: 'Pressing F with deep respect. Every Rust programmer must traverse this rite of passage.',
        user_name: 'zero_cost',
        user_id: 'zero-uid',
        created_at: '2024-12-05T14:30:00.000Z'
      }
    ],
    github_link: 'https://github.com',
    is_anonymous: false
  },
  {
    id: 'sample-coffeeshop-app',
    project_name: 'BrewPeer Local',
    user_id: 'sample-user-3',
    user_name: 'caffeine_overflow',
    user_avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
    created_at: '2025-08-01T00:00:00.000Z',
    lived_for: '3 months',
    cause_of_death: 'Market Fit Missing',
    tech_stack: 'React Native, Supabase, Tailwind, Stripe',
    lesson_learned: 'Coffee drinkers do not want to download a separate mobile app for a 50 cent discount on cold brew. Talk to your target customers in the real world before writing 10,000 lines of mobile UI.',
    respects: 31,
    rips: ['barista_coder', 'product_lead'],
    eulogies: [
      {
        id: 'e3',
        text: 'The UI was silky smooth though. RIP BrewPeer.',
        user_name: 'barista_coder',
        user_id: 'barista-uid',
        created_at: '2025-08-15T09:12:00.000Z'
      }
    ],
    github_link: '',
    is_anonymous: false
  }
];

export const Landing: React.FC = () => {
  const { user } = useAuth();
  const [graves, setGraves] = useState<Grave[]>(SAMPLE_SHOWCASE_GRAVES);
  const [selectedGrave, setSelectedGrave] = useState<Grave | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    getGraves().then(data => {
      if (data && data.length > 0) {
        setGraves(data.slice(0, 6));
      }
    }).catch(() => {
      // Retain sample showcase graves on error
    });
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaq(prev => prev === index ? null : index);
  };

  return (
    <div className="space-y-20 md:space-y-32 max-w-6xl mx-auto mb-24 px-4 sm:px-6 lg:px-8 animate-fade-in">
      {/* Detail Modal for Previewing Sample Graves */}
      {selectedGrave && (
        <GraveModal 
          grave={selectedGrave} 
          onClose={() => setSelectedGrave(null)} 
        />
      )}

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center pt-8 md:pt-16 pb-6 space-y-8 relative">
        {/* Subtle Ambient Crimson Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[550px] h-48 bg-[#c53030]/15 blur-[100px] pointer-events-none rounded-full" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#c53030]/40 bg-[#c53030]/10 text-xs font-mono text-[#f87171] uppercase tracking-widest shadow-inner">
          <span className="w-2 h-2 rounded-full bg-[#f87171] animate-pulse" />
          <span>Sanctuary for Abandoned Code</span>
        </div>

        <div className="space-y-5 max-w-3xl relative z-10">
          <h1 className="font-bold tracking-tighter font-mono drop-shadow-[0_0_20px_rgba(205,32,32,0.6)] leading-tight text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-[#dc2626]">
            Dev Graveyard
          </h1>

          <p className="text-base sm:text-lg md:text-2xl text-zinc-200 leading-relaxed font-serif italic max-w-2xl mx-auto">
            "A resting place for abandoned developer projects and the lessons they left behind."
          </p>

          <p className="text-xs sm:text-sm font-mono text-[#f87171] uppercase tracking-widest pt-1">
            Where dead code finds peace and developers find wisdom.
          </p>

          <p className="text-xs sm:text-sm md:text-base text-zinc-400 max-w-2xl mx-auto font-sans leading-relaxed pt-2">
            Every software engineer has repositories that never made it to production. Late-night prototypes, side projects starved of time, or grand architectures crushed by scope creep. Instead of letting that code rot forgotten on your disk, lay it to rest with dignity and pass down your lessons.
          </p>
        </div>

        {/* Primary CTAs */}
        <div className="relative z-10 flex flex-wrap items-center justify-center gap-3.5 pt-2">
          <Link to="/cemetery">
            <Button className="h-11 px-7 text-xs sm:text-sm font-mono uppercase tracking-widest border border-[#c53030] bg-[#c53030] text-white hover:bg-[#b02727] hover:border-[#b02727] shadow-[0_0_25px_rgba(197,48,48,0.45)] hover:shadow-[0_0_35px_rgba(197,48,48,0.7)] transition-all cursor-pointer rounded-xl flex items-center gap-2">
              <Search className="w-4 h-4" />
              <span>Explore Cemetery</span>
            </Button>
          </Link>

          <Link to={user ? "/submit" : "/login"}>
            <Button variant="secondary" className="h-11 px-6 text-xs sm:text-sm font-mono uppercase tracking-widest border border-zinc-700 bg-surface text-zinc-100 hover:text-white hover:bg-zinc-800 hover:border-[#c53030]/70 transition-all cursor-pointer rounded-xl flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-[#c53030]" />
              <span>Bury a Project</span>
            </Button>
          </Link>

          <Link to="/confessions">
            <Button variant="secondary" className="h-11 px-5 text-xs sm:text-sm font-mono uppercase tracking-widest border border-zinc-800 bg-black/50 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-all cursor-pointer rounded-xl flex items-center gap-2">
              <Ghost className="w-4 h-4 text-[#c53030]" />
              <span>Read Confessions</span>
            </Button>
          </Link>

          <Link to="/leaderboard">
            <Button variant="secondary" className="h-11 px-5 text-xs sm:text-sm font-mono uppercase tracking-widest border border-zinc-800 bg-black/50 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-all cursor-pointer rounded-xl flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#c53030]" />
              <span>The Pantheon</span>
            </Button>
          </Link>
        </div>

        {/* Quick Social Proof Metrics */}
        <div className="pt-6 grid grid-cols-3 gap-6 sm:gap-12 text-center font-mono border-t border-zinc-900/80 w-full max-w-xl">
          <div>
            <div className="text-xl sm:text-2xl font-bold text-white">100%</div>
            <div className="text-[10px] sm:text-xs text-zinc-500 uppercase">Honest Failures</div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-[#c53030]">Press F</div>
            <div className="text-[10px] sm:text-xs text-zinc-500 uppercase">Peer Tributes</div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-white">0</div>
            <div className="text-[10px] sm:text-xs text-zinc-500 uppercase">Shame</div>
          </div>
        </div>
      </section>

      {/* Curated Showcase / Sample Graves Section */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-900 pb-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-[#c53030]">Live Memorials</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-mono">Recent Project Autopsies</h2>
            <p className="text-xs sm:text-sm text-zinc-400">Explore projects laid to rest by the developer community.</p>
          </div>
          <Link
            to="/cemetery"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#c53030] hover:text-[#ef4444] shrink-0"
          >
            <span>View Full Cemetery ({graves.length > 0 ? `${graves.length}+` : 'Browse'})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {graves.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-28 md:gap-y-36 pt-4 pb-12">
            {graves.map(grave => (
              <GraveCard 
                key={grave.id} 
                grave={grave} 
                onClick={() => setSelectedGrave(grave)} 
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center border border-zinc-800/60 rounded-xl bg-surface/40 space-y-3">
            <span className="text-3xl" role="img" aria-label="grave">🪦</span>
            <p className="text-zinc-400 font-mono text-sm">The cemetery ground awaits your fallen builds.</p>
            <Link to="/submit">
              <Button className="mt-2 text-xs font-mono uppercase bg-[#c53030] hover:bg-[#b02727]">
                Be the first to bury a project
              </Button>
            </Link>
          </div>
        )}
      </section>

      {/* Feature Highlights Grid */}
      <section className="space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="font-mono text-xs uppercase tracking-widest text-[#c53030]">Platform Features</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white font-mono">
            Crafted for the Experimental Builder
          </h2>
          <p className="text-sm text-zinc-400 font-sans">
            Every feature in DevGraveyard turns private dead-ends into communal wisdom.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="p-6 rounded-xl border border-zinc-800 bg-surface/60 backdrop-blur-sm space-y-3 hover:border-[#c53030]/60 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#c53030]/10 border border-[#c53030]/30 flex items-center justify-center text-[#c53030]">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-mono text-lg font-semibold text-white">AI-Powered Retrospectives</h3>
              <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
                Powered by Gemini models running on isolated serverless infrastructure. Analyzes your cause of death, architecture friction, and technical stack to extract a sharp engineering autopsy.
              </p>
            </div>
            <div className="pt-4 border-t border-zinc-900 text-[11px] font-mono text-zinc-500">
              Zero client key exposure
            </div>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-xl border border-zinc-800 bg-surface/60 backdrop-blur-sm space-y-3 hover:border-[#c53030]/60 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#c53030]/10 border border-[#c53030]/30 flex items-center justify-center text-[#c53030]">
                <Trophy className="w-5 h-5" />
              </div>
              <h3 className="font-mono text-lg font-semibold text-white">GraveScore Engine</h3>
              <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
                Dynamic algorithmic tiering from <span className="text-zinc-200">Humble Headstone</span> to <span className="text-amber-400">Mythic Mausoleum</span> based on lesson depth, endurance, verified open source status, and peer eulogies.
              </p>
            </div>
            <div className="pt-4 border-t border-zinc-900 text-[11px] font-mono text-zinc-500">
              4 distinct necrological tiers
            </div>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-xl border border-zinc-800 bg-surface/60 backdrop-blur-sm space-y-3 hover:border-[#c53030]/60 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#c53030]/10 border border-[#c53030]/30 flex items-center justify-center text-[#c53030]">
                <Share2 className="w-5 h-5" />
              </div>
              <h3 className="font-mono text-lg font-semibold text-white">One-Click Memorial Share Cards</h3>
              <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
                Generate high-resolution tombstone share images with QR codes, native 1-click sharing to X and LinkedIn, and Web Share API support to proudly display the projects you laid to rest.
              </p>
            </div>
            <div className="pt-4 border-t border-zinc-900 text-[11px] font-mono text-zinc-500">
              Native X & LinkedIn integrations
            </div>
          </div>

          {/* Feature 4 */}
          <div className="p-6 rounded-xl border border-zinc-800 bg-surface/60 backdrop-blur-sm space-y-3 hover:border-[#c53030]/60 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#c53030]/10 border border-[#c53030]/30 flex items-center justify-center text-[#c53030]">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="font-mono text-lg font-semibold text-white">Press 'F' to Pay Respects</h3>
              <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
                Interactive real-time tribute counter with rising soul embers. Acknowledges the countless late nights, discarded schemas, and weekend sprints poured into the project.
              </p>
            </div>
            <div className="pt-4 border-t border-zinc-900 text-[11px] font-mono text-zinc-500">
              Real-time Firestore tributes
            </div>
          </div>

          {/* Feature 5 */}
          <div className="p-6 rounded-xl border border-zinc-800 bg-surface/60 backdrop-blur-sm space-y-3 hover:border-[#c53030]/60 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#c53030]/10 border border-[#c53030]/30 flex items-center justify-center text-[#c53030]">
                <Ghost className="w-5 h-5" />
              </div>
              <h3 className="font-mono text-lg font-semibold text-white">Anonymous Confessions Crypt</h3>
              <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
                An anonymous confession wall for confessions that code cannot hide. From dropping production tables on a Friday to building microservices for 12 monthly active users.
              </p>
            </div>
            <div className="pt-4 border-t border-zinc-900 text-[11px] font-mono text-zinc-500">
              Permanent immutable crypt
            </div>
          </div>

          {/* Feature 6 */}
          <div className="p-6 rounded-xl border border-zinc-800 bg-surface/60 backdrop-blur-sm space-y-3 hover:border-[#c53030]/60 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#c53030]/10 border border-[#c53030]/30 flex items-center justify-center text-[#c53030]">
                <Trophy className="w-5 h-5" />
              </div>
              <h3 className="font-mono text-lg font-semibold text-white">The Developer Pantheon</h3>
              <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
                Hall of fame ranking the top 50 open-source repositories and celebrated monuments resting in the cemetery, evaluated by GraveScore.
              </p>
            </div>
            <div className="pt-4 border-t border-zinc-900 text-[11px] font-mono text-zinc-500">
              Leaderboard & Hall of Fame
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="space-y-6 max-w-3xl mx-auto">
        <div className="text-center space-y-2">
          <span className="font-mono text-xs uppercase tracking-widest text-[#c53030]">Inquiries</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-mono">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="border border-zinc-800/80 rounded-xl bg-zinc-950/40 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left font-mono text-xs sm:text-sm text-zinc-200 hover:text-white cursor-pointer"
                >
                  <span className="font-semibold">{faq.question}</span>
                  <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-[#c53030]' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed border-t border-zinc-900 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom Final Call to Action */}
      <section className="p-8 sm:p-12 rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-950 to-zinc-900/60 text-center space-y-6 relative overflow-hidden">
        <div className="max-w-xl mx-auto space-y-3">
          <span className="text-3xl" role="img" aria-label="grave">🪦</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-mono text-white tracking-tight">
            Have a project sleeping in your drive?
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
            Take 3 minutes to conduct the burial ritual. Turn forgotten commits into lasting insight and join fellow engineers in the sanctuary.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link to={user ? "/submit" : "/login"}>
            <Button className="h-11 px-8 text-xs sm:text-sm font-mono uppercase tracking-widest bg-[#c53030] hover:bg-[#b02727] text-white cursor-pointer rounded-sm shadow-lg">
              {user ? "Begin Burial Ritual" : "Enter the Graveyard"}
            </Button>
          </Link>
          <Link to="/cemetery">
            <Button variant="secondary" className="h-11 px-6 text-xs sm:text-sm font-mono uppercase tracking-widest border-zinc-700 hover:border-zinc-500 cursor-pointer rounded-sm">
              Explore the Cemetery
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
