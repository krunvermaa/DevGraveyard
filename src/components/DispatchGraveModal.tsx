import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Search, 
  Loader2, 
  Send, 
  Check, 
  Ghost, 
  Sparkles, 
  AlertCircle,
  Users
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserGraves, getGraves } from '../services/graveService';
import { shareGraveWithFriend } from '../services/userService';
import { Grave, Friend } from '../types';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';

interface DispatchGraveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (dispatch: { graveName: string; toUsername: string }) => void;
}

export const DispatchGraveModal: React.FC<DispatchGraveModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user, userProfile } = useAuth();

  // Data states
  const [myGraves, setMyGraves] = useState<Grave[]>([]);
  const [allGraves, setAllGraves] = useState<Grave[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loadingGraves, setLoadingGraves] = useState(true);
  const [loadingFriends, setLoadingFriends] = useState(true);

  // Selection states
  const [graveSourceTab, setGraveSourceTab] = useState<'my' | 'all'>('my');
  const [selectedGrave, setSelectedGrave] = useState<Grave | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [graveSearch, setGraveSearch] = useState('');
  const [friendSearch, setFriendSearch] = useState('');

  // Submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load graves
  useEffect(() => {
    if (!isOpen || !user) return;
    let isMounted = true;
    setLoadingGraves(true);

    const fetchGraveData = async () => {
      try {
        const [userG, publicG] = await Promise.all([
          getUserGraves(user.uid),
          getGraves()
        ]);
        if (isMounted) {
          setMyGraves(userG);
          setAllGraves(publicG);
          // If user has no buried graves, automatically select 'all' tab
          if (userG.length === 0 && publicG.length > 0) {
            setGraveSourceTab('all');
          }
        }
      } catch (err) {
        console.error("Error loading graves for dispatch modal:", err);
      } finally {
        if (isMounted) {
          setLoadingGraves(false);
        }
      }
    };

    fetchGraveData();
    return () => {
      isMounted = false;
    };
  }, [isOpen, user]);

  // Load friends
  useEffect(() => {
    if (!isOpen || !user) return;
    setLoadingFriends(true);

    const friendsRef = collection(db, 'users', user.uid, 'friends');
    const unsubscribe = onSnapshot(
      friendsRef,
      (snapshot) => {
        const friendsList = snapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        } as Friend));
        setFriends(friendsList);
        setLoadingFriends(false);
      },
      (error) => {
        console.error("Error fetching friends for dispatch modal:", error);
        setLoadingFriends(false);
      }
    );

    return () => unsubscribe();
  }, [isOpen, user]);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filtered graves based on active source tab and search query
  const filteredGraves = useMemo(() => {
    const list = graveSourceTab === 'my' ? myGraves : allGraves;
    if (!graveSearch.trim()) return list;
    const q = graveSearch.toLowerCase().trim();
    return list.filter(g => 
      (g.project_name || '').toLowerCase().includes(q) ||
      (g.cause_of_death || '').toLowerCase().includes(q) ||
      (g.tech_stack || '').toLowerCase().includes(q)
    );
  }, [graveSourceTab, myGraves, allGraves, graveSearch]);

  // Filtered friends
  const filteredFriends = useMemo(() => {
    if (!friendSearch.trim()) return friends;
    const q = friendSearch.toLowerCase().trim();
    return friends.filter(f => (f.username || '').toLowerCase().includes(q));
  }, [friends, friendSearch]);

  const handleDispatch = async () => {
    if (!user || !selectedGrave || !selectedFriend || isSubmitting) return;

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const fromUsername = userProfile?.username || user.displayName || 'Cryptkeeper';
      await shareGraveWithFriend(
        selectedGrave.id,
        selectedGrave.project_name,
        user.uid,
        fromUsername,
        selectedFriend.uid,
        selectedFriend.username
      );

      setStatusMessage({
        type: 'success',
        text: `Tombstone "${selectedGrave.project_name}" successfully dispatched across the veil to @${selectedFriend.username}!`
      });

      if (onSuccess) {
        onSuccess({
          graveName: selectedGrave.project_name,
          toUsername: selectedFriend.username
        });
      }

      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
      }, 1300);
    } catch (err) {
      console.error("Failed to dispatch grave:", err);
      setStatusMessage({
        type: 'error',
        text: "Failed to transmit dispatch across the catacombs. Please try again."
      });
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;
  if (typeof document === 'undefined' || !document.body) return null;

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-md"
      />

      {/* Modal Dialog Card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.9)] p-5 sm:p-6 flex flex-col gap-4 text-left overflow-hidden ring-1 ring-white/5 max-h-[92vh] overflow-y-auto custom-scrollbar"
      >
        {/* Subtle top crimson glow */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#c53030] to-transparent opacity-80" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-950/40 border border-red-900/60 flex items-center justify-center text-xl text-red-400 shadow-[0_0_15px_rgba(197,48,48,0.3)] shrink-0">
              🪦
            </div>
            <div>
              <h3 className="text-xl font-bold font-sans text-zinc-100 flex items-center gap-2">
                <span>Dispatch a Grave</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#c53030]/20 text-red-300 border border-[#c53030]/40 font-mono font-normal">
                  Crypt Mail
                </span>
              </h3>
              <p className="text-xs font-mono text-zinc-500">
                Transmit a tombstone to a comrade's dispatches archive
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-zinc-800"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status notification */}
        <AnimatePresence>
          {statusMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`p-3 rounded-xl border text-xs font-mono flex items-center gap-2.5 ${
                statusMessage.type === 'success'
                  ? 'bg-green-950/30 border-green-800/60 text-green-300'
                  : 'bg-red-950/30 border-red-800/60 text-red-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <Sparkles className="w-4 h-4 text-green-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SECTION 1: Select Tombstone */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold flex items-center gap-1.5">
              <span className="text-red-400">1.</span> Select Tombstone to Dispatch:
            </label>

            {/* Source tabs: My Graves vs Cemetery */}
            <div className="flex items-center gap-1 bg-zinc-900/90 p-0.5 rounded-lg border border-zinc-800 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => setGraveSourceTab('my')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  graveSourceTab === 'my'
                    ? 'bg-[#c53030]/30 text-white border border-[#c53030]/60 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                My Buried Graves ({myGraves.length})
              </button>
              <button
                type="button"
                onClick={() => setGraveSourceTab('all')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  graveSourceTab === 'all'
                    ? 'bg-[#c53030]/30 text-white border border-[#c53030]/60 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Cemetery Archives ({allGraves.length})
              </button>
            </div>
          </div>

          {/* Search Graves Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={graveSearch}
              onChange={e => setGraveSearch(e.target.value)}
              placeholder="Filter graves by name or cause of death..."
              className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl pl-8 pr-7 py-1.5 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-[#c53030]/70 transition-colors"
            />
            {graveSearch && (
              <button
                type="button"
                onClick={() => setGraveSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Graves list */}
          <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
            {loadingGraves ? (
              <div className="py-6 flex flex-col items-center justify-center gap-2 text-zinc-500">
                <Loader2 className="w-5 h-5 animate-spin text-[#c53030]" />
                <span className="text-xs font-mono">Loading tombstones...</span>
              </div>
            ) : filteredGraves.length === 0 ? (
              <div className="py-6 px-4 rounded-xl bg-zinc-900/40 border border-zinc-800/60 text-center space-y-2">
                <Ghost className="w-6 h-6 text-zinc-600 mx-auto" />
                <p className="text-xs font-mono text-zinc-400">
                  {graveSourceTab === 'my'
                    ? "You haven't buried any projects in the cemetery yet."
                    : "No matching tombstones found in the cemetery."}
                </p>
                {graveSourceTab === 'my' && (
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setGraveSourceTab('all')}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-mono cursor-pointer"
                    >
                      Browse Cemetery Archives
                    </button>
                    <Link
                      to="/submit"
                      onClick={onClose}
                      className="px-2.5 py-1 rounded-lg bg-[#c53030]/20 text-red-300 border border-[#c53030]/40 text-[11px] font-mono hover:bg-[#c53030]/30 transition-colors"
                    >
                      [ Bury a Project ]
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              filteredGraves.map(grave => {
                const isSelected = selectedGrave?.id === grave.id;
                return (
                  <button
                    key={grave.id}
                    type="button"
                    onClick={() => setSelectedGrave(grave)}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-[#c53030] bg-[#c53030]/15 shadow-[0_0_12px_rgba(197,48,48,0.2)] ring-1 ring-[#c53030]/60'
                        : 'border-zinc-800/80 bg-zinc-900/50 hover:bg-zinc-900 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-lg shrink-0">🪦</span>
                      <div className="min-w-0">
                        <div className="font-bold text-xs sm:text-sm text-zinc-100 truncate">
                          {grave.project_name}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 mt-0.5 truncate">
                          <span className="text-red-400/90">{grave.cause_of_death}</span>
                          {grave.lived_for && (
                            <>
                              <span>•</span>
                              <span>{grave.lived_for}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-[#c53030] flex items-center justify-center text-white">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-zinc-700 bg-zinc-800/40" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* SECTION 2: Select Comrade (Friend) */}
        <div className="space-y-2.5 pt-2 border-t border-zinc-800/80">
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold flex items-center gap-1.5">
              <span className="text-red-400">2.</span> Select Crypt Comrade:
            </label>
            <span className="text-[11px] font-mono text-zinc-500">
              {friends.length} {friends.length === 1 ? 'friend' : 'friends'} connected
            </span>
          </div>

          {/* Search Friends Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={friendSearch}
              onChange={e => setFriendSearch(e.target.value)}
              placeholder="Search comrades by @username..."
              className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl pl-8 pr-7 py-1.5 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-[#c53030]/70 transition-colors"
            />
            {friendSearch && (
              <button
                type="button"
                onClick={() => setFriendSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Friends list */}
          <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
            {loadingFriends ? (
              <div className="py-5 flex flex-col items-center justify-center gap-2 text-zinc-500">
                <Loader2 className="w-5 h-5 animate-spin text-[#c53030]" />
                <span className="text-xs font-mono">Summoning comrades...</span>
              </div>
            ) : filteredFriends.length === 0 ? (
              <div className="py-5 px-4 rounded-xl bg-zinc-900/40 border border-zinc-800/60 text-center space-y-2">
                <Users className="w-5 h-5 text-zinc-600 mx-auto" />
                <p className="text-xs font-mono text-zinc-400">
                  {friends.length === 0
                    ? "You haven't connected with any fellow cryptkeepers yet."
                    : `No comrade matches "${friendSearch}".`}
                </p>
                {friends.length === 0 && (
                  <Link
                    to="/profile"
                    onClick={onClose}
                    className="inline-block mt-1 px-3 py-1 rounded-lg bg-[#c53030]/20 text-red-300 border border-[#c53030]/40 text-xs font-mono hover:bg-[#c53030]/30 transition-colors uppercase tracking-wider"
                  >
                    [ Summon Friends on Profile ]
                  </Link>
                )}
              </div>
            ) : (
              filteredFriends.map(friend => {
                const isSelected = selectedFriend?.uid === friend.uid;
                return (
                  <button
                    key={friend.uid}
                    type="button"
                    onClick={() => setSelectedFriend(friend)}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-[#c53030] bg-[#c53030]/15 shadow-[0_0_12px_rgba(197,48,48,0.2)] ring-1 ring-[#c53030]/60'
                        : 'border-zinc-800/80 bg-zinc-900/50 hover:bg-zinc-900 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center font-mono font-bold text-xs text-zinc-300 shrink-0">
                        {friend.username.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs sm:text-sm text-zinc-100 truncate">
                          @{friend.username}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-[#c53030] flex items-center justify-center text-white">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-zinc-700 bg-zinc-800/40" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* SECTION 3: Confirmation & Submit Action */}
        <div className="pt-3 border-t border-zinc-800/80 flex flex-col gap-2.5">
          {selectedGrave && selectedFriend && (
            <div className="px-3.5 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs font-mono text-zinc-300 flex items-center justify-between gap-2">
              <span className="text-zinc-500">Dispatching:</span>
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-red-400 font-bold truncate">"{selectedGrave.project_name}"</span>
                <span className="text-zinc-500">→</span>
                <span className="text-zinc-200 font-bold">@{selectedFriend.username}</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 text-xs font-mono transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleDispatch}
              disabled={!selectedGrave || !selectedFriend || isSubmitting}
              className={`px-5 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                selectedGrave && selectedFriend && !isSubmitting
                  ? 'bg-[#c53030] text-white shadow-[0_0_20px_rgba(197,48,48,0.4)] hover:bg-red-700 active:scale-95'
                  : 'bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Transmitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>[ Dispatch Grave ]</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};
