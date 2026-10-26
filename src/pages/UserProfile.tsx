import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { findUserByUsername, followUser, unfollowUser } from '../services/userService';
import { getUserGraves } from '../services/graveService';
import { calculateUserTotalScore } from '../services/graveScoreService';
import { Grave, User } from '../types';
import { GraveCard } from '../components/GraveCard';
import { GraveModal } from '../components/GraveModal';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { db } from '../firebase';
import { collection, onSnapshot, getDocs, getDoc, doc } from 'firebase/firestore';
import { Button } from '../components/ui/Button';

export const UserProfile: React.FC = () => {
  const { username: identifier } = useParams<{ username: string }>();
  const { user, userProfile } = useAuth();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [graves, setGraves] = useState<Grave[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [followersCount, setFollowersCount] = useState(0);
  const [friendsCount, setFriendsCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  
  const [selectedGrave, setSelectedGrave] = useState<Grave | null>(null);

  useEffect(() => {
    if (!identifier) return;
    
    // Fetch user and graves
    const loadData = async () => {
      setLoading(true);
      try {
        let foundUid = '';
        let foundUsername = '';
        let foundPhotoURL = '';
        
        // Try looking up by uid first
        const userDoc = await getDoc(doc(db, 'users', identifier));
        if (userDoc.exists()) {
          foundUid = userDoc.id;
          foundUsername = userDoc.data().username || identifier;
          foundPhotoURL = userDoc.data().photoURL || '';
        } else {
          // Fallback to username
          const found = await findUserByUsername(identifier);
          if (found) {
            foundUid = found.uid;
            foundUsername = found.username;
            const realUserDoc = await getDoc(doc(db, 'users', foundUid));
            if (realUserDoc.exists()) {
              foundPhotoURL = realUserDoc.data().photoURL || '';
            }
          }
        }

        if (foundUid) {
          setProfileUser({ uid: foundUid, username: foundUsername, email: '', createdAt: '', photoURL: foundPhotoURL });
          
          // Get graves
          const userGraves = await getUserGraves(foundUid);
          setGraves(userGraves);
          
          // Count friends
          const friendsSnap = await getDocs(collection(db, 'users', foundUid, 'friends'));
          setFriendsCount(friendsSnap.size);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [identifier]);

  // Listen to followers
  useEffect(() => {
    if (!profileUser?.uid || !user) return;
    
    const unsubscribe = onSnapshot(collection(db, 'users', profileUser.uid, 'followers'), (snapshot) => {
      setFollowersCount(snapshot.size);
      
      // Check if current user is following
      let following = false;
      snapshot.forEach(docSnap => {
        if (docSnap.id === user.uid) following = true;
      });
      setIsFollowing(following);
    });
    
    return () => unsubscribe();
  }, [profileUser, user]);

  const userGraveScore = useMemo(() => calculateUserTotalScore(graves), [graves]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-[60vh]"><Loader2 className="w-8 h-8 text-[#c53030] animate-spin" /></div>;
  }

  if (!profileUser) {
    return <div className="text-center py-20 text-zinc-400 font-mono">User not found in the cemetery.</div>;
  }

  // Redirect to own profile if it's the current user
  if (userProfile?.username === identifier || user?.uid === identifier) {
    return <Navigate to="/profile" replace />;
  }

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
      </AnimatePresence>

      <div className="space-y-8">
        <header className="space-y-3 text-center pt-8 pb-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-widest text-white font-serif uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] border-b border-white/10 pb-4 inline-block">
            Mourner Crypt
          </h1>
          <p className="text-zinc-400 font-mono text-sm uppercase tracking-widest">
            Crypt Archives
          </p>
        </header>

        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="p-6 sm:p-8 bg-zinc-950/80 border border-zinc-800/80 rounded-3xl backdrop-blur-md shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-zinc-800 via-[#c53030]/50 to-zinc-800" />
          
          <div className="flex flex-col sm:flex-row items-center sm:space-x-8 space-y-6 sm:space-y-0 text-center sm:text-left">
            {profileUser.photoURL ? (
              <img
                src={profileUser.photoURL}
                alt="Profile"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-white shadow-[0_0_15px_rgba(255,255,255,0.2)] object-cover bg-zinc-950 p-1 shrink-0"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-zinc-800 flex items-center justify-center border-2 border-white shadow-[0_0_15px_rgba(255,255,255,0.2)] shrink-0">
                <span className="text-3xl sm:text-4xl text-[#c53030] font-mono">
                  {profileUser.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            
            <div className="space-y-3 flex-1 min-w-0 w-full">
              <h1 className="text-3xl font-bold font-sans text-white flex flex-wrap items-center justify-center sm:justify-start gap-3 break-all sm:break-normal">
                @{profileUser.username}
              </h1>
              
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 sm:gap-6 text-sm font-mono text-zinc-400">
                <div className="flex flex-col items-center sm:items-start">
                  <span className="text-xl text-zinc-200">{graves.length}</span>
                  <span className="text-[10px] uppercase tracking-widest text-[#c53030]">Graves</span>
                </div>
                <div className="hidden sm:block w-px h-8 bg-zinc-800" />
                <div className="flex flex-col items-center sm:items-start">
                  <span className="text-xl text-zinc-200">{friendsCount}</span>
                  <span className="text-[10px] uppercase tracking-widest text-[#c53030]">Friends</span>
                </div>
                <div className="hidden sm:block w-px h-8 bg-zinc-800" />
                <div className="flex flex-col items-center sm:items-start">
                  <span className="text-xl text-zinc-200">{followersCount}</span>
                  <span className="text-[10px] uppercase tracking-widest text-[#c53030]">Followers</span>
                </div>
                <div className="hidden sm:block w-px h-8 bg-zinc-800" />
                <div className="flex flex-col items-center sm:items-start">
                  <span className="text-xl text-white font-serif font-bold drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">{userGraveScore}</span>
                  <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">GraveScore</span>
                </div>
              </div>
            </div>
            
            <div className="sm:ml-auto pt-4 sm:pt-0 shrink-0">
              <Button
                onClick={handleFollowToggle}
                disabled={followLoading}
                className={`min-w-[120px] transition-all font-mono text-xs uppercase tracking-wider ${isFollowing ? 'bg-transparent border border-zinc-700 text-zinc-300 hover:text-red-400 hover:border-red-900/50 hover:bg-red-900/10' : 'bg-zinc-100 text-zinc-900 hover:bg-white'}`}
              >
                {followLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (isFollowing ? 'Unfollow' : 'Follow')}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* User Buries Section */}
        <div className="space-y-6 pt-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold font-sans text-zinc-200">
              Graveyard
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent" />
          </div>
          
          {graves.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 px-6 border border-zinc-800/50 bg-surface/30 rounded-xl"
            >
              <p className="text-zinc-400 font-mono text-sm mb-4">No projects buried yet.</p>
              <p className="text-xl">👻</p>
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
