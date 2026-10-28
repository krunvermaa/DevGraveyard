import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Grave } from '../types';
import { getGraves } from '../services/graveService';
import { GraveCard } from '../components/GraveCard';
import { GraveModal } from '../components/GraveModal';
import { Button } from '../components/ui/Button';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Search } from 'lucide-react';

export const Home: React.FC = () => {
  const [graves, setGraves] = useState<Grave[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrave, setSelectedGrave] = useState<Grave | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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
      className="space-y-16 md:space-y-24 max-w-6xl mx-auto mb-20 px-4 sm:px-6 lg:px-8"
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

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-10 md:py-16 space-y-6 relative">
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
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-zinc-300 leading-relaxed font-serif font-light max-w-xl mx-auto italic">
            A resting place for abandoned developer projects — and the lessons they left behind.
          </p>
        </motion.div>
        
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          <Link to="/submit" className="relative z-10 group inline-block">
            <Button className="h-10 px-6 text-sm uppercase tracking-widest font-mono border border-[#c53030]/30 bg-surface/50 text-[#ffffff] hover:text-white hover:bg-zinc-800 hover:border-[#c53030] transition-all shadow-[0_0_15px_rgba(223,54,54,0.2)] hover:shadow-[0_0_30px_rgba(223,54,54,0.5)] backdrop-blur-md cursor-pointer">
              Bury a Project
            </Button>
            {/* Subtle glow behind button */}
            <div className="absolute inset-0 -z-10 bg-[#c53030]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000 animate-pulse" />
          </Link>
        </motion.div>
      </section>

      {/* Grid */}
      <section>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 pb-4 gap-4">
          <div className="flex-1 w-full max-w-md relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-[#c53030]/50" />
            </div>
            <input
              type="text"
              placeholder="Search graves by title, tech stack, or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-[#c53030]/20 rounded-xl leading-5 bg-surface/90 text-zinc-300 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#c53030]/50 focus:border-[#c53030]/50 sm:text-sm transition-all"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
            <form onSubmit={handleDeveloperSearch} className="relative w-full sm:w-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-zinc-500" />
              </div>
              <input
                type="text"
                placeholder="Find developer..."
                value={developerSearch}
                onChange={(e) => setDeveloperSearch(e.target.value)}
                className="block w-full sm:w-48 pl-9 pr-3 py-2 border border-zinc-800 rounded-lg text-sm bg-black/60 text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-[#c53030]/50 transition-all"
              />
            </form>
            <span className="text-xs font-mono text-zinc-400 border border-zinc-800 px-3 py-1.5 rounded transition-colors hover:text-zinc-300 hover:border-zinc-700 cursor-default bg-surface/90 shrink-0">
              {loading ? '...' : filteredGraves.length} GRAVES
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-12 h-12 text-[#c53030] animate-spin opacity-50" />
          </div>
        ) : filteredGraves.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 bg-surface/60 border border-[#c53030]/20 rounded-xl shadow-[0_0_30px_rgba(223,54,54,0.05)]"
          >
            <p className="text-zinc-400 mb-6 font-mono text-sm">
              {searchQuery ? "No matching graves found." : "The cemetery is quiet. Too quiet."}
            </p>
            {!searchQuery && (
              <Link to="/submit">
                <Button variant="secondary" className="border-[#c53030]/30 text-[#c53030] hover:bg-[#c53030]/10">Dig the first grave</Button>
              </Link>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-32 md:gap-y-40 mt-12">
            {filteredGraves.map((grave, index) => (
              <div 
                key={grave.id} 
                className="group relative hover:z-50 transition-all duration-300 animate-fade-in-up"
                style={{
                  animationDelay: `${Math.min((index % 6) * 0.06, 0.36)}s`,
                  animationFillMode: 'both',
                  contentVisibility: 'auto',
                  containIntrinsicSize: '0 300px'
                }}
              >
                <GraveCard 
                  grave={grave} 
                  index={index} 
                  onClick={() => setSelectedGrave(grave)}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </motion.div>
  );
};
