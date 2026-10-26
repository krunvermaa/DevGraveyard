import React, { useEffect, useState, useRef } from 'react';
import { Grave, Eulogy, Friend } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { pressF, dropEulogy, unpressF, deleteEulogy, deleteGrave } from '../services/graveService';
import { shareGraveWithFriend } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Share2, Trash2, Image as ImageIcon } from 'lucide-react';
import { db } from '../firebase';
import { collection, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { ShareCardModal } from './ShareCardModal';

interface GraveModalProps {
  grave: Grave;
  onClose: () => void;
}

export const GraveModal: React.FC<GraveModalProps> = ({ grave, onClose }) => {
  const { user, userProfile } = useAuth();
  const currentUserDisplayName = userProfile?.username || 'Unknown';
  const [respects, setRespects] = useState(grave.respects || 0);
  const [ripsList, setRipsList] = useState<string[]>(grave.rips || []);
  const [eulogies, setEulogies] = useState<Eulogy[]>(grave.eulogies || []);
  const [hasPressedF, setHasPressedF] = useState(grave.rips?.includes(currentUserDisplayName) || false);

  const [eulogyText, setEulogyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const [showShare, setShowShare] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [sharingTo, setSharingTo] = useState<string | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  
  const [graveOwnerUsername, setGraveOwnerUsername] = useState<string | null>(
    (grave.user_id === user?.uid && userProfile?.username) ? userProfile.username : grave.user_name || null
  );

  const [showShareCard, setShowShareCard] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    if (grave.user_id) {
      const fetchUsername = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', grave.user_id as string));
          if (userDoc.exists() && userDoc.data().username) {
            setGraveOwnerUsername(userDoc.data().username);
          }
        } catch (e) {
          console.error(e);
        }
      };
      
      if (grave.user_id === user?.uid && userProfile?.username) {
         setGraveOwnerUsername(userProfile.username);
      } else {
         fetchUsername();
      }
    }
  }, [grave.user_id, user?.uid, userProfile?.username]);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  useEffect(() => {
    if (!user || !showShare) return;
    const unsubscribe = onSnapshot(collection(db, 'users', user.uid, 'friends'), (snapshot) => {
      const friendsData = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as Friend));
      setFriends(friendsData);
    });
    return () => unsubscribe();
  }, [user, showShare]);

  const pressTimer = useRef<NodeJS.Timeout | null>(null);
  const isLongPressing = useRef(false);
  const [showRipersList, setShowRipersList] = useState(false);

  const handlePointerDown = () => {
    isLongPressing.current = false;
    pressTimer.current = setTimeout(() => {
      isLongPressing.current = true;
      setShowRipersList(prev => !prev);
    }, 500);
  };

  const handlePointerUp = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const handleClickF = (e: React.MouseEvent) => {
    if (isLongPressing.current) {
      e.preventDefault();
      return;
    }
    handlePressF();
  };

  const handlePressF = async () => {
    if (!user || !currentUserDisplayName) return;
    
    if (hasPressedF) {
      setHasPressedF(false);
      setRespects(prev => prev - 1);
      setRipsList(prev => prev.filter(r => r !== currentUserDisplayName));
      try {
        await unpressF(grave.id, currentUserDisplayName);
      } catch (err) {
        console.error(err);
      }
    } else {
      setHasPressedF(true);
      setRespects(prev => prev + 1);
      setRipsList(prev => [...prev, currentUserDisplayName]);
      try {
        await pressF(grave.id, currentUserDisplayName);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDropEulogy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eulogyText.trim() || !user || submitting) return;
    
    setSubmitting(true);
    try {
      const newEulogy = await dropEulogy(
        grave.id, 
        eulogyText, 
        userProfile?.username || 'Anonymous Mourner',
        user.uid
      );
      setEulogies(prev => {
        const next = [...prev, newEulogy];
        grave.eulogies = next;
        return next;
      });
      setEulogyText('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEulogy = async (eulogy: Eulogy, evt: React.MouseEvent) => {
    evt.stopPropagation();
    try {
      await deleteEulogy(grave.id, eulogy);
      setEulogies(prev => {
        const next = prev.filter(e => {
          if (e.id && eulogy.id) return e.id !== eulogy.id;
          return e.created_at !== eulogy.created_at || e.text !== eulogy.text;
        });
        grave.eulogies = next;
        return next;
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGrave = async () => {
    try {
      await deleteGrave(grave.id);
      onClose();
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = async (friendId: string) => {
    if (!user || !userProfile) return;
    setSharingTo(friendId);
    try {
      await shareGraveWithFriend(grave.id, grave.project_name, user.uid, userProfile.username, friendId);
      setShowShare(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSharingTo(null);
    }
  };

  return (
    <>
      <AnimatePresence>
        {showShareCard && (
          <ShareCardModal 
             grave={grave}
             respects={respects}
             eulogiesCount={eulogies.length}
             graveOwnerUsername={graveOwnerUsername}
             onClose={() => setShowShareCard(false)}
          />
        )}
      </AnimatePresence>

    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-black/75 backdrop-blur-md cursor-pointer"
        onClick={onClose}
        aria-label="Close modal"
      />

      {/* Modal Content */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative w-full max-w-lg bg-zinc-950/95 backdrop-blur-2xl border border-zinc-800 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] p-5 md:p-6 flex flex-col items-center text-center gap-3 overflow-hidden selection:bg-[#c53030]/20 selection:text-[#c53030] ring-1 ring-white/5 max-h-[90vh] overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Ambient Glow */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#c53030]/30 to-transparent opacity-50" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-radial from-[#c53030]/5 to-transparent blur-[80px] pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 flex flex-col items-center gap-2 w-full">
          <div className="inline-block px-3 py-1 rounded-full border border-code-red/30 bg-code-red/10 text-code-red text-[10px] font-mono uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(248,113,113,0.2)]">
            {grave.cause_of_death}
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white font-sans tracking-tight leading-tight drop-shadow-xl">
            {grave.project_name}
          </h2>
          {graveOwnerUsername && (
             <p className="text-xs font-mono text-[#c53030]/80 uppercase tracking-widest mt-0.5">
               Laid to rest by <Link to={`/user/${graveOwnerUsername}`} className="text-zinc-200 hover:text-white underline decoration-[#c53030]/50 underline-offset-4" onClick={(e) => e.stopPropagation()}>@{graveOwnerUsername}</Link>
             </p>
          )}
        </div>

        {/* Divider */}
        <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#c53030]/50 to-transparent my-1" />

        {/* Lesson */}
        <div className="relative z-10 max-w-lg w-full">
          <p className="text-sm md:text-base text-zinc-200 font-serif italic leading-relaxed mix-blend-lighten">
            "{grave.lesson_learned}"
          </p>
        </div>

        {/* Meta Grid */}
        <div className={`grid ${grave.github_link ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-3'} gap-y-4 gap-x-4 w-full border-t border-[#c53030]/20 pt-3 mt-1 text-center items-center`}>
            <div className="flex flex-col gap-1">
                <span className="text-[8px] text-[#c53030]/60 font-mono uppercase tracking-widest">Lived For</span>
                <span className="text-zinc-300 font-mono text-[10px] tracking-wide">{grave.lived_for || "Unknown"}</span>
            </div>
             <div className={`flex flex-col gap-1 ${grave.github_link ? 'md:col-span-1 col-span-2 order-3 md:order-2' : ''}`}>
                <span className="text-[8px] text-[#c53030]/60 font-mono uppercase tracking-widest">Tech Stack</span>
                <span className="text-[#c53030] font-mono text-[10px] font-medium tracking-wide truncate">{grave.tech_stack || "Unknown"}</span>
            </div>
            {grave.github_link && (
               <div className="flex flex-col gap-1 order-4 md:order-3 md:col-span-1 col-span-2 overflow-hidden">
                  <span className="text-[8px] text-[#c53030]/60 font-mono uppercase tracking-widest">Repo</span>
                  <a href={grave.github_link} target="_blank" rel="noopener noreferrer" className="text-zinc-300 font-mono text-[10px] tracking-wide hover:text-[#c53030] hover:underline transition-colors truncate block">
                    {grave.github_link.replace(/^https?:\/\/(www\.)?github\.com\//, '')}
                  </a>
               </div>
            )}
             <div className={`flex flex-col gap-1 ${grave.github_link ? 'order-2 md:order-4' : ''}`}>
                <span className="text-[8px] text-[#c53030]/60 font-mono uppercase tracking-widest">Est.</span>
                <span className="text-zinc-300 font-mono text-[10px] tracking-wide">{new Date(grave.created_at).getFullYear()}</span>
            </div>
        </div>

        {/* Gamified Social Features */}
        <div className="w-full flex flex-col gap-4 pt-3 border-t border-[#c53030]/20">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button 
                    onClick={handleClickF}
                    onPointerDown={handlePointerDown}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                    disabled={!user}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all ${
                      hasPressedF 
                        ? 'bg-[#c53030]/20 border-[#c53030]/40 text-[#c53030] hover:bg-transparent hover:border-[#c53030]/60 cursor-pointer'
                        : 'bg-zinc-900/50 border-zinc-700 text-zinc-100 hover:bg-[#c53030]/10 hover:border-[#c53030]/50 hover:text-[#c53030] cursor-pointer'
                    } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title="Hold for RIP list"
                  >
                    <span className="font-mono font-bold text-base">RIP</span>
                    <span className="text-[11px] uppercase tracking-widest font-mono">
                      {hasPressedF ? 'Take Back Respect' : 'Pay Respects'}
                    </span>
                    <span className="ml-1 px-1.5 py-0.5 bg-black/30 rounded text-[11px] font-mono">{respects}</span>
                  </button>
                  {showRipersList && ripsList.length > 0 && (
                    <div className="absolute left-0 bottom-full mb-2 w-48 bg-zinc-950 border border-[#c53030]/30 rounded-xl shadow-xl overflow-hidden z-20">
                      <div className="p-2 border-b border-[#c53030]/20 text-xs font-mono tracking-widest text-[#c53030]/80 text-left">
                        RIPed By
                      </div>
                      <div className="max-h-40 overflow-y-auto custom-scrollbar p-2 flex flex-col gap-1">
                        {ripsList.map((r, i) => (
                          <Link key={i} to={`/user/${r}`} onClick={(e) => e.stopPropagation()} className="text-sm font-sans text-zinc-300 hover:text-white underline decoration-[#c53030] underline-offset-4 transition-colors">
                            @{r}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {user?.uid === grave.user_id && (
                  isConfirmingDelete ? (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={handleDeleteGrave}
                        className="px-3 py-1.5 rounded-full border border-red-900/50 bg-red-900/20 text-red-400 hover:bg-red-900/40 hover:text-red-300 transition-all text-xs font-mono uppercase tracking-widest cursor-pointer"
                        title="Confirm Delete"
                      >
                        Confirm
                      </button>
                      <button 
                        onClick={() => setIsConfirmingDelete(false)}
                        className="px-3 py-1.5 rounded-full border border-zinc-700 bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 transition-all text-xs font-mono uppercase tracking-widest cursor-pointer"
                        title="Cancel Delete"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setIsConfirmingDelete(true)}
                      className="flex items-center justify-center p-2.5 rounded-full border border-zinc-700 bg-zinc-900/50 text-zinc-400 hover:text-red-400 hover:border-red-900/50 hover:bg-red-900/10 transition-all cursor-pointer"
                      title="Exhume Project (Delete)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )
                )}
              </div>
              
              {userProfile && (
              <div className="relative">
                <button 
                  onClick={() => setShowShare(!showShare)}
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-full border border-zinc-700 bg-zinc-900/50 text-zinc-300 hover:text-[#c53030] hover:border-[#c53030]/50 hover:bg-[#c53030]/10 transition-all cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                {showShare && (
                  <div className="absolute right-0 bottom-full mb-2 w-48 bg-zinc-950 border border-[#c53030]/30 rounded-xl shadow-xl overflow-hidden z-20 flex flex-col">
                    <div className="p-2 border-b border-[#c53030]/20 text-[10px] font-mono tracking-widest text-[#c53030]/80 text-left">
                      Share with Friend
                    </div>
                    <div className="max-h-32 overflow-y-auto custom-scrollbar border-b border-[#c53030]/20">
                      {friends.length === 0 ? (
                        <div className="p-3 text-xs text-zinc-500 font-mono text-center">No friends yet.</div>
                      ) : (
                        friends.map(friend => (
                          <button
                            key={friend.uid}
                            onClick={() => handleShare(friend.uid)}
                            disabled={sharingTo === friend.uid}
                            className="w-full text-left px-3 py-2 text-sm font-sans text-zinc-300 hover:text-white underline decoration-[#c53030] underline-offset-4 transition-colors flex items-center justify-between"
                          >
                            <span className="truncate">@{friend.username}</span>
                            {sharingTo === friend.uid && <Loader2 className="w-3 h-3 animate-spin" />}
                          </button>
                        ))
                      )}
                    </div>
                    <div className="flex flex-col border-t border-[#c53030]/20">
                       <button onClick={() => { setShowShare(false); setShowShareCard(true); }} className="w-full text-left px-3 py-2 text-sm font-sans text-zinc-300 hover:bg-[#c53030]/20 hover:text-white transition-colors flex items-center gap-2">
                         <ImageIcon className="w-4 h-4" /> Memorial Share
                       </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            </div>
          </div>
          <div className="flex flex-col gap-2 text-left w-full max-h-[180px] overflow-y-auto custom-scrollbar pr-2">
            <h4 className="text-xs font-mono uppercase tracking-widest text-[#c53030]/80 flex items-center gap-2 sticky top-0 bg-zinc-950/90 py-1 z-10">
              <span>Eulogies</span>
              <span className="px-1.5 py-0.5 bg-[#c53030]/10 rounded-md text-[10px]">{eulogies.length}</span>
            </h4>
            
            <AnimatePresence>
              {eulogies.length === 0 ? (
                <motion.p initial={{opacity: 0}} animate={{opacity: 1}} className="text-zinc-500 text-sm italic">
                  No eulogies have been dropped yet. It's quiet in here.
                </motion.p>
              ) : (
                eulogies.map(e => (
                  <motion.div 
                    key={e.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-1 p-2.5 rounded-xl bg-white/5 border border-white/5 relative group/eulogy"
                  >
                    <div className="flex items-center justify-between">
                      <Link to={`/user/${e.user_name}`} onClick={(evt) => evt.stopPropagation()} className="text-xs font-bold text-zinc-300 hover:text-white underline decoration-[#c53030]/50 underline-offset-4">@{e.user_name}</Link>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-zinc-600 font-mono">{new Date(e.created_at).toLocaleDateString()}</span>
                        {(e.user_id === user?.uid || e.user_name === userProfile?.username || grave.user_id === user?.uid) && (
                          <button
                            onClick={(evt) => handleDeleteEulogy(e, evt)}
                            className="opacity-0 group-hover/eulogy:opacity-100 transition-opacity text-zinc-500 hover:text-red-400 p-1 rounded-md hover:bg-white/5"
                            title="Delete Eulogy"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-zinc-400">{e.text}</p>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {user ? (
            <form onSubmit={handleDropEulogy} className="flex gap-2">
              <input
                type="text"
                placeholder="Drop a eulogy..."
                value={eulogyText}
                onChange={e => setEulogyText(e.target.value)}
                maxLength={200}
                className="flex-1 bg-black/50 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-[#c53030]/50 transition-colors"
              />
              <button 
                type="submit"
                disabled={!eulogyText.trim() || submitting}
                className="px-4 py-2 bg-[#c53030]/20 text-[#c53030] border border-[#c53030]/30 rounded-xl text-xs font-mono uppercase tracking-widest hover:bg-[#c53030]/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[90px]"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Drop It'}
              </button>
            </form>
          ) : (
             <p className="text-xs text-zinc-500 font-mono text-center">Must be signed in to drop a eulogy.</p>
          )}

        </div>

        {/* Close Button */}
        <div className="pt-3">
             <button 
                onClick={onClose}
                className="group relative px-4 py-2 text-xs font-mono text-zinc-300 hover:text-[#c53030] transition-colors uppercase tracking-widest cursor-pointer"
             >
                <span className="relative z-10">[ Close Archives ]</span>
                <span className="absolute inset-x-0 bottom-0 h-px bg-[#c53030]/30 group-hover:bg-[#c53030] transition-colors shadow-[0_0_10px_rgba(223,54,54,0.5)] opacity-0 group-hover:opacity-100"></span>
             </button>
        </div>

      </motion.div>
    </div>
    </>
  );
};
