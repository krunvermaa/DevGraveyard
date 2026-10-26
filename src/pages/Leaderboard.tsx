import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import { Grave } from '../types';
import { 
  Loader2, 
  Trophy, 
  Flame, 
  ScrollText, 
  Link as LinkIcon, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  Clock, 
  Code2, 
  CheckCircle2, 
  Info,
  Crown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  calculateGraveScore, 
  calculateGraveScoreBreakdown, 
  getGraveTier, 
  isValidGithubRepoUrl,
  GraveTierName
} from '../services/graveScoreService';

type FilterMode = 'all' | 'opensource';

export const Leaderboard: React.FC = () => {
  const [graves, setGraves] = useState<Grave[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [expandedGraveId, setExpandedGraveId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const q = query(collection(db, 'graves'));
        const snapshot = await getDocs(q);
        const allGraves = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Grave));
        setGraves(allGraves);
      } catch (err) {
        console.error('Failed to load graves for leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const rankedGraves = useMemo(() => {
    return graves
      .map(grave => {
        const score = calculateGraveScore(grave);
        const breakdown = calculateGraveScoreBreakdown(grave);
        const tier = getGraveTier(score);
        return { grave, score, breakdown, tier };
      })
      .sort((a, b) => b.score - a.score);
  }, [graves]);

  const filteredGraves = useMemo(() => {
    return rankedGraves.filter(item => {
      if (filterMode === 'opensource') {
        if (!isValidGithubRepoUrl(item.grave.github_link)) {
          return false;
        }
      }
      if (selectedTier !== 'all' && item.tier.name !== selectedTier) {
        return false;
      }
      return true;
    });
  }, [rankedGraves, filterMode, selectedTier]);

  const top3 = useMemo(() => {
    return filteredGraves.slice(0, 3);
  }, [filteredGraves]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-12 h-12 text-[#c53030] animate-spin" />
        <span className="text-zinc-500 font-mono text-xs uppercase tracking-widest">
          Summoning the Pantheon of the Dead...
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in p-4 sm:p-6 md:p-8 pb-24">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-950/30 text-amber-400 text-xs font-mono tracking-widest uppercase">
          <Crown size={14} className="text-amber-400" /> Eternal Hall of Fame
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold font-serif text-white tracking-widest uppercase drop-shadow-[0_0_20px_rgba(197,48,48,0.4)]">
          The Pantheon of the Dead
        </h1>
        <p className="text-zinc-400 font-mono text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
          Honoring the most legendary abandoned projects. Ranked objectively and transparently by 
          Wisdom, Mourning Tributes, Lifespan Endurance, and Open Source Sanctity.
        </p>
      </div>

      {/* Filter Tabs & Tier Selectors */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-950/80 border border-zinc-800/80 p-3 sm:p-4 rounded-2xl backdrop-blur-sm">
        {/* Source Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-black/50 border border-zinc-800 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setFilterMode('all')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
              filterMode === 'all'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All Memorials ({rankedGraves.length})
          </button>
          <button
            onClick={() => setFilterMode('opensource')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              filterMode === 'opensource'
                ? 'bg-[#c53030]/20 text-[#f87171] border border-[#c53030]/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>Verified GitHub</span>
            <span className="text-[10px] opacity-75">
              ({rankedGraves.filter(g => isValidGithubRepoUrl(g.grave.github_link)).length})
            </span>
          </button>
        </div>

        {/* Tier Selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
          <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider shrink-0">Tier:</span>
          {(['all', 'Mythic Mausoleum', 'Monument of the Slain', 'Venerable Crypt', 'Humble Headstone'] as const).map(tierName => {
            const isSelected = selectedTier === tierName;
            const label = tierName === 'all' 
              ? 'All' 
              : tierName === 'Mythic Mausoleum' ? '👑 Mythic' 
              : tierName === 'Monument of the Slain' ? '⚔️ Monument'
              : tierName === 'Venerable Crypt' ? '🏛️ Crypt'
              : '🪦 Headstone';
            
            return (
              <button
                key={tierName}
                onClick={() => setSelectedTier(tierName)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-zinc-800 text-zinc-100 border border-zinc-600 font-bold'
                    : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border border-transparent'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Top 3 Podium Highlights (if available and not filtered out) */}
      {top3.length > 0 && selectedTier === 'all' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {top3.map(({ grave, score, tier }, idx) => {
            const podiumOrder = idx === 0 ? 'order-1 md:order-2 md:-translate-y-2' : idx === 1 ? 'order-2 md:order-1' : 'order-3';
            const borderGlow = idx === 0 
              ? 'border-amber-500/60 bg-gradient-to-b from-amber-950/30 to-zinc-950/80 shadow-[0_0_30px_rgba(245,158,11,0.2)]'
              : idx === 1 
              ? 'border-zinc-500/60 bg-gradient-to-b from-zinc-800/30 to-zinc-950/80 shadow-[0_0_20px_rgba(255,255,255,0.05)]'
              : 'border-amber-700/60 bg-gradient-to-b from-amber-900/20 to-zinc-950/80 shadow-[0_0_20px_rgba(180,83,9,0.1)]';

            return (
              <div
                key={grave.id}
                onClick={() => navigate(`/grave/${grave.id}`)}
                className={`relative rounded-2xl border p-5 flex flex-col justify-between gap-4 cursor-pointer transition-all duration-300 hover:scale-[1.02] ${podiumOrder} ${borderGlow}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-black/60 border border-white/10 font-mono font-bold text-sm">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                    </div>
                    <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                      Rank #{idx + 1}
                    </span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${tier.badgeColor}`}>
                    {tier.icon} {tier.name}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-lg text-white font-sans truncate">{grave.project_name}</h3>
                  <p className="text-xs font-mono text-zinc-400">
                    By @{grave.user_name || 'anonymous'}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">GraveScore</span>
                    <span className="text-2xl font-bold font-mono text-white tracking-tight">{score} <span className="text-xs text-zinc-400 font-normal">pts</span></span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
                    <span className="flex items-center gap-1"><Flame size={14} className="text-[#c53030]" /> {grave.respects || 0}</span>
                    <span className="flex items-center gap-1"><ScrollText size={14} className="text-zinc-500" /> {grave.eulogies ? (Array.isArray(grave.eulogies) ? grave.eulogies.length : Object.keys(grave.eulogies).length) : 0}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Main Ranked List */}
      <div className="space-y-3">
        {filteredGraves.length === 0 ? (
          <div className="text-center py-16 bg-zinc-950/60 rounded-2xl border border-zinc-800/80 space-y-3">
            <span className="text-3xl">🪦</span>
            <h3 className="text-lg font-bold text-zinc-300">No Restless Souls Found</h3>
            <p className="text-xs font-mono text-zinc-500 max-w-sm mx-auto">
              No graves matched the selected filters. Check back or bury a project of your own.
            </p>
          </div>
        ) : (
          filteredGraves.map(({ grave, score, breakdown, tier }, index) => {
            const isExpanded = expandedGraveId === grave.id;
            const eulogiesCount = grave.eulogies
              ? (Array.isArray(grave.eulogies) ? grave.eulogies.length : Object.keys(grave.eulogies).length)
              : 0;

            return (
              <div 
                key={grave.id} 
                className="bg-zinc-950/90 border border-zinc-800/80 hover:border-zinc-700/90 rounded-2xl p-4 sm:p-5 transition-all duration-300 shadow-xl"
              >
                <div 
                  onClick={() => navigate(`/grave/${grave.id}`)}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer"
                >
                  {/* Left: Rank & Title */}
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="flex-shrink-0 w-11 h-11 flex items-center justify-center bg-black/70 rounded-full border border-zinc-800 font-mono font-bold text-sm shadow-inner">
                      {index === 0 ? <Trophy className="text-yellow-500" size={20} /> : 
                       index === 1 ? <Trophy className="text-zinc-300" size={20} /> : 
                       index === 2 ? <Trophy className="text-amber-700" size={20} /> : 
                       <span className="text-zinc-500 font-mono">#{index + 1}</span>}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-lg text-zinc-100 hover:text-white transition-colors truncate">
                          {grave.project_name}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${tier.badgeColor}`}>
                          {tier.icon} {tier.name}
                        </span>
                      </div>

                      <div className="text-xs text-zinc-400 font-mono flex items-center gap-2 mt-1 flex-wrap">
                        <span>By @{grave.user_name || 'anonymous'}</span>
                        <span>•</span>
                        <span className="text-zinc-500">{grave.cause_of_death}</span>
                        {isValidGithubRepoUrl(grave.github_link) && (
                          <>
                            <span>•</span>
                            <a 
                              href={grave.github_link} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              onClick={e => e.stopPropagation()} 
                              className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 hover:underline"
                            >
                              <LinkIcon size={11} /> GitHub
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: GraveScore & Stats */}
                  <div className="flex items-center gap-5 shrink-0 self-end sm:self-center">
                    <div className="text-right">
                      <div className="text-2xl font-bold font-mono text-white tracking-tight flex items-baseline justify-end gap-1">
                        <span>{score}</span>
                        <span className="text-[11px] font-normal text-zinc-400">PTS</span>
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#c53030]">
                        GraveScore
                      </span>
                    </div>

                    <div className="flex items-center gap-3 bg-black/50 px-3 py-2 rounded-xl border border-white/5">
                      <div className="flex items-center gap-1 text-xs font-mono text-zinc-300" title="Respects paid">
                        <Flame className="text-[#c53030]" size={15} />
                        <span className="font-bold">{grave.respects || 0}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-mono text-zinc-300" title="Eulogies spoken">
                        <ScrollText className="text-zinc-400" size={15} />
                        <span className="font-bold">{eulogiesCount}</span>
                      </div>
                    </div>

                    {/* Breakdown Toggle Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedGraveId(isExpanded ? null : grave.id);
                      }}
                      className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all cursor-pointer"
                      title={isExpanded ? 'Hide score breakdown' : 'View score breakdown'}
                      aria-label="Toggle score breakdown"
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Score Breakdown Accordion */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-zinc-800/80 animate-fade-in text-xs font-mono space-y-3">
                    <div className="flex items-center justify-between text-zinc-400">
                      <span className="font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                        <Info size={14} className="text-[#c53030]" /> Transparent GraveScore Breakdown
                      </span>
                      <span className="text-zinc-500">Total: {score} pts</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {/* Wisdom */}
                      <div className="p-2.5 rounded-xl bg-black/40 border border-zinc-800/60 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-zinc-400">
                          <span className="flex items-center gap-1.5">
                            <BookOpen size={13} className="text-blue-400" /> Lessons Wisdom
                          </span>
                          <span className="font-bold text-white">{breakdown.lessonsWisdom} / 300</span>
                        </div>
                        <span className="text-[10px] text-zinc-500 mt-1 line-clamp-1 italic">
                          "{grave.lesson_learned}"
                        </span>
                      </div>

                      {/* Mourning Tributes */}
                      <div className="p-2.5 rounded-xl bg-black/40 border border-zinc-800/60 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-zinc-400">
                          <span className="flex items-center gap-1.5">
                            <Flame size={13} className="text-[#c53030]" /> Tributes
                          </span>
                          <span className="font-bold text-white">{breakdown.mourningTributes} pts</span>
                        </div>
                        <span className="text-[10px] text-zinc-500 mt-1">
                          {(grave.respects || 0)} RIPs (15 pts) + {eulogiesCount} Eulogies (35 pts)
                        </span>
                      </div>

                      {/* Lifespan */}
                      <div className="p-2.5 rounded-xl bg-black/40 border border-zinc-800/60 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-zinc-400">
                          <span className="flex items-center gap-1.5">
                            <Clock size={13} className="text-amber-400" /> Lifespan
                          </span>
                          <span className="font-bold text-white">{breakdown.lifespanEndurance} / 150</span>
                        </div>
                        <span className="text-[10px] text-zinc-500 mt-1 truncate">
                          Endurance: {grave.lived_for || 'Unknown'}
                        </span>
                      </div>

                      {/* Open Source */}
                      <div className="p-2.5 rounded-xl bg-black/40 border border-zinc-800/60 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-zinc-400">
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 size={13} className="text-emerald-400" /> Open Source
                          </span>
                          <span className="font-bold text-white">+{breakdown.openSourceSanctity} pts</span>
                        </div>
                        <span className="text-[10px] text-zinc-500 mt-1 truncate">
                          {breakdown.openSourceSanctity > 0 ? 'Verified GitHub Repository' : 'No Verified GitHub Repo'}
                        </span>
                      </div>

                      {/* Tech Complexity */}
                      <div className="p-2.5 rounded-xl bg-black/40 border border-zinc-800/60 flex flex-col justify-between sm:col-span-2 md:col-span-2">
                        <div className="flex items-center justify-between text-zinc-400">
                          <span className="flex items-center gap-1.5">
                            <Code2 size={13} className="text-purple-400" /> Tech Complexity
                          </span>
                          <span className="font-bold text-white">{breakdown.techComplexity} / 50 pts</span>
                        </div>
                        <span className="text-[10px] text-zinc-500 mt-1 truncate">
                          Stack: {grave.tech_stack || 'None specified'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
