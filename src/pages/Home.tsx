import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Grave } from '../types';
import { getGraves } from '../services/graveService';
import { GraveCard } from '../components/GraveCard';
import { GraveModal } from '../components/GraveModal';
import { Cemetery3D } from '../components/Cemetery3D';
import { SurvivalGuideModal } from '../components/SurvivalGuideModal';
import { Button } from '../components/ui/Button';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Search, Box, LayoutGrid, Compass } from 'lucide-react';

export const Home: React.FC = () => {
  const [graves, setGraves] = useState<Grave[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrave, setSelectedGrave] = useState<Grave | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'3d' | 'grid'>('3d');
  const [showSurvivalGuide, setShowSurvivalGuide] = useState(false);

  const navigate = useNavigate();
  const [developerSearch, setDeveloperSearch] = useState('');

  const handleDeveloperSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (developerSearch.trim()) {
      navigate(`/user/${developerSearch.trim()}`);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getGraves();
        setGraves(data);
      } catch (error) {
        console.error("Failed to fetch graves", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredGraves = useMemo(() => {
    if (!searchQuery.trim()) return graves;
    const lowerQuery = searchQuery.toLowerCase();
    return graves.filter(grave => 
      grave.project_name.toLowerCase().includes(lowerQuery) || 
      (grave.tech_stack && grave.tech_stack.toLowerCase().includes(lowerQuery)) ||
      (grave.user_name && grave.user_name.toLowerCase().includes(lowerQuery))
    );
  }, [graves, searchQuery]);


  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="space-y-12 md:space-y-16 max-w-6xl mx-auto mb-20 px-4 sm:px-6 lg:px-8"
    >
      
      {/* Detail Modal */}
      <AnimatePresence>
        {selectedGrave && (
          <GraveModal 
            grave={selectedGrave} 
            onClose={() => setSelectedGrave(null)} 
          />
        )}
      </AnimatePresence>

      {/* Project Survival Guide Modal */}
      <AnimatePresence>
        {showSurvivalGuide && (
          <SurvivalGuideModal 
            onClose={() => setShowSurvivalGuide(false)} 
          />
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-10 md:py-14 space-y-6 relative">
        <motion.div 
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-4 w-full max-w-2xl relative z-10 px-4"
        >
          <motion.h1 
            className="font-bold tracking-tighter font-mono drop-shadow-[0_0_15px_rgba(205,32,32,0.5)] leading-tight text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[96px] w-full text-center text-[#b91c1c]"
          >
            Dev Graveyard
          </motion.h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-zinc-300 leading-relaxed font-['Times_New_Roman'] font-light max-w-xl mx-auto">
            A resting place for abandoned developer projects — and the lessons they left behind.
          </p>
        </motion.div>
        
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="flex flex-wrap items-center justify-center gap-4 z-10"
        >
          <Link to="/submit" className="relative group inline-block">
            <Button 
              variant="secondary"
              className="h-10 px-6 text-sm uppercase tracking-widest font-mono font-semibold border border-[#c53030]/50 bg-zinc-900/90 text-red-100 hover:text-white hover:bg-[#c53030] hover:border-red-400 transition-all shadow-[0_0_15px_rgba(197,48,48,0.25)] hover:shadow-[0_0_30px_rgba(197,48,48,0.5)] backdrop-blur-md cursor-pointer"
            >
              Bury a Project
            </Button>
            {/* Subtle glow behind button */}
            <div className="absolute inset-0 -z-10 bg-[#c53030]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000 animate-pulse" />
          </Link>

          {/* Prominent View Mode Switcher in Hero */}
          <button
            type="button"
            onClick={() => setViewMode(viewMode === '3d' ? 'grid' : '3d')}
            className={`h-10 px-5 text-xs sm:text-sm uppercase tracking-widest font-mono rounded-lg border transition-all duration-300 backdrop-blur-md flex items-center gap-2.5 ${
              viewMode === '3d'
                ? 'border-zinc-700 bg-black/40 text-zinc-300 hover:text-white hover:border-zinc-500'
                : 'border-[#c53030]/60 bg-[#c53030]/15 text-[#fca5a5] hover:bg-[#c53030]/25 hover:border-[#c53030] shadow-[0_0_20px_rgba(197,48,48,0.3)]'
            }`}
          >
            {viewMode === '3d' ? (
              <>
                <LayoutGrid className="w-4 h-4 text-zinc-400" />
                <span>[ Grid View ]</span>
              </>
            ) : (
              <>
                <Box className="w-4 h-4 text-[#ef4444] animate-pulse" />
                <span>[ 3D Cemetery View ]</span>
              </>
            )}
          </button>

          {/* Project Survival Guide Button */}
          <button
            type="button"
            onClick={() => setShowSurvivalGuide(true)}
            className="h-10 px-5 text-xs sm:text-sm uppercase tracking-widest font-mono rounded-lg border border-amber-500/40 bg-amber-950/30 text-amber-300 hover:text-white hover:bg-amber-900/40 hover:border-amber-400 transition-all duration-300 backdrop-blur-md flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.15)] hover:shadow-[0_0_25px_rgba(245,158,11,0.3)] cursor-pointer"
          >
            <Compass className="w-4 h-4 text-amber-400" />
            <span>Survival Guide</span>
          </button>
        </motion.div>
      </section>

      {/* Main Content Area: Controls & Cemetery Display */}
      <section>
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between mb-8 pb-4 gap-4 border-b border-zinc-800/60">
          {/* Search Bar */}
          <div className="flex-1 w-full max-w-md relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-[#c53030]/50" />
            </div>
            <input
              type="text"
              placeholder="Search graves by title, tech stack, or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-[#c53030]/20 rounded-xl leading-5 bg-surface/30 text-zinc-300 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#c53030]/50 focus:border-[#c53030]/50 sm:text-sm backdrop-blur-sm transition-all"
            />
          </div>
          
          {/* Controls Bar Right Side */}
          <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 w-full md:w-auto">
            {/* View Mode Toggle Button Group */}
            <div className="flex items-center rounded-xl bg-black/50 border border-[#c53030]/30 p-1 backdrop-blur-md shadow-sm">
              <button
                type="button"
                onClick={() => setViewMode('3d')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono tracking-wider transition-all duration-200 ${
                  viewMode === '3d'
                    ? 'bg-[#c53030] text-white shadow-[0_0_12px_rgba(197,48,48,0.6)] font-bold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span>3D CEMETERY</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono tracking-wider transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-[#c53030] text-white shadow-[0_0_12px_rgba(197,48,48,0.6)] font-bold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>GRID VIEW</span>
              </button>
            </div>

            {/* Project Survival Guide Quick Button */}
            <button
              type="button"
              onClick={() => setShowSurvivalGuide(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-950/20 text-amber-300 hover:bg-amber-900/30 hover:border-amber-500/50 hover:text-white text-xs font-mono tracking-wider transition-all cursor-pointer"
              title="Open Project Survival Guide"
            >
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">SURVIVAL GUIDE</span>
              <span className="sm:hidden">GUIDE</span>
            </button>

            {/* Developer Search Form */}
            <form onSubmit={handleDeveloperSearch} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-zinc-500" />
              </div>
              <input
                type="text"
                placeholder="Find dev..."
                value={developerSearch}
                onChange={(e) => setDeveloperSearch(e.target.value)}
                className="w-32 sm:w-40 pl-9 pr-3 py-1.5 border border-zinc-800 rounded-lg text-xs bg-black/40 text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-[#c53030]/50 transition-all font-mono"
              />
            </form>

            {/* Graves Count Badge */}
            <span className="text-xs font-mono text-zinc-400 border border-zinc-800 px-3 py-1.5 rounded-lg transition-colors hover:text-zinc-300 hover:border-zinc-700 cursor-default bg-surface/30 backdrop-blur-sm shrink-0">
              {loading ? '...' : filteredGraves.length} GRAVES
            </span>
          </div>
        </div>

        {/* Content Display: 3D Cemetery vs Classic Grid */}
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="w-12 h-12 text-[#c53030] animate-spin opacity-50" />
          </div>
        ) : filteredGraves.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 bg-surface/30 border border-[#c53030]/20 rounded-xl backdrop-blur-sm shadow-[0_0_30px_rgba(223,54,54,0.05)]"
          >
            <p className="text-zinc-400 mb-6 font-mono text-sm">
              {searchQuery ? "No matching graves found." : "The cemetery is quiet. Too quiet."}
            </p>
            {!searchQuery && (
              <Link to="/submit">
                <Button 
                  variant="secondary" 
                  className="bg-zinc-900 border border-[#c53030]/50 text-red-200 hover:text-white hover:bg-[#c53030] hover:border-red-500 font-mono text-xs uppercase tracking-wider px-5 py-2.5 transition-all shadow-md font-semibold cursor-pointer"
                >
                  Dig the first grave
                </Button>
              </Link>
            )}
          </motion.div>
        ) : viewMode === '3d' ? (
          <motion.div
            key="3d-cemetery-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            <Cemetery3D
              graves={filteredGraves}
              onSelectGrave={(grave) => setSelectedGrave(grave)}
            />
          </motion.div>
        ) : (
          <motion.div
            key="grid-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-32 md:gap-y-40 mt-12"
          >
            <AnimatePresence>
              {filteredGraves.map((grave, index) => (
                <motion.div 
                  key={grave.id} 
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: (index % 3) * 0.15 }}
                  className="group relative hover:z-50 transition-all duration-300"
                >
                  <GraveCard 
                    grave={grave} 
                    index={index} 
                    onClick={() => setSelectedGrave(grave)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>
    </motion.div>
  );
};
