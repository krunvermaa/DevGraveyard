import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Grave } from '../types';
import { getUserGraves, getGrave } from '../services/graveService';
import { GraveModal } from '../components/GraveModal';
import { AvatarSelectionModal } from '../components/AvatarSelectionModal';
import { SettingsModal } from '../components/SettingsModal';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../firebase';
import { collection, onSnapshot, getDocs } from 'firebase/firestore';

// Profile Redesign Components & Services
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { MorticianStatsShowcase } from '../components/profile/MorticianStatsShowcase';
import { InscribedGravesGrid } from '../components/profile/InscribedGravesGrid';
import { TechAutopsyMatrix } from '../components/profile/TechAutopsyMatrix';
import { ComradesAndMournersView } from '../components/profile/ComradesAndMournersView';
import { CryptSharesView } from '../components/profile/CryptSharesView';
import { calculateMorticianStats, getTechAutopsy } from '../services/morticianService';
import { Skull, Activity, Users, MessageSquare } from 'lucide-react';

type NavigationTab = 'graves' | 'autopsy' | 'comrades' | 'shares';

export const Profile: React.FC = () => {
  const { user, userProfile, loading } = useAuth();
  const [graves, setGraves] = useState<Grave[]>([]);
  const [loadingGraves, setLoadingGraves] = useState(true);
  const [selectedGrave, setSelectedGrave] = useState<Grave | null>(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<NavigationTab>('graves');
  const [selectedTechFilter, setSelectedTechFilter] = useState<string | null>(null);

  // Counts for tab badges
  const [followersCount, setFollowersCount] = useState(0);
  const [friendsCount, setFriendsCount] = useState(0);
  const [sharesCount, setSharesCount] = useState(0);

  useEffect(() => {
    if (user?.uid) {
      // Fetch user's graves
      getUserGraves(user.uid).then((data) => {
        setGraves(data);
        setLoadingGraves(false);
      });

      // Count friends
      getDocs(collection(db, 'users', user.uid, 'friends')).then(snap => {
        setFriendsCount(snap.size);
      });

      // Listen to followers
      const followersUnsub = onSnapshot(collection(db, 'users', user.uid, 'followers'), (snapshot) => {
        setFollowersCount(snapshot.size);
      });

      // Listen to shares count
      const sharesUnsub = onSnapshot(collection(db, 'users', user.uid, 'shared_graves'), (snapshot) => {
        setSharesCount(snapshot.size);
      });

      return () => {
        followersUnsub();
        sharesUnsub();
      };
    }
  }, [user]);

  const handleSelectSharedGrave = async (graveId: string) => {
    const grave = await getGrave(graveId);
    if (grave) {
      setSelectedGrave(grave);
    }
  };

  // Calculate comprehensive Mortician Stats & Tech Autopsy Breakdown
  const morticianStats = useMemo(() => calculateMorticianStats(graves), [graves]);
  const autopsyReport = useMemo(() => getTechAutopsy(graves), [graves]);

  const handleFilterByTechFromMatrix = (techName: string) => {
    setSelectedTechFilter(techName);
    setActiveTab('graves');
  };

  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;

  const username = userProfile?.username || user.displayName || 'DevMortician';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-5xl mx-auto pb-20 pt-2 px-4 sm:px-6 relative z-10 space-y-8"
    >
      {/* Modals */}
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

      {/* Terminal Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-zinc-800/80 pb-3">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#c53030] font-bold">
            [ TERMINAL // DEV CEMETERY MEMORIAL ]
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-white tracking-wide uppercase mt-1">
            My Yard
          </h1>
        </div>
        <div className="font-mono text-xs text-zinc-400">
          Rank Status: <span className="font-bold text-zinc-200">{morticianStats.rank.title}</span>
        </div>
      </div>

      {/* 1. Header Card */}
      <ProfileHeader
        username={username}
        photoURL={user.photoURL || userProfile?.photoURL}
        bio={userProfile?.bio}
        createdAt={userProfile?.createdAt || user.metadata.creationTime}
        instagram={userProfile?.instagram}
        whatsapp={userProfile?.whatsapp}
        github={userProfile?.github}
        isOwnProfile={true}
        onOpenAvatarModal={() => setShowAvatarModal(true)}
        onOpenSettingsModal={() => setShowSettingsModal(true)}
      />

      {/* 2. Mortician Stats Showcase */}
      <MorticianStatsShowcase
        stats={morticianStats}
        autopsy={autopsyReport}
        onNavigateToAutopsy={() => setActiveTab('autopsy')}
      />

      {/* 3. Redesigned Navigation Tabs */}
      <div className="space-y-6 pt-2">
        <div className="flex items-center overflow-x-auto no-scrollbar gap-2 sm:gap-3 p-1.5 bg-zinc-950/90 border border-zinc-800/90 rounded-2xl backdrop-blur-md shadow-lg">
          {/* Tab 1: Inscribed Graves */}
          <button
            onClick={() => setActiveTab('graves')}
            className={`flex-1 min-w-[150px] sm:min-w-0 py-3 px-4 rounded-xl font-mono text-xs uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'graves'
                ? 'bg-zinc-800 text-white border border-zinc-700 shadow-[0_0_15px_rgba(255,255,255,0.08)]'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <Skull className={`w-4 h-4 ${activeTab === 'graves' ? 'text-red-400' : 'text-zinc-400'}`} />
            <span>Inscribed Graves</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'graves' ? 'bg-red-950 text-red-200 border border-red-800' : 'bg-zinc-900 text-zinc-400'}`}>
              {graves.length}
            </span>
          </button>

          {/* Tab 2: Tech Autopsy Matrix */}
          <button
            onClick={() => setActiveTab('autopsy')}
            className={`flex-1 min-w-[160px] sm:min-w-0 py-3 px-4 rounded-xl font-mono text-xs uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'autopsy'
                ? 'bg-zinc-800 text-white border border-zinc-700 shadow-[0_0_15px_rgba(255,255,255,0.08)]'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <Activity className={`w-4 h-4 ${activeTab === 'autopsy' ? 'text-red-400' : 'text-zinc-400'}`} />
            <span>Tech Autopsy Matrix</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'autopsy' ? 'bg-red-950 text-red-200 border border-red-800' : 'bg-zinc-900 text-zinc-400'}`}>
              {autopsyReport.totalUniqueTechs}
            </span>
          </button>

          {/* Tab 3: Comrades & Mourners */}
          <button
            onClick={() => setActiveTab('comrades')}
            className={`flex-1 min-w-[170px] sm:min-w-0 py-3 px-4 rounded-xl font-mono text-xs uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'comrades'
                ? 'bg-zinc-800 text-white border border-zinc-700 shadow-[0_0_15px_rgba(255,255,255,0.08)]'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <Users className={`w-4 h-4 ${activeTab === 'comrades' ? 'text-red-400' : 'text-zinc-400'}`} />
            <span>Comrades & Mourners</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'comrades' ? 'bg-red-950 text-red-200 border border-red-800' : 'bg-zinc-900 text-zinc-400'}`}>
              {friendsCount + followersCount}
            </span>
          </button>

          {/* Tab 4: Crypt Shares */}
          <button
            onClick={() => setActiveTab('shares')}
            className={`flex-1 min-w-[140px] sm:min-w-0 py-3 px-4 rounded-xl font-mono text-xs uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'shares'
                ? 'bg-zinc-800 text-white border border-zinc-700 shadow-[0_0_15px_rgba(255,255,255,0.08)]'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <MessageSquare className={`w-4 h-4 ${activeTab === 'shares' ? 'text-red-400' : 'text-zinc-400'}`} />
            <span>Crypt Shares</span>
            {sharesCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-red-600 text-white font-bold">
                {sharesCount}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="pt-2">
          {activeTab === 'graves' && (
            <InscribedGravesGrid
              graves={graves}
              loading={loadingGraves}
              isOwnProfile={true}
              currentUsername={username}
              onSelectGrave={setSelectedGrave}
              selectedTechFilter={selectedTechFilter}
              onClearTechFilter={() => setSelectedTechFilter(null)}
            />
          )}

          {activeTab === 'autopsy' && (
            <TechAutopsyMatrix
              autopsy={autopsyReport}
              onFilterByTech={handleFilterByTechFromMatrix}
            />
          )}

          {activeTab === 'comrades' && (
            <ComradesAndMournersView
              targetUserId={user.uid}
              isOwnProfile={true}
              targetUsername={username}
            />
          )}

          {activeTab === 'shares' && (
            <CryptSharesView
              isOwnProfile={true}
              targetUserId={user.uid}
              targetUsername={username}
              myGraves={graves}
              onSelectGraveId={handleSelectSharedGrave}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};
