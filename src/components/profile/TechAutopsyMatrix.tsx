import React from 'react';
import { motion } from 'motion/react';
import { TechAutopsyReport } from '../../services/morticianService';
import { Activity, Skull, AlertTriangle, Cpu, Layers, ArrowUpRight, Flame } from 'lucide-react';

interface TechAutopsyMatrixProps {
  autopsy: TechAutopsyReport;
  onFilterByTech?: (techName: string) => void;
}

export const TechAutopsyMatrix: React.FC<TechAutopsyMatrixProps> = ({
  autopsy,
  onFilterByTech
}) => {
  if (autopsy.techList.length === 0 && autopsy.causeDistribution.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 border border-zinc-800/80 bg-zinc-950/40 rounded-2xl text-center space-y-3">
        <Activity className="w-10 h-10 text-zinc-600 animate-pulse" />
        <h3 className="text-lg font-bold font-serif text-white uppercase tracking-wider">
          Autopsy Matrix Void
        </h3>
        <p className="text-xs font-mono text-zinc-400 max-w-sm">
          No deceased tech stacks recorded in this cemetery. Inscribe graves to generate post-mortem distribution telemetry.
        </p>
      </div>
    );
  }

  // Calculate highest count for proportional bar scaling
  const maxTechCount = autopsy.techList.length > 0 ? autopsy.techList[0].count : 1;
  const maxCauseCount = autopsy.causeDistribution.length > 0 ? autopsy.causeDistribution[0].count : 1;

  return (
    <div className="space-y-8">
      {/* Telemetry Header Diagnostic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Top Fatal Dependency */}
        <div className="bg-zinc-950/80 border border-zinc-800/90 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold">
              Primary Fatal Dependency
            </span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            {autopsy.topTech ? autopsy.topTech.name : 'None'}
          </div>
          <p className="text-xs font-mono text-red-400 mt-1">
            {autopsy.topTech ? `${autopsy.topTech.count} project mortalities (${autopsy.topTech.percentage}% of stack)` : 'Clean slate'}
          </p>
        </div>

        {/* Metric 2: Unique Decommissioned Stacks */}
        <div className="bg-zinc-950/80 border border-zinc-800/90 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold">
              Unique Stacks Decommissioned
            </span>
            <Cpu className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            {autopsy.totalUniqueTechs}
          </div>
          <p className="text-xs font-mono text-amber-400 mt-1">
            Libraries, frameworks & tools laid to rest
          </p>
        </div>

        {/* Metric 3: Lethal Cause of Demise */}
        <div className="bg-zinc-950/80 border border-zinc-800/90 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold">
              Top Cause of Demise
            </span>
            <Skull className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight truncate">
            {autopsy.topCause ? autopsy.topCause.cause : 'Unknown'}
          </div>
          <p className="text-xs font-mono text-purple-400 mt-1">
            {autopsy.topCause ? `${autopsy.topCause.percentage}% of all buried projects` : 'None'}
          </p>
        </div>
      </div>

      {/* Main Section 1: Technology Mortality Distribution Matrix */}
      <div className="bg-zinc-950/85 border border-zinc-800/90 rounded-2xl p-6 sm:p-7 backdrop-blur-md shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-800">
          <div>
            <h2 className="text-xl font-bold font-serif text-white tracking-wide uppercase flex items-center gap-2.5">
              <Activity className="w-5 h-5 text-red-500" />
              <span>Technology Autopsy Matrix</span>
            </h2>
            <p className="text-xs font-mono text-zinc-400 mt-1">
              Distribution of tools and frameworks present at the time of project abandonment.
            </p>
          </div>
          <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest">
            {autopsy.techList.length} Stacks Analyzed
          </span>
        </div>

        <div className="space-y-4">
          {autopsy.techList.map((item, idx) => {
            const barWidth = Math.max(8, Math.round((item.count / maxTechCount) * 100));

            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="group p-3 rounded-xl bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800/70 hover:border-zinc-700 transition-all cursor-pointer"
                onClick={() => onFilterByTech?.(item.name)}
                title={`Click to filter inscribed graves using ${item.name}`}
              >
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-100 group-hover:text-red-300 transition-colors text-sm">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-zinc-500 bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700/60">
                      {item.count} {item.count === 1 ? 'casualty' : 'casualties'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-bold text-red-300">{item.percentage}%</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-colors" />
                  </div>
                </div>

                {/* Mortality Visual Distribution Bar */}
                <div className="w-full h-3 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800/80 p-[1px]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidth}%` }}
                    transition={{ duration: 0.6, delay: 0.1 + idx * 0.03, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]"
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Main Section 2: Post-Mortem Cause of Death Breakdown */}
      {autopsy.causeDistribution.length > 0 && (
        <div className="bg-zinc-950/85 border border-zinc-800/90 rounded-2xl p-6 sm:p-7 backdrop-blur-md shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-800">
            <div>
              <h2 className="text-xl font-bold font-serif text-white tracking-wide uppercase flex items-center gap-2.5">
                <Skull className="w-5 h-5 text-purple-400" />
                <span>Cause of Death Breakdown</span>
              </h2>
              <p className="text-xs font-mono text-zinc-400 mt-1">
                Post-mortem analysis of fatal factors resulting in project demise.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {autopsy.causeDistribution.map((cause, idx) => {
              const causeBarWidth = Math.max(10, Math.round((cause.count / maxCauseCount) * 100));

              return (
                <div
                  key={cause.cause}
                  className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80 space-y-2.5"
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-zinc-200 truncate pr-2">
                      {cause.cause}
                    </span>
                    <span className="text-purple-300 font-bold shrink-0">
                      {cause.count} ({cause.percentage}%)
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800/80 p-[1px]">
                    <div
                      style={{ width: `${causeBarWidth}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-500 shadow-[0_0_8px_rgba(168,85,247,0.4)]"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
