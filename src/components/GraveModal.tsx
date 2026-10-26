import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Grave, Eulogy, Friend } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { pressF, dropEulogy, unpressF, deleteEulogy, deleteGrave, updateResurrectionStatus } from '../services/graveService';
import { shareGraveWithFriend } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import { calculateGraveScore, getGraveTier } from '../services/graveScoreService';
import { Loader2, Share2, Trash2, Image as ImageIcon, Sparkles, Zap, X } from 'lucide-react';
import { db } from '../firebase';
import { collection, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { ShareCardModal } from './ShareCardModal';
import { SocialPostModal } from './SocialPostModal';

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
  const [showSocialModal, setShowSocialModal] = useState(false);

  const [isResurrected, setIsResurrected] = useState<boolean>(grave.is_resurrected || false);
  const [resurrectionNote, setResurrectionNote] = useState<string>(grave.resurrection_note || '');
  const [isEditingResurrection, setIsEditingResurrection] = useState(false);
  const [editResurrected, setEditResurrected] = useState<boolean>(grave.is_resurrected || false);
  const [editNote, setEditNote] = useState<string>(grave.resurrection_note || '');
  const [resurrectionSaving, setResurrectionSaving] = useState(false);

  const currentGraveState = useMemo(() => ({
    ...grave,
    respects,
    eulogies
  }), [grave, respects, eulogies]);

  const graveScore = useMemo(() => calculateGraveScore(currentGraveState), [currentGraveState]);
  const graveTier = useMemo(() => getGraveTier(graveScore), [graveScore]);

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

  const handleSaveResurrection = async () => {
    setResurrectionSaving(true);
    try {
      await updateResurrectionStatus(grave.id, editResurrected, editNote);
      setIsResurrected(editResurrected);
      setResurrectionNote(editNote);
      grave.is_resurrected = editResurrected;
      grave.resurrection_note = editNote;
      setIsEditingResurrection(false);
    } catch (err) {
      console.error("Failed to update resurrection status", err);
    } finally {
      setResurrectionSaving(false);
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

      <AnimatePresence>
        {showSocialModal && (
          <SocialPostModal 
             grave={grave}
             onClose={() => setShowSocialModal(false)}
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
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-radial from-[#c53030]/5 to-transparent blur-[80px] pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 flex flex-col items-center gap-2 w-full">
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <div className="inline-block px-3 py-1 rounded-full border border-code-red/30 bg-code-red/10 text-code-red text-[10px] font-mono uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(248,113,113,0.2)]">
              {grave.cause_of_death}
            </div>
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-mono uppercase tracking-wider font-bold ${graveTier.badgeColor}`}>
              <span>{graveTier.icon}</span>
              <span>{graveTier.name}</span>
              <span>•</span>
              <span>{graveScore} PTS</span>
            </div>
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

        {/* Luminous Resurrected Banner */}
        {isResurrected && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full bg-gradient-to-r from-emerald-950/80 via-emerald-900/40 to-emerald-950/80 border border-emerald-500/60 rounded-xl p-3 sm:p-3.5 flex flex-col gap-1.5 text-left shadow-[0_0_25px_rgba(16,185,129,0.3)] relative overflow-hidden backdrop-blur-md"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs sm:text-sm font-mono font-bold tracking-widest text-emerald-300 uppercase drop-shadow-[0_0_10px_rgba(52,211,153,0.5)] flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" /> Under Active Resurrection
                </span>
              </div>
              {user?.uid === grave.user_id && (
                <button
                  onClick={() => {
                    setEditResurrected(isResurrected);
                    setEditNote(resurrectionNote);
                    setIsEditingResurrection(true);
                  }}
                  className="text-[11px] font-mono text-emerald-300 hover:text-white underline decoration-emerald-500/50 underline-offset-2 transition-colors cursor-pointer"
                >
                  Edit / Revoke
                </button>
              )}
            </div>
            {resurrectionNote && (
              <p className="text-xs text-emerald-100/90 font-mono pl-3 border-l-2 border-emerald-500/50 italic mt-0.5">
                "{resurrectionNote}"
              </p>
            )}
          </motion.div>
        )}

        {/* Project Owner: Initiate Resurrection button if not yet resurrected */}
        {user?.uid === grave.user_id && !isResurrected && !isEditingResurrection && (
          <div className="w-full flex justify-center">
            <button
              onClick={() => {
                setEditResurrected(true);
                setEditNote(resurrectionNote);
                setIsEditingResurrection(true);
              }}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/40 hover:border-emerald-400 hover:text-white transition-all text-xs font-mono tracking-wider cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.15)] group"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Resurrect Project (Bring Back to Life)</span>
            </button>
          </div>
        )}

        {/* Owner Resurrection Protocol Editor */}
        {isEditingResurrection && (
          <motion.div 
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-zinc-900/95 border border-emerald-500/50 rounded-xl p-3.5 text-left flex flex-col gap-2.5 shadow-[0_0_30px_rgba(0,0,0,0.8)] relative z-20"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5" /> Resurrection Protocol Controls
              </div>
              <button 
                onClick={() => setIsEditingResurrection(false)}
                className="text-zinc-500 hover:text-zinc-300 text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-zinc-200 select-none">
              <input 
                type="checkbox" 
                checked={editResurrected} 
                onChange={(e) => setEditResurrected(e.target.checked)} 
                className="accent-emerald-500 w-4 h-4 rounded cursor-pointer"
              />
              <span>Declare project as "Brought Back to Life" (Active Resurrection)</span>
            </label>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                Resurrection Note / Roadmap (Optional):
              </span>
              <input 
                type="text" 
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                placeholder="e.g. Pivoting to a lightweight CLI with Rust & SQLite"
                maxLength={150}
                className="w-full bg-black/60 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/60 transition-colors"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setIsEditingResurrection(false)}
                className="px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveResurrection}
                disabled={resurrectionSaving}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-xs font-mono uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              >
                {resurrectionSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Status'}
              </button>
            </div>
          </motion.div>
        )}

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
                        className="px-3 py-1.5 rounded-full border border-red-500 bg-red-600 hover:bg-red-700 text-white transition-all text-xs font-mono font-bold uppercase tracking-widest cursor-pointer shadow-sm"
                        title="Confirm Delete"
                      >
                        Confirm
                      </button>
                      <button 
                        onClick={() => setIsConfirmingDelete(false)}
                        className="px-3 py-1.5 rounded-full border border-zinc-700 bg-zinc-800 text-zinc-200 hover:text-white hover:bg-zinc-700 transition-all text-xs font-mono uppercase tracking-widest cursor-pointer"
                        title="Cancel Delete"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setIsConfirmingDelete(true)}
                      className="flex items-center justify-center p-2.5 rounded-full border border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-red-400 hover:border-red-500 hover:bg-red-950/30 transition-all cursor-pointer shadow-sm"
                      title="Exhume Project (Delete)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowSocialModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-sky-800/40 bg-sky-950/40 text-sky-300 hover:text-white hover:border-sky-400 hover:bg-sky-900/50 transition-all text-xs font-mono tracking-wider cursor-pointer shadow-[0_0_15px_rgba(14,165,233,0.15)]"
                  title="Generate LinkedIn & Social Mistake Analysis"
                >
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  <span className="hidden sm:inline">LinkedIn Post</span>
                  <span className="sm:hidden">LinkedIn</span>
                </button>

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
                         <button onClick={() => { setShowShare(false); setShowSocialModal(true); }} className="w-full text-left px-3 py-2 text-sm font-sans text-sky-300 hover:bg-sky-950/40 hover:text-white transition-colors flex items-center gap-2 border-b border-[#c53030]/20">
                           <Sparkles className="w-4 h-4 text-sky-400" /> LinkedIn Analysis
                         </button>
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
