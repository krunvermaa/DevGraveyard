import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import { Grave } from '../types';
import { calculateGraveScore } from '../services/graveScoreService';
import { GraveModal } from '../components/GraveModal';
import { Loader2, Trophy, Flame, ScrollText, Link as LinkIcon, Sparkles } from 'lucide-react';
import { AnimatePresence } from 'motion/react';

export const Leaderboard: React.FC = () => {
  const [graves, setGraves] = useState<Grave[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrave, setSelectedGrave] = useState<Grave | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const q = query(collection(db, 'graves'));
        const snapshot = await getDocs(q);
        let allGraves = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Grave));
        
        // Filter those with github link and sort by GraveScore
        allGraves = allGraves.filter(g => g.github_link);
        
        allGraves.sort((a, b) => {
          const scoreA = calculateGraveScore(a);
          const scoreB = calculateGraveScore(b);
          return scoreB - scoreA;
        });
        
        setGraves(allGraves.slice(0, 50)); // Top 50
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedGrave(null);
  }, []);

  const handleSelectGrave = useCallback((grave: Grave) => {
    setSelectedGrave(grave);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-[#c53030] animate-spin" />
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {selectedGrave && (
          <GraveModal 
            key={selectedGrave.id}
            grave={selectedGrave} 
            onClose={handleCloseModal} 
          />
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in p-4 sm:p-6 md:p-8 pb-20">
        <div className="text-center space-y-3 sm:space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif text-white tracking-widest uppercase drop-shadow-[0_0_15px_rgba(197,48,48,0.5)]">
            The Pantheon of the Dead
          </h1>
          <p className="text-zinc-400 font-mono text-xs sm:text-sm max-w-2xl mx-auto">
            Honoring the most legendary abandoned projects. Only those with actual GitHub links are eligible for eternal glory.
          </p>
        </div>
        
        <div className="space-y-3 sm:space-y-4">
          {graves.length === 0 ? (
            <div className="text-center py-16 bg-zinc-950/60 border border-zinc-800 rounded-2xl p-6">
              <p className="text-zinc-500 font-mono text-sm">No worthy projects found in the Pantheon yet.</p>
            </div>
          ) : (
            graves.map((grave, index) => {
              const eulogiesCount = Array.isArray(grave.eulogies)
                ? grave.eulogies.length
                : (grave.eulogies ? Object.keys(grave.eulogies).length : 0);
              const score = calculateGraveScore(grave);

              return (
                <div 
                  key={grave.id} 
                  onClick={() => handleSelectGrave(grave)} 
                  className="block cursor-pointer group"
                >
                  <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 hover:border-[#c53030]/60 hover:bg-black/90 transition-all duration-300">
                    {/* Rank Badge */}
                    <div className="flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center bg-black rounded-full border border-zinc-700/80 shadow-inner group-hover:border-[#c53030]/50 transition-colors">
                      {index === 0 ? <Trophy className="text-yellow-400 w-5 h-5 sm:w-6 sm:h-6" /> : 
                       index === 1 ? <Trophy className="text-zinc-300 w-5 h-5 sm:w-6 sm:h-6" /> : 
                       index === 2 ? <Trophy className="text-amber-600 w-5 h-5 sm:w-6 sm:h-6" /> : 
                       <span className="text-zinc-400 font-mono font-bold text-sm">#{index + 1}</span>}
                    </div>
                    
                    {/* Project Info */}
                    <div className="flex-1 text-center sm:text-left min-w-0 w-full">
                      <h3 className="font-bold text-lg sm:text-xl text-zinc-100 group-hover:text-white truncate transition-colors">
                        {grave.project_name}
                      </h3>
                      <div className="text-xs text-zinc-500 font-mono flex items-center justify-center sm:justify-start gap-2 mt-1 flex-wrap">
                        <span>By @{grave.user_name || 'unknown'}</span>
                        <span>•</span>
                        <a 
                          href={grave.github_link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          onClick={e => e.stopPropagation()} 
                          className="inline-flex items-center gap-1 text-red-400/80 hover:text-red-300 hover:underline"
                        >
                          <LinkIcon size={12} /> Source
                        </a>
                      </div>
                    </div>
                    
                    {/* Stats & GraveScore Pill */}
                    <div className="flex items-center gap-3 sm:gap-4 shrink-0 bg-black/50 px-3.5 py-2 rounded-xl border border-white/5">
                      {/* GraveScore */}
                      <div className="flex flex-col items-center border-r border-zinc-800 pr-3">
                        <span className="text-[9px] uppercase tracking-wider text-red-400 font-mono font-semibold flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" /> Score
                        </span>
                        <span className="text-xs sm:text-sm font-mono font-bold text-white">{score}</span>
                      </div>

                      {/* Respects */}
                      <div className="flex flex-col items-center">
                        <Flame className="text-[#c53030] mb-0.5" size={15} />
                        <span className="text-xs font-mono font-bold text-zinc-300">{grave.respects || 0}</span>
                      </div>

                      {/* Eulogies */}
                      <div className="flex flex-col items-center">
                        <ScrollText className="text-zinc-400 mb-0.5" size={15} />
                        <span className="text-xs font-mono font-bold text-zinc-300">{eulogiesCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};
