import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Grave } from '../types';
import { getUserGraves } from '../services/graveService';
import { calculateUserTotalScore } from '../services/graveScoreService';
import { GraveCard } from '../components/GraveCard';
import { GraveModal } from '../components/GraveModal';
import { FriendsManager } from '../components/FriendsManager';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Settings } from 'lucide-react';

import { AvatarSelectionModal } from '../components/AvatarSelectionModal';
import { SettingsModal } from '../components/SettingsModal';
import { db } from '../firebase';
import { collection, onSnapshot, getDocs } from 'firebase/firestore';

export const Profile: React.FC = () => {
  const { user, userProfile, loading } = useAuth();
  const [graves, setGraves] = useState<Grave[]>([]);
  const [loadingGraves, setLoadingGraves] = useState(true);
  const [selectedGrave, setSelectedGrave] = useState<Grave | null>(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [friendsCount, setFriendsCount] = useState(0);

  useEffect(() => {
    if (user?.uid) {
      getUserGraves(user.uid).then((data) => {
        setGraves(data);
        setLoadingGraves(false);
      });

      // Count friends
      getDocs(collection(db, 'users', user.uid, 'friends')).then(snap => {
        setFriendsCount(snap.size);
      });

      // Listen to followers
      const unsubscribe = onSnapshot(collection(db, 'users', user.uid, 'followers'), (snapshot) => {
        setFollowersCount(snapshot.size);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const techStats = useMemo(() => {
    const stats: Record<string, number> = {};
    graves.forEach(grave => {
      if (grave.tech_stack) {
        const tags = grave.tech_stack.split(',').map(t => t.trim()).filter(Boolean);
        tags.forEach(tag => {
          stats[tag] = (stats[tag] || 0) + 1;
        });
      }
    });
    return Object.entries(stats).sort((a, b) => b[1] - a[1]);
  }, [graves]);

  const totalGraveScore = useMemo(() => calculateUserTotalScore(graves), [graves]);

  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-4xl mx-auto pb-12 pt-0 px-4 sm:px-6 relative z-10 mb-20"
    >
      <AnimatePresence>
        {selectedGrave && (
          <GraveModal 
            grave={selectedGrave} 
            onClose={() => setSelectedGrave(null)} 
          />
        )}
        {showAvatarModal && (
          <AvatarSelectionModal onClose={() => setShowAvatarModal(false)} />
        )}
        {showSettingsModal && (
          <SettingsModal onClose={() => setShowSettingsModal(false)} />
        )}
      </AnimatePresence>

      <div className="space-y-8">
        <header className="space-y-3 text-center pt-8 pb-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-widest text-white font-serif uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] border-b border-white/10 pb-4 inline-block">
            My Yard
          </h1>
          <p className="text-zinc-400 font-mono text-sm uppercase tracking-widest">
            Your Personal Cemetery
          </p>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Main User Card */}
          <div className="md:col-span-2 p-6 sm:p-8 bg-zinc-950/80 border border-zinc-800/80 rounded-3xl backdrop-blur-md shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-zinc-800 via-[#c53030]/50 to-zinc-800" />
            
            <button 
              onClick={() => setShowAvatarModal(true)}
              className="relative group w-24 h-24 rounded-full border-4 border-zinc-900 shadow-[0_0_20px_rgba(0,0,0,0.8)] overflow-hidden hover:border-zinc-700 transition-all cursor-pointer shrink-0"
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                  <span className="text-4xl text-[#c53030] font-serif uppercase">
                    {userProfile?.username?.charAt(0) || user.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] font-mono uppercase tracking-widest text-white">Edit</span>
              </div>
            </button>
            
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-3xl font-bold font-sans text-white mb-1">
                {userProfile?.username ? `@${userProfile.username}` : (user.displayName || 'Unknown Developer')}
              </h2>
              <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-6">Rest in peace</p>
              
              <div className="flex flex-wrap justify-center sm:justify-start gap-6 sm:gap-8">
                <div className="flex flex-col items-center sm:items-start">
                  <span className="text-2xl font-bold text-zinc-200">{graves.length}</span>
                  <span className="text-[10px] uppercase tracking-widest text-zinc-500">Graves</span>
                </div>
                <div className="flex flex-col items-center sm:items-start">
                  <span className="text-2xl font-bold text-zinc-200">{friendsCount}</span>
                  <span className="text-[10px] uppercase tracking-widest text-zinc-500">Friends</span>
                </div>
                <div className="flex flex-col items-center sm:items-start">
                  <span className="text-2xl font-bold text-zinc-200">{followersCount}</span>
                  <span className="text-[10px] uppercase tracking-widest text-zinc-500">Followers</span>
                </div>
              </div>
            </div>
            
            <div className="absolute top-6 right-6">
              <Button
                onClick={() => setShowSettingsModal(true)}
                variant="ghost"
                size="icon"
                className="text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-full"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* GraveScore Card */}
          <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-3xl p-6 backdrop-blur-md shadow-2xl flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-[#c53030]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="text-[10px] uppercase tracking-widest text-[#c53030] font-bold mb-2 font-mono">GraveScore</span>
            <span className="text-6xl font-serif text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              {totalGraveScore}
            </span>
          </div>
        </motion.div>

        {/* Friends Manager */}
        <FriendsManager />

        {/* Tech Stats Section */}
        {techStats.length > 0 && (
          <div className="space-y-6 bg-zinc-950/40 p-6 md:p-8 rounded-3xl border border-zinc-800/40 backdrop-blur-sm shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-serif font-bold text-white tracking-widest uppercase">
                Tech Graveyard
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent ml-6" />
            </div>
            <div className="flex flex-wrap gap-4">
              {techStats.map(([tag, count]) => (
                <div key={tag} className="flex items-center gap-3 bg-zinc-900/80 border border-zinc-800 pl-4 pr-2 py-2 rounded-xl group hover:border-[#c53030]/30 transition-colors">
                  <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">{tag}</span>
                  <span className="text-xs font-mono font-bold text-[#c53030] bg-[#c53030]/10 px-2 py-1 rounded-lg">
                    {count} {count === 1 ? 'grave' : 'graves'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My Buries Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold font-sans text-zinc-200">
              My Buries
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent" />
          </div>
          
          {loadingGraves ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-[#c53030] animate-spin" />
            </div>
          ) : graves.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 px-6 border border-[#c53030]/20 bg-surface/30 rounded-xl shadow-[0_0_30px_rgba(223,54,54,0.05)]"
            >
              <div className="text-5xl mb-4 opacity-80">🪦</div>
              <h3 className="text-xl font-bold text-zinc-200 mb-2 font-serif">No Graves Yet</h3>
              <p className="text-zinc-400 font-mono text-sm mb-6 text-center max-w-sm">
                Your graveyard is empty. It's time to lay your first abandoned project to rest.
              </p>
              <Link to="/submit">
                <Button className="bg-zinc-800 text-[#c53030] border border-[#c53030]/30 hover:bg-[#c53030]/10 hover:border-[#c53030]/50 font-mono">
                  Dig Your First Grave
                </Button>
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-8 gap-y-32 md:gap-y-40 mt-12 px-2">
              <AnimatePresence>
                {graves.map((grave, index) => (
                  <motion.div
                    key={grave.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <GraveCard grave={grave} onClick={() => setSelectedGrave(grave)} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
