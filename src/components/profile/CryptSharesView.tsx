import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { SharedGrave, Grave } from '../../types';
import { shareGraveWithFriend } from '../../services/userService';
import { Link } from 'react-router-dom';
import { MessageSquare, Eye, Trash2, Send, Check, Loader2, Sparkles, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CryptSharesViewProps {
  isOwnProfile: boolean;
  targetUserId: string;
  targetUsername?: string;
  myGraves?: Grave[];
  onSelectGraveId: (graveId: string) => void;
}

export const CryptSharesView: React.FC<CryptSharesViewProps> = ({
  isOwnProfile,
  targetUserId,
  targetUsername,
  myGraves = [],
  onSelectGraveId
}) => {
  const { user, userProfile } = useAuth();
  const [sharedGraves, setSharedGraves] = useState<SharedGrave[]>([]);
  const [loading, setLoading] = useState(true);

  // Dispatch state for visiting other profiles
  const [selectedGraveToShare, setSelectedGraveToShare] = useState<string>('');
  const [dispatchLoading, setDispatchLoading] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState(false);
  const [dispatchError, setDispatchError] = useState('');

  useEffect(() => {
    if (!isOwnProfile || !user) {
      setLoading(false);
      return;
    }

    const sharedRef = collection(db, 'users', user.uid, 'shared_graves');
    const q = query(sharedRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const graves = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as SharedGrave));
      setSharedGraves(graves);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isOwnProfile, user]);

  const handleDeleteShare = async (shareId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'shared_graves', shareId));
    } catch (err) {
      console.error('Failed to dismiss share', err);
    }
  };

  const handleDispatchGrave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userProfile || !selectedGraveToShare || !targetUserId) return;

    const grave = myGraves.find(g => g.id === selectedGraveToShare);
    if (!grave) return;

    setDispatchLoading(true);
    setDispatchError('');
    setDispatchSuccess(false);

    try {
      await shareGraveWithFriend(
        grave.id,
        grave.project_name,
        user.uid,
        userProfile.username,
        targetUserId
      );
      setDispatchSuccess(true);
      setTimeout(() => {
        setDispatchSuccess(false);
        setSelectedGraveToShare('');
      }, 3000);
    } catch (err: any) {
      console.error(err);
      setDispatchError(err.message || 'Failed to dispatch grave.');
    } finally {
      setDispatchLoading(false);
    }
  };

  // If visiting another user's profile, show Dispatch Crypt Grave section
  if (!isOwnProfile) {
    return (
      <div className="space-y-6">
        <div className="bg-zinc-950/85 border border-zinc-800/90 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-2xl space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-950/50 border border-red-900/60 flex items-center justify-center text-red-400">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-serif text-white uppercase tracking-wider">
                Summon Grave to @{targetUsername}
              </h3>
              <p className="text-xs font-mono text-zinc-400 mt-0.5">
                Dispatch an inscribed project from your crypt directly into this developer's terminal feed.
              </p>
            </div>
          </div>

          {myGraves.length === 0 ? (
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs font-mono text-zinc-400">
              You haven't laid any abandoned projects to rest yet. Inscribe a grave first in order to share it with fellow morticians.
            </div>
          ) : (
            <form onSubmit={handleDispatchGrave} className="space-y-4 max-w-lg">
              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-2">
                  Select Project Memorial:
                </label>
                <select
                  value={selectedGraveToShare}
                  onChange={(e) => setSelectedGraveToShare(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-zinc-100 font-mono focus:outline-none focus:border-red-500/60"
                >
                  <option value="">-- Choose one of your deceased projects --</option>
                  {myGraves.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.project_name} ({new Date(g.created_at).getFullYear()})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={!selectedGraveToShare || dispatchLoading}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#c53030] hover:bg-[#a82525] text-white font-mono text-xs uppercase tracking-wider font-bold transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(197,48,48,0.3)]"
              >
                {dispatchLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Dispatching...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Memorial to Crypt</span>
                  </>
                )}
              </button>

              {dispatchSuccess && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs font-mono text-emerald-300 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Memorial successfully dispatched to @{targetUsername}'s crypt feed.</span>
                </div>
              )}

              {dispatchError && (
                <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-xs font-mono text-red-300">
                  {dispatchError}
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    );
  }

  // Current user's own profile view of Crypt Shares
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div>
          <h3 className="text-lg font-serif font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-red-500" />
            <span>Crypt Shares & Dispatches</span>
          </h3>
          <p className="text-xs font-mono text-zinc-400 mt-0.5">
            Memorials sent directly to you by comrades across the cemetery network.
          </p>
        </div>
        <span className="text-xs font-mono text-zinc-500 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
          {sharedGraves.length} Received
        </span>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-zinc-500 font-mono text-sm space-y-2">
          <Loader2 className="w-6 h-6 animate-spin text-red-500" />
          <p>Listening to crypt transmissions...</p>
        </div>
      ) : sharedGraves.length === 0 ? (
        <div className="py-20 text-center border border-zinc-800/80 bg-zinc-950/40 rounded-2xl p-6 space-y-3">
          <div className="text-4xl">📜</div>
          <h4 className="text-base font-bold font-serif text-white uppercase tracking-wider">
            No Crypt Shares Received
          </h4>
          <p className="text-xs font-mono text-zinc-400 max-w-sm mx-auto">
            Your dispatch box is empty. When coven comrades send deceased projects to your yard, they will materialize here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {sharedGraves.map((share) => (
              <motion.div
                key={share.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 hover:border-zinc-700 transition-all shadow-xl flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest">
                      Shared on {new Date(share.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleDeleteShare(share.id)}
                      title="Dismiss this share"
                      className="text-zinc-500 hover:text-red-400 p-1 rounded hover:bg-zinc-900 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4 className="text-lg font-bold font-serif text-white group-hover:text-red-300 transition-colors">
                    {share.graveName}
                  </h4>

                  <div className="flex items-center gap-2 pt-1 text-xs font-mono">
                    <span className="text-zinc-400">Summoned by:</span>
                    <Link
                      to={`/user/${share.fromUsername}`}
                      className="font-bold text-zinc-200 hover:text-white underline decoration-red-500/50"
                    >
                      @{share.fromUsername}
                    </Link>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                  <button
                    onClick={() => onSelectGraveId(share.graveId)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-mono text-xs font-bold transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-red-400" />
                    <span>Inspect Epitaph</span>
                  </button>

                  <span className="text-xl opacity-70">🪦</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
