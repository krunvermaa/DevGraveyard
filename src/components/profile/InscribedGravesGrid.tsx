import React, { useState, useMemo } from 'react';
import { Grave } from '../../types';
import { GraveCard } from '../GraveCard';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Flame, ScrollText, ExternalLink, Share2, Eye, 
  Sparkles, Filter, Check, Clock, Layers, Grid, Terminal
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { pressF } from '../../services/graveService';

interface InscribedGravesGridProps {
  graves: Grave[];
  loading: boolean;
  isOwnProfile: boolean;
  currentUsername?: string;
  onSelectGrave: (grave: Grave) => void;
  selectedTechFilter?: string | null;
  onClearTechFilter?: () => void;
}

export const InscribedGravesGrid: React.FC<InscribedGravesGridProps> = ({
  graves,
  loading,
  isOwnProfile,
  currentUsername,
  onSelectGrave,
  selectedTechFilter,
  onClearTechFilter
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCause, setSelectedCause] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'dossier' | 'tombstone'>('dossier');
  const [localRespects, setLocalRespects] = useState<Record<string, number>>({});
  const [hasPressedFLocal, setHasPressedFLocal] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Available causes of death for filter dropdown
  const uniqueCauses = useMemo(() => {
    const causes = new Set<string>();
    graves.forEach(g => {
      if (g.cause_of_death) causes.add(g.cause_of_death.trim());
    });
    return Array.from(causes);
  }, [graves]);

  // Filtered graves based on search, cause, and active tech filter
  const filteredGraves = useMemo(() => {
    return graves.filter(grave => {
      const matchesSearch = searchQuery.trim() === '' || 
        grave.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (grave.tech_stack && grave.tech_stack.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (grave.lesson_learned && grave.lesson_learned.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCause = selectedCause === 'all' || 
        grave.cause_of_death?.toLowerCase() === selectedCause.toLowerCase();

      const matchesTech = !selectedTechFilter || 
        (grave.tech_stack && grave.tech_stack.toLowerCase().includes(selectedTechFilter.toLowerCase()));

      return matchesSearch && matchesCause && matchesTech;
    });
  }, [graves, searchQuery, selectedCause, selectedTechFilter]);

  // Quick action: Press F / +1 RIP right on the card
  const handleQuickPressF = async (e: React.MouseEvent, grave: Grave) => {
    e.stopPropagation();
    if (hasPressedFLocal[grave.id]) return;

    try {
      // Play quick audio chime
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch {
      // Ignore audio errors
    }

    setHasPressedFLocal(prev => ({ ...prev, [grave.id]: true }));
    setLocalRespects(prev => ({
      ...prev,
      [grave.id]: (prev[grave.id] !== undefined ? prev[grave.id] : (grave.respects || 0)) + 1
    }));

    try {
      await pressF(grave.id, currentUsername || 'Anonymous Mourner');
    } catch (err) {
      console.error('Error pressing F:', err);
    }
  };

  // Quick action: Copy grave share link
  const handleCopyLink = (e: React.MouseEvent, grave: Grave) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/#/grave/${grave.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedId(grave.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Status badge styling helper
  const getCauseBadge = (cause?: string) => {
    if (!cause) return { text: 'Unknown Demise', style: 'border-zinc-700 bg-zinc-900/80 text-zinc-300' };
    const lower = cause.toLowerCase();
    if (lower.includes('time')) {
      return { text: cause, style: 'border-amber-600/50 bg-amber-950/40 text-amber-200' };
    }
    if (lower.includes('interest')) {
      return { text: cause, style: 'border-purple-600/50 bg-purple-950/40 text-purple-200' };
    }
    if (lower.includes('technical') || lower.includes('roadblock')) {
      return { text: cause, style: 'border-red-600/50 bg-red-950/40 text-red-200' };
    }
    if (lower.includes('market')) {
      return { text: cause, style: 'border-cyan-600/50 bg-cyan-950/40 text-cyan-200' };
    }
    if (lower.includes('scope')) {
      return { text: cause, style: 'border-rose-600/50 bg-rose-950/40 text-rose-200' };
    }
    return { text: cause, style: 'border-zinc-700 bg-zinc-900/80 text-zinc-300' };
  };

  return (
    <div className="space-y-6">
      {/* Search, Filter & View Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-950/60 p-4 rounded-xl border border-zinc-800/80">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search inscribed graves, stacks, or epitaphs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500/60 transition-colors font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white font-mono"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Dropdown & View Mode Switcher */}
        <div className="flex items-center gap-2">
          {uniqueCauses.length > 0 && (
            <div className="relative">
              <select
                value={selectedCause}
                onChange={(e) => setSelectedCause(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-red-500/60"
              >
                <option value="all">All Demises ({graves.length})</option>
                {uniqueCauses.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}

          {/* View Mode Toggle: Dossier vs Tombstone */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('dossier')}
              title="Terminal Dossier View"
              className={`px-2.5 py-1.5 rounded-md text-xs font-mono flex items-center gap-1.5 transition-all ${
                viewMode === 'dossier'
                  ? 'bg-zinc-800 text-white font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Dossier</span>
            </button>
            <button
              onClick={() => setViewMode('tombstone')}
              title="Classic Tombstone View"
              className={`px-2.5 py-1.5 rounded-md text-xs font-mono flex items-center gap-1.5 transition-all ${
                viewMode === 'tombstone'
                  ? 'bg-zinc-800 text-white font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Cemetery</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Tech Stack Filter Notice */}
      {selectedTechFilter && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-red-950/30 border border-red-900/50 text-xs font-mono text-red-200">
          <div className="flex items-center gap-2">
            <span>Filtering by deceased stack:</span>
            <span className="font-bold underline decoration-red-400">{selectedTechFilter}</span>
          </div>
          <button
            onClick={onClearTechFilter}
            className="text-red-400 hover:text-white underline font-bold"
          >
            Reset Filter
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500 font-mono text-sm space-y-3">
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p>Excavating memorial crypts...</p>
        </div>
      ) : filteredGraves.length === 0 ? (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 px-6 border border-zinc-800/80 bg-zinc-950/40 rounded-2xl text-center space-y-4"
        >
          <div className="text-6xl drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">🪦</div>
          <h3 className="text-xl font-bold font-serif text-white uppercase tracking-wider">
            {graves.length === 0 ? 'No Graves Inscribed Yet' : 'No Matching Memorials Found'}
          </h3>
          <p className="text-zinc-400 font-mono text-xs max-w-md">
            {graves.length === 0 ? (
              isOwnProfile
                ? 'Your personal cemetery is currently pristine. Commemorate your first abandoned repository or forgotten side project.'
                : 'This developer has not laid any abandoned projects to rest yet.'
            ) : (
              'No projects matched the search parameters. Try resetting your filters.'
            )}
          </p>

          {isOwnProfile && graves.length === 0 && (
            <Link
              to="/submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c53030] hover:bg-[#a82525] text-white font-mono text-xs uppercase tracking-wider font-bold transition-all shadow-[0_0_20px_rgba(197,48,48,0.4)]"
            >
              <span>Dig Your First Grave</span>
            </Link>
          )}

          {graves.length > 0 && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCause('all');
                onClearTechFilter?.();
              }}
              className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-mono"
            >
              Clear All Filters
            </button>
          )}
        </motion.div>
      ) : viewMode === 'tombstone' ? (
        /* Classic Tombstone Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-8 gap-y-32 md:gap-y-40 mt-12 px-2">
          <AnimatePresence>
            {filteredGraves.map((grave, index) => (
              <motion.div
                key={grave.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <GraveCard grave={grave} onClick={() => onSelectGrave(grave)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        /* High-Aesthetic Terminal Dossier Memorial Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <AnimatePresence>
            {filteredGraves.map((grave, index) => {
              const causeBadge = getCauseBadge(grave.cause_of_death);
              const year = new Date(grave.created_at).getFullYear();
              const displayRespects = localRespects[grave.id] !== undefined
                ? localRespects[grave.id]
                : (grave.respects || (grave.rips?.length || 0));
              const eulogyCount = grave.eulogies ? (Array.isArray(grave.eulogies) ? grave.eulogies.length : Object.keys(grave.eulogies).length) : 0;
              const hasPressed = hasPressedFLocal[grave.id] || (currentUsername && grave.rips?.includes(currentUsername));

              return (
                <motion.div
                  key={grave.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  onClick={() => onSelectGrave(grave)}
                  className="group relative bg-zinc-950/85 hover:bg-zinc-900/90 border border-zinc-800/90 hover:border-zinc-700/90 rounded-2xl p-5 sm:p-6 transition-all duration-300 shadow-xl cursor-pointer flex flex-col justify-between overflow-hidden"
                >
                  {/* Subtle top indicator bar */}
                  <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#c53030]/60 to-transparent opacity-40 group-hover:opacity-100 transition-opacity" />

                  <div className="space-y-4">
                    {/* Top Row: Cause of Death Badge & Metadata */}
                    <div className="flex items-center justify-between gap-2">
                      <div className={`px-2.5 py-1 rounded-md border text-[11px] font-mono font-bold uppercase tracking-wider ${causeBadge.style}`}>
                        {causeBadge.text}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-zinc-500 font-bold">
                          Anno {year}
                        </span>
                        {grave.github_link && (
                          <a
                            href={grave.github_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            title="Inspect GitHub Repository"
                            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-white transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Project Title */}
                    <div>
                      <h3 className="text-xl font-bold font-serif text-white group-hover:text-red-300 transition-colors tracking-tight flex items-center gap-2">
                        <span>{grave.project_name}</span>
                      </h3>
                      {grave.lived_for && (
                        <div className="inline-flex items-center gap-1.5 mt-1 text-[11px] font-mono text-zinc-400">
                          <Clock className="w-3 h-3 text-zinc-400" />
                          <span>Survived for: {grave.lived_for}</span>
                        </div>
                      )}
                    </div>

                    {/* Lesson Learned / Snippet */}
                    {grave.lesson_learned && (
                      <p className="text-xs font-mono text-zinc-300 italic line-clamp-2 bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/80">
                        “{grave.lesson_learned}”
                      </p>
                    )}

                    {/* Tech Stack Chips */}
                    {grave.tech_stack && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {grave.tech_stack.split(',').map((t, idx) => {
                          const tag = t.trim();
                          if (!tag) return null;
                          return (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-300"
                            >
                              {tag}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Bottom Bar: Quick Actions */}
                  <div className="flex items-center justify-between pt-5 mt-4 border-t border-zinc-800/80 gap-2">
                    {/* Quick Respect / Press F Button */}
                    <button
                      onClick={(e) => handleQuickPressF(e, grave)}
                      title="Press F to pay respects"
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs transition-all border ${
                        hasPressed
                          ? 'bg-red-950/40 border-red-800/60 text-red-300'
                          : 'bg-zinc-900 hover:bg-red-950/30 border-zinc-700/80 hover:border-red-600/50 text-zinc-200 hover:text-white'
                      }`}
                    >
                      <Flame className={`w-3.5 h-3.5 ${hasPressed ? 'text-red-400 fill-red-400' : 'text-red-400'}`} />
                      <span className="font-bold">{displayRespects}</span>
                      <span className="text-[10px] uppercase tracking-wider text-zinc-400">RIP</span>
                    </button>

                    {/* Eulogies count indicator */}
                    <div className="inline-flex items-center gap-1 text-xs font-mono text-zinc-400">
                      <ScrollText className="w-3.5 h-3.5 text-amber-400/80" />
                      <span>{eulogyCount}</span>
                    </div>

                    {/* Right action buttons: Copy Link & Inspect */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => handleCopyLink(e, grave)}
                        title="Copy memorial share link"
                        className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 hover:text-white transition-colors"
                      >
                        {copiedId === grave.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Share2 className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => onSelectGrave(grave)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-100 hover:text-white text-xs font-mono transition-colors font-medium"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
