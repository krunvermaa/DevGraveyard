import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Grave } from '../types';
import { getGraves } from '../services/graveService';
import { GraveCard } from '../components/GraveCard';
import { GraveModal } from '../components/GraveModal';
import { Button } from '../components/ui/Button';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Search } from 'lucide-react';

export const Cemetery: React.FC = () => {
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
      transition={{ duration: 0.6 }}
      className="space-y-12 md:space-y-16 max-w-6xl mx-auto mb-24 px-4 sm:px-6 lg:px-8"
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

      {/* Heading matching Confessions/Pantheon style */}
      <div className="w-full max-w-2xl mx-auto mb-6 mt-4 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif text-white tracking-widest uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] border-b border-white/10 pb-4 inline-block">
          The Cemetery
        </h1>
      </div>

      {/* Search & Grid Controls */}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-28 md:gap-y-36 mt-8">
            {filteredGraves.map((grave, index) => (
              <div 
                key={grave.id} 
                className="group relative hover:z-50 transition-all duration-300 animate-fade-in-up"
                style={{
                  animationDelay: `${Math.min((index % 6) * 0.06, 0.36)}s`,
                  animationFillMode: 'both'
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
