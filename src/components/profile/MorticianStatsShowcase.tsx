import React from 'react';
import { motion } from 'motion/react';
import { MorticianStats, TechAutopsyReport } from '../../services/morticianService';
import { Skull, Flame, ScrollText, Trophy, Activity, ArrowRight, ShieldAlert } from 'lucide-react';

interface MorticianStatsShowcaseProps {
  stats: MorticianStats;
  autopsy: TechAutopsyReport;
  onNavigateToAutopsy?: () => void;
}

export const MorticianStatsShowcase: React.FC<MorticianStatsShowcaseProps> = ({
  stats,
  autopsy,
  onNavigateToAutopsy
}) => {
  return (
    <div className="space-y-4">
      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Graves Inscribed */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.4 }}
          className="relative bg-zinc-950/80 border border-zinc-800/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between overflow-hidden group hover:border-zinc-700 transition-all shadow-lg"
        >
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-zinc-600 to-transparent opacity-30 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-zinc-400 font-bold">
              Graves Inscribed
            </span>
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
              <Skull className="w-4 h-4 text-zinc-300 group-hover:text-red-400 transition-colors" />
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold font-serif text-white tracking-tight drop-shadow-sm">
              {stats.totalGraves}
            </div>
            <p className="text-[11px] font-mono text-zinc-400 mt-1">
              Projects laid to rest
            </p>
          </div>
        </motion.div>

        {/* Card 2: Respects Received (RIPs) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="relative bg-zinc-950/80 border border-zinc-800/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between overflow-hidden group hover:border-[#c53030]/50 transition-all shadow-lg"
        >
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#c53030] to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-red-400 font-bold">
              Respects (RIPs)
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-950/40 border border-red-900/50 flex items-center justify-center text-red-400">
              <Flame className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold font-serif text-red-100 tracking-tight drop-shadow-[0_0_10px_rgba(197,48,48,0.3)]">
              {stats.totalRespects}
            </div>
            <p className="text-[11px] font-mono text-zinc-400 mt-1">
              F keys pressed by mourners
            </p>
          </div>
        </motion.div>

        {/* Card 3: Eulogies Inscribed */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="relative bg-zinc-950/80 border border-zinc-800/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between overflow-hidden group hover:border-amber-700/50 transition-all shadow-lg"
        >
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-600 to-transparent opacity-40 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
              Eulogies Inscribed
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-950/30 border border-amber-900/50 flex items-center justify-center text-amber-400">
              <ScrollText className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold font-serif text-amber-100 tracking-tight drop-shadow-[0_0_10px_rgba(245,158,11,0.25)]">
              {stats.totalEulogies}
            </div>
            <p className="text-[11px] font-mono text-zinc-400 mt-1">
              Memorial tributes left
            </p>
          </div>
        </motion.div>

        {/* Card 4: GraveScore & Mortician Rank */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="relative bg-zinc-950/90 border border-zinc-700/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between overflow-hidden group hover:border-purple-500/50 transition-all shadow-xl"
        >
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-purple-300 font-bold">
              Total GraveScore
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-950/40 border border-purple-800/60 flex items-center justify-center text-purple-300">
              <Trophy className="w-4 h-4 text-purple-300" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold font-serif text-white tracking-tight drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">
                {stats.graveScore}
              </span>
              <span className="text-[10px] font-mono text-purple-300 font-bold uppercase tracking-wider">
                PTS
              </span>
            </div>

            {/* Mortician Rank Badge */}
            <div className="mt-2.5">
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-mono font-bold uppercase tracking-wider ${stats.rank.badgeStyle}`}>
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{stats.rank.title}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tech Autopsy Breakdown Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
        className="rounded-xl bg-zinc-950/70 border border-zinc-800/80 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-md"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-red-400 shrink-0">
            <Activity className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold font-serif uppercase tracking-wider text-white">
                Tech Autopsy Breakdown
              </h2>
              <span className="text-[10px] font-mono uppercase bg-red-950/50 text-red-300 border border-red-900/60 px-2 py-0.5 rounded-full font-bold">
                {autopsy.totalUniqueTechs} Deceased Stacks
              </span>
            </div>
            <p className="text-xs font-mono text-zinc-400 mt-0.5">
              {autopsy.topTech ? (
                <>
                  Top Fatal Dependency:{' '}
                  <span className="text-red-300 font-bold font-sans">
                    {autopsy.topTech.name}
                  </span>{' '}
                  ({autopsy.topTech.count} {autopsy.topTech.count === 1 ? 'demise' : 'demises'})
                  {autopsy.topCause && (
                    <span className="hidden md:inline text-zinc-500">
                      {' '}• Primary Cause: <span className="text-zinc-300">{autopsy.topCause.cause}</span>
                    </span>
                  )}
                </>
              ) : (
                'No autopsy data yet. Lay down your first project.'
              )}
            </p>
          </div>
        </div>

        {/* Top 3 Tech Chips & Matrix Trigger */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <div className="hidden sm:flex items-center gap-1.5">
            {autopsy.techList.slice(0, 3).map(tech => (
              <span
                key={tech.name}
                className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-[11px] font-medium"
              >
                {tech.name} <span className="text-red-400 font-bold">×{tech.count}</span>
              </span>
            ))}
          </div>

          {onNavigateToAutopsy && (
            <button
              onClick={onNavigateToAutopsy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 hover:border-zinc-500 text-zinc-200 hover:text-white font-mono text-xs transition-colors"
            >
              <span>View Full Matrix</span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
