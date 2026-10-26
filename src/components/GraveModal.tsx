import React, { useEffect, useState, useRef } from 'react';
import { Grave, Eulogy, Friend } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { pressF, dropEulogy, unpressF, deleteEulogy, deleteGrave } from '../services/graveService';
import { shareGraveWithFriend } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Share2, Trash2, Image as ImageIcon, X } from 'lucide-react';
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
      const friendsData = snapshot.docs.map(docSnapshot => ({ uid: docSnapshot.id, ...docSnapshot.data() } as Friend));
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
    const textToSubmit = eulogyText.trim();
    setEulogyText('');

    try {
      const createdEulogy = await dropEulogy(grave.id, textToSubmit, currentUserDisplayName, user.uid);
      setEulogies(prev => [createdEulogy, ...prev]);
    } catch (err) {
      console.error(err);
      setEulogyText(textToSubmit);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEulogy = async (eulogyToDelete: Eulogy, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    if (confirm("Are you sure you want to delete this eulogy?")) {
      setEulogies(prev => prev.filter(item => item.id !== eulogyToDelete.id));
      try {
        await deleteEulogy(grave.id, eulogyToDelete);
      } catch (err) {
        console.error(err);
        setEulogies(prev => [eulogyToDelete, ...prev]);
      }
    }
  };

  const handleShare = async (friendUid: string) => {
    if (!user) return;
    setSharingTo(friendUid);
    try {
      await shareGraveWithFriend(grave.id, grave.project_name, user.uid, currentUserDisplayName, friendUid);
      setShowShare(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSharingTo(null);
    }
  };

  const handleDeleteGrave = async () => {
    if (!user || user.uid !== grave.user_id) return;
    try {
      await deleteGrave(grave.id);
      onClose();
      window.location.reload();
    } catch (err) {
      console.error("Error deleting grave", err);
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
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-md"
      />

      {/* Modal Dialog */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", duration: 0.5, bounce: 0.1 }}
        className="relative w-full max-w-lg bg-zinc-950/95 backdrop-blur-2xl border border-zinc-800 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] p-5 md:p-6 flex flex-col items-center text-center gap-3 overflow-hidden selection:bg-[#c53030]/20 selection:text-[#c53030] ring-1 ring-white/5 max-h-[90vh] overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Quick Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors z-20 border border-transparent hover:border-zinc-700/60 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ambient Glow */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#c53030]/30 to-transparent opacity-50" />
        
        {/* Cause of Death Badge */}
        <span className="inline-block px-3 py-1 bg-[#c53030]/10 border border-[#c53030]/30 rounded-full text-xs font-mono uppercase tracking-widest text-[#c53030]">
          {grave.cause_of_death}
        </span>

        {/* Project Name */}
        <h2 className="text-3xl sm:text-4xl font-bold font-sans text-zinc-100 tracking-tight">
          {grave.project_name}
        </h2>

        {/* Metadata */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs font-mono text-zinc-500">
          <span>Lived: {grave.lived_for}</span>
          {graveOwnerUsername && (
            <>
              <span>•</span>
              <Link 
                to={`/user/${graveOwnerUsername}`} 
                onClick={onClose} 
                className="hover:text-zinc-300 underline decoration-zinc-700 underline-offset-2 transition-colors"
              >
                @{graveOwnerUsername}
              </Link>
            </>
          )}
          {grave.github_link && (
            <>
              <span>•</span>
              <a 
                href={grave.github_link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-red-400 hover:text-red-300 underline decoration-red-900/50 underline-offset-2 flex items-center gap-1"
              >
                GitHub Source
              </a>
            </>
          )}
        </div>

        {/* Tech Stack */}
        {grave.tech_stack && (
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
            {grave.tech_stack.split(',').map((tech, i) => (
              <span key={i} className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-[11px] font-mono text-zinc-400">
                {tech.trim()}
              </span>
            ))}
          </div>
        )}

        <div className="w-full h-px bg-zinc-800/80 my-2" />

        {/* The Lesson Learned */}
        <div className="space-y-1 max-w-md">
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 block">
            Epitaph & Lesson Learned
          </span>
          <p className="font-serif italic text-base sm:text-lg text-zinc-300 leading-relaxed">
            "{grave.lesson_learned}"
          </p>
        </div>

        {/* Action Controls */}
        <div className="w-full flex flex-col gap-4 pt-3">
          <div className="flex items-center justify-between border-t border-b border-zinc-800/60 py-3 px-2">
            
            {/* Respects Button */}
            <div className="relative">
              <button
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                onClick={handleClickF}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                  hasPressedF 
                    ? 'bg-[#c53030]/20 text-red-300 border border-[#c53030]/50 shadow-[0_0_15px_rgba(197,48,48,0.3)]' 
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white hover:border-zinc-700'
                }`}
              >
                <span>🌹</span>
                <span>{hasPressedF ? 'Respected' : 'Press F'}</span>
                <span className="px-1.5 py-0.5 bg-black/40 rounded text-[10px] text-zinc-300">{respects}</span>
              </button>

              {/* Mourners who pressed F tooltip */}
              {showRipersList && (
                <div className="absolute left-0 bottom-full mb-2 w-48 bg-zinc-950 border border-zinc-800 rounded-xl p-3 shadow-2xl z-30 text-left">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1">Mourners</div>
                  <div className="max-h-24 overflow-y-auto custom-scrollbar text-xs font-mono text-zinc-300 space-y-1">
                    {ripsList.length === 0 ? 'No respects yet' : ripsList.map((r, i) => (
                      <div key={i} className="truncate">@{r}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right side buttons */}
            <div className="flex items-center gap-2">
              {/* Memorial Share Card Button */}
              <button
                onClick={() => setShowShareCard(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:text-white hover:border-[#c53030]/50 hover:bg-[#c53030]/10 transition-colors text-xs font-mono tracking-wider cursor-pointer"
                title="Create Memorial Share Card"
              >
                <ImageIcon className="w-3.5 h-3.5 text-red-400" />
                <span className="hidden sm:inline">Memorial Card</span>
              </button>

              {/* Share with Friend */}
              {userProfile && (
                <div className="relative">
                  <button 
                    onClick={() => setShowShare(!showShare)}
                    className="flex items-center gap-1.5 p-2 rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors cursor-pointer"
                    title="Share with Friend"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  {showShare && (
                    <div className="absolute right-0 bottom-full mb-2 w-48 bg-zinc-950 border border-[#c53030]/30 rounded-xl shadow-xl overflow-hidden z-20 flex flex-col">
                      <div className="p-2 border-b border-[#c53030]/20 text-[10px] font-mono tracking-widest text-[#c53030]/80 text-left">
                        Share with Friend
                      </div>
                      <div className="max-h-32 overflow-y-auto custom-scrollbar">
                        {friends.length === 0 ? (
                          <div className="p-3 text-xs text-zinc-500 font-mono text-center">No friends yet.</div>
                        ) : (
                          friends.map(friend => (
                            <button
                              key={friend.uid}
                              onClick={() => handleShare(friend.uid)}
                              disabled={sharingTo === friend.uid}
                              className="w-full text-left px-3 py-2 text-xs font-mono text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors flex items-center justify-between"
                            >
                              <span className="truncate">@{friend.username}</span>
                              {sharingTo === friend.uid && <Loader2 className="w-3 h-3 animate-spin" />}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Owner Delete Grave Option */}
              {user && user.uid === grave.user_id && (
                <div className="relative">
                  {isConfirmingDelete ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={handleDeleteGrave}
                        className="px-2 py-1 bg-red-600 text-white rounded text-[10px] font-mono uppercase hover:bg-red-700 cursor-pointer"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setIsConfirmingDelete(false)}
                        className="px-2 py-1 bg-zinc-800 text-zinc-300 rounded text-[10px] font-mono uppercase hover:bg-zinc-700 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsConfirmingDelete(true)}
                      className="p-2 text-zinc-600 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                      title="Delete Grave"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Eulogies Feed */}
          <div className="flex flex-col gap-2 text-left w-full max-h-[160px] overflow-y-auto custom-scrollbar pr-1">
            <h4 className="text-xs font-mono uppercase tracking-widest text-[#c53030]/80 flex items-center gap-2 sticky top-0 bg-zinc-950/95 py-1 z-10">
              <span>Eulogies</span>
              <span className="px-1.5 py-0.5 bg-[#c53030]/10 rounded-md text-[10px]">{eulogies.length}</span>
            </h4>
            
            <AnimatePresence>
              {eulogies.length === 0 ? (
                <motion.p initial={{opacity: 0}} animate={{opacity: 1}} className="text-zinc-500 text-xs font-mono italic">
                  No eulogies have been dropped yet. The crypt is silent.
                </motion.p>
              ) : (
                eulogies.map(e => (
                  <motion.div 
                    key={e.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-1 p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 relative group/eulogy"
                  >
                    <div className="flex items-center justify-between">
                      <Link 
                        to={`/user/${e.user_name}`} 
                        onClick={(evt) => evt.stopPropagation()} 
                        className="text-xs font-mono font-bold text-zinc-300 hover:text-white hover:underline"
                      >
                        @{e.user_name}
                      </Link>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-zinc-600 font-mono">{new Date(e.created_at).toLocaleDateString()}</span>
                        {(e.user_id === user?.uid || e.user_name === userProfile?.username || grave.user_id === user?.uid) && (
                          <button
                            onClick={(evt) => handleDeleteEulogy(e, evt)}
                            className="opacity-0 group-hover/eulogy:opacity-100 transition-opacity text-zinc-500 hover:text-red-400 p-1 rounded hover:bg-white/5 cursor-pointer"
                            title="Delete Eulogy"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed font-sans">{e.text}</p>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Drop Eulogy Input */}
          {user ? (
            <form onSubmit={handleDropEulogy} className="flex gap-2">
              <input
                type="text"
                placeholder="Drop a eulogy into the crypt..."
                value={eulogyText}
                onChange={e => setEulogyText(e.target.value)}
                maxLength={200}
                className="flex-1 bg-black/60 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-[#c53030]/60 transition-colors font-sans"
              />
              <button 
                type="submit"
                disabled={!eulogyText.trim() || submitting}
                className="px-4 py-2 bg-[#c53030]/20 text-[#c53030] border border-[#c53030]/30 rounded-xl text-xs font-mono uppercase tracking-widest hover:bg-[#c53030]/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px] cursor-pointer"
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Drop It'}
              </button>
            </form>
          ) : (
             <p className="text-xs text-zinc-500 font-mono text-center">Must be signed in to drop a eulogy.</p>
          )}

        </div>

        {/* Close Button */}
        <div className="pt-2">
             <button 
                onClick={onClose}
                className="group relative px-4 py-2 text-xs font-mono text-zinc-400 hover:text-[#c53030] transition-colors uppercase tracking-widest cursor-pointer"
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
