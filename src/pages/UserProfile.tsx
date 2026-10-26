import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { findUserByUsername, followUser, unfollowUser, sendFriendRequest } from '../services/userService';
import { getUserGraves, getGrave } from '../services/graveService';
import { Grave, User } from '../types';
import { GraveModal } from '../components/GraveModal';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Skull, Activity, Users, MessageSquare } from 'lucide-react';
import { db } from '../firebase';
import { collection, onSnapshot, getDocs, getDoc, doc, query, where } from 'firebase/firestore';

// Profile Redesign Components & Services
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { MorticianStatsShowcase } from '../components/profile/MorticianStatsShowcase';
import { InscribedGravesGrid } from '../components/profile/InscribedGravesGrid';
import { TechAutopsyMatrix } from '../components/profile/TechAutopsyMatrix';
import { ComradesAndMournersView } from '../components/profile/ComradesAndMournersView';
import { CryptSharesView } from '../components/profile/CryptSharesView';
import { calculateMorticianStats, getTechAutopsy } from '../services/morticianService';

type NavigationTab = 'graves' | 'autopsy' | 'comrades' | 'shares';

export const UserProfile: React.FC = () => {
  const { username: identifier } = useParams<{ username: string }>();
  const { user, userProfile } = useAuth();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [graves, setGraves] = useState<Grave[]>([]);
  const [myGraves, setMyGraves] = useState<Grave[]>([]);
  const [loading, setLoading] = useState(true);

  const [followersCount, setFollowersCount] = useState(0);
  const [friendsCount, setFriendsCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Friendship / Comrade status
  const [isComrade, setIsComrade] = useState(false);
  const [comradeRequestSent, setComradeRequestSent] = useState(false);

  const [selectedGrave, setSelectedGrave] = useState<Grave | null>(null);
  const [activeTab, setActiveTab] = useState<NavigationTab>('graves');
  const [selectedTechFilter, setSelectedTechFilter] = useState<string | null>(null);

  useEffect(() => {
    if (!identifier) return;

    const loadData = async () => {
      setLoading(true);
      try {
        let foundUid = '';
        let foundData: Partial<User> = {};

        // Try looking up by UID first
        const userDoc = await getDoc(doc(db, 'users', identifier));
        if (userDoc.exists()) {
          foundUid = userDoc.id;
          foundData = userDoc.data() as User;
        } else {
          // Fallback to username lookup
          const found = await findUserByUsername(identifier);
          if (found) {
            foundUid = found.uid;
            const realUserDoc = await getDoc(doc(db, 'users', foundUid));
            if (realUserDoc.exists()) {
              foundData = realUserDoc.data() as User;
            }
          }
        }

        if (foundUid) {
          setProfileUser({
            uid: foundUid,
            username: foundData.username || identifier,
            email: foundData.email || '',
            createdAt: foundData.createdAt || '',
            photoURL: foundData.photoURL || '',
            bio: foundData.bio || '',
            github: foundData.github || '',
            instagram: foundData.instagram || '',
            whatsapp: foundData.whatsapp || ''
          });

          // Fetch graves for this user
          const userGraves = await getUserGraves(foundUid);
          setGraves(userGraves);

          // Count friends
          const friendsSnap = await getDocs(collection(db, 'users', foundUid, 'friends'));
          setFriendsCount(friendsSnap.size);

          // Check if current user is already a friend
          if (user) {
            const isFriendDoc = await getDoc(doc(db, 'users', user.uid, 'friends', foundUid));
            setIsComrade(isFriendDoc.exists());

            // Check if outgoing friend request exists
            const reqQuery = query(
              collection(db, 'friend_requests'),
              where('fromUserId', '==', user.uid),
              where('toUserId', '==', foundUid),
              where('status', '==', 'pending')
            );
            const reqSnap = await getDocs(reqQuery);
            setComradeRequestSent(!reqSnap.empty);

            // Fetch current user's graves for crypt share dispatch
            getUserGraves(user.uid).then(setMyGraves);
          }
        }
      } catch (err) {
        console.error('Failed to load user profile', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [identifier, user]);

  // Listen to followers of visited user
  useEffect(() => {
    if (!profileUser?.uid || !user) return;

    const unsubscribe = onSnapshot(collection(db, 'users', profileUser.uid, 'followers'), (snapshot) => {
      setFollowersCount(snapshot.size);

      let following = false;
      snapshot.forEach(docSnap => {
        if (docSnap.id === user.uid) following = true;
      });
      setIsFollowing(following);
    });

    return () => unsubscribe();
  }, [profileUser, user]);

  // Handle Follow / Unfollow
  const handleFollowToggle = async () => {
    if (!user || !profileUser || !userProfile) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(user.uid, profileUser.uid);
      } else {
        await followUser(user.uid, userProfile.username, profileUser.uid, profileUser.username);
      }
    } catch (err) {
      console.error('Follow error', err);
    } finally {
      setFollowLoading(false);
    }
  };

  // Handle Send Comrade Request
  const handleSendComradeRequest = async () => {
    if (!user || !profileUser || !userProfile || comradeRequestSent) return;
    try {
      await sendFriendRequest(user.uid, userProfile.username, profileUser.uid);
      setComradeRequestSent(true);
    } catch (err) {
      console.error('Failed to send comrade request', err);
    }
  };

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3 font-mono text-zinc-400">
        <Loader2 className="w-8 h-8 text-[#c53030] animate-spin" />
        <p>Unearthing cemetery records...</p>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="text-center py-24 space-y-3">
        <p className="text-4xl">🪦</p>
        <h2 className="text-xl font-bold font-serif text-white uppercase tracking-wider">
          Soul Not Found
        </h2>
        <p className="text-zinc-500 font-mono text-xs">
          No records exist for this developer handle in the DevGraveyard catacombs.
        </p>
      </div>
    );
  }

  // Redirect to own profile if visiting own handle or UID
  if (userProfile?.username === identifier || user?.uid === identifier) {
    return <Navigate to="/profile" replace />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-5xl mx-auto pb-20 pt-2 px-4 sm:px-6 relative z-10 space-y-8"
    >
      {/* Modal */}
      <AnimatePresence>
        {selectedGrave && (
          <GraveModal
            grave={selectedGrave}
            onClose={() => setSelectedGrave(null)}
          />
        )}
      </AnimatePresence>

      {/* Terminal Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-zinc-800/80 pb-3">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#c53030] font-bold">
            [ VISITING CEMETERY // @{profileUser.username} ]
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-white tracking-wide uppercase mt-1">
            {profileUser.username}'s Yard
          </h1>
        </div>
        <div className="font-mono text-xs text-zinc-400">
          Rank Status: <span className="font-bold text-zinc-200">{morticianStats.rank.title}</span>
        </div>
      </div>

      {/* 1. Header Card */}
      <ProfileHeader
        username={profileUser.username}
        photoURL={profileUser.photoURL}
        bio={profileUser.bio}
        createdAt={profileUser.createdAt}
        instagram={profileUser.instagram}
        whatsapp={profileUser.whatsapp}
        github={profileUser.github}
        isOwnProfile={false}
        isFollowing={isFollowing}
        onFollowToggle={handleFollowToggle}
        followLoading={followLoading}
        isComrade={isComrade}
        onSendComradeRequest={handleSendComradeRequest}
        comradeRequestSent={comradeRequestSent}
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
            <span>Dispatch Grave</span>
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="pt-2">
          {activeTab === 'graves' && (
            <InscribedGravesGrid
              graves={graves}
              loading={false}
              isOwnProfile={false}
              currentUsername={userProfile?.username || user?.displayName || undefined}
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
              targetUserId={profileUser.uid}
              isOwnProfile={false}
              targetUsername={profileUser.username}
            />
          )}

          {activeTab === 'shares' && (
            <CryptSharesView
              isOwnProfile={false}
              targetUserId={profileUser.uid}
              targetUsername={profileUser.username}
              myGraves={myGraves}
              onSelectGraveId={handleSelectSharedGrave}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};
