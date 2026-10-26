import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { FriendRequest, Friend } from '../../types';
import { 
  findUserByUsername, sendFriendRequest, respondToFriendRequest, 
  removeFriend, removeFollower 
} from '../../services/userService';
import { Link } from 'react-router-dom';
import { Users, UserPlus, UserCheck, Search, Loader2, Check, X, ShieldAlert, HeartHandshake } from 'lucide-react';

interface ComradesAndMournersViewProps {
  targetUserId: string;
  isOwnProfile: boolean;
  targetUsername?: string;
}

export const ComradesAndMournersView: React.FC<ComradesAndMournersViewProps> = ({
  targetUserId,
  isOwnProfile,
  targetUsername
}) => {
  const { user, userProfile } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'comrades' | 'mourners' | 'invocations'>('comrades');

  const [friends, setFriends] = useState<Friend[]>([]);
  const [followers, setFollowers] = useState<{ uid: string; username?: string; addedAt?: string }[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);

  // Search state
  const [searchUsername, setSearchUsername] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<{ uid: string; username: string } | null>(null);
  const [searchError, setSearchError] = useState('');
  const [requestSentFeedback, setRequestSentFeedback] = useState(false);

  // Remove confirmation states
  const [confirmFriendId, setConfirmFriendId] = useState<string | null>(null);
  const [confirmFollowerId, setConfirmFollowerId] = useState<string | null>(null);

  useEffect(() => {
    if (!targetUserId) return;

    // Listen to friends of target user
    const friendsUnsubscribe = onSnapshot(collection(db, 'users', targetUserId, 'friends'), (snapshot) => {
      const friendsData = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as Friend));
      setFriends(friendsData);
    });

    // Listen to followers of target user
    const followersUnsubscribe = onSnapshot(collection(db, 'users', targetUserId, 'followers'), (snapshot) => {
      const followersData = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as { uid: string; username?: string; addedAt?: string }));
      setFollowers(followersData);
    });

    // Listen to incoming and outgoing friend requests ONLY if it's the current user's profile
    let incomingUnsubscribe: (() => void) | undefined;
    let outgoingUnsubscribe: (() => void) | undefined;

    if (isOwnProfile && user) {
      const incomingQuery = query(
        collection(db, 'friend_requests'),
        where('toUserId', '==', user.uid),
        where('status', '==', 'pending')
      );
      incomingUnsubscribe = onSnapshot(incomingQuery, (snapshot) => {
        const reqs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FriendRequest));
        setIncomingRequests(reqs);
      });

      const outgoingQuery = query(
        collection(db, 'friend_requests'),
        where('fromUserId', '==', user.uid),
        where('status', '==', 'pending')
      );
      outgoingUnsubscribe = onSnapshot(outgoingQuery, (snapshot) => {
        const reqs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FriendRequest));
        setOutgoingRequests(reqs);
      });
    }

    return () => {
      friendsUnsubscribe();
      followersUnsubscribe();
      if (incomingUnsubscribe) incomingUnsubscribe();
      if (outgoingUnsubscribe) outgoingUnsubscribe();
    };
  }, [targetUserId, isOwnProfile, user]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchUsername.trim() || !userProfile) return;

    if (searchUsername.toLowerCase() === userProfile.username.toLowerCase()) {
      setSearchError("You cannot summon yourself as a comrade.");
      return;
    }

    setSearchLoading(true);
    setSearchError('');
    setSearchResult(null);
    setRequestSentFeedback(false);

    try {
      const result = await findUserByUsername(searchUsername.trim());
      if (result) {
        setSearchResult(result);
      } else {
        setSearchError('No developer found in the cemetery records.');
      }
    } catch {
      setSearchError('Error invoking user search.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSendRequest = async () => {
    if (!searchResult || !user || !userProfile) return;
    try {
      await sendFriendRequest(user.uid, userProfile.username, searchResult.uid);
      setRequestSentFeedback(true);
      setTimeout(() => {
        setSearchResult(null);
        setSearchUsername('');
        setRequestSentFeedback(false);
      }, 2000);
    } catch (err: any) {
      setSearchError(err.message || 'Failed to dispatch comrade request.');
    }
  };

  const handleRespond = async (request: FriendRequest, accept: boolean) => {
    if (!user || !userProfile) return;
    try {
      await respondToFriendRequest(
        request.id,
        request.fromUserId,
        user.uid,
        userProfile.username,
        request.fromUsername,
        accept
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!user) return;
    if (confirmFriendId === friendId) {
      try {
        await removeFriend(user.uid, friendId);
        setConfirmFriendId(null);
      } catch (err) {
        console.error(err);
      }
    } else {
      setConfirmFriendId(friendId);
    }
  };

  const handleRemoveFollower = async (followerId: string) => {
    if (!user) return;
    if (confirmFollowerId === followerId) {
      try {
        await removeFollower(user.uid, followerId);
        setConfirmFollowerId(null);
      } catch (err) {
        console.error(err);
      }
    } else {
      setConfirmFollowerId(followerId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('comrades')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all font-bold ${
              activeSubTab === 'comrades'
                ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Comrades in Crypt ({friends.length})
          </button>

          <button
            onClick={() => setActiveSubTab('mourners')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all font-bold ${
              activeSubTab === 'mourners'
                ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Mourners ({followers.length})
          </button>

          {isOwnProfile && (
            <button
              onClick={() => setActiveSubTab('invocations')}
              className={`relative px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all font-bold ${
                activeSubTab === 'invocations'
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>Coven Invocations</span>
              {incomingRequests.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[10px]">
                  {incomingRequests.length}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* SUBTAB 1: Comrades List */}
      {activeSubTab === 'comrades' && (
        <div className="space-y-4">
          {friends.length === 0 ? (
            <div className="py-16 text-center border border-zinc-800/80 bg-zinc-950/40 rounded-2xl p-6 space-y-2">
              <p className="text-3xl">👻</p>
              <h4 className="text-sm font-bold font-serif text-white uppercase tracking-wider">
                Quiet in the Catacombs
              </h4>
              <p className="text-xs font-mono text-zinc-400 max-w-sm mx-auto">
                {isOwnProfile
                  ? 'No comrades connected yet. Use the Coven Invocations tab to summon other developers to your crypt.'
                  : `@${targetUsername || 'This developer'} walks these cemetery grounds alone.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {friends.map(friend => (
                <div
                  key={friend.uid}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 hover:border-zinc-700 transition-all shadow-md group"
                >
                  <Link
                    to={`/user/${friend.username}`}
                    className="flex items-center gap-3 min-w-0"
                  >
                    <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-[#c53030] font-serif font-bold text-sm shrink-0">
                      {friend.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <span className="font-mono text-sm text-zinc-100 font-bold group-hover:text-red-400 transition-colors truncate block">
                        @{friend.username}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                        Comrade
                      </span>
                    </div>
                  </Link>

                  {isOwnProfile && (
                    <div className="shrink-0 pl-2">
                      {confirmFriendId === friend.uid ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setConfirmFriendId(null)}
                            className="px-2 py-1 text-[10px] font-mono rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleRemoveFriend(friend.uid)}
                            className="px-2 py-1 text-[10px] font-mono rounded bg-red-900/60 border border-red-700 text-red-200 hover:bg-red-800"
                          >
                            Confirm
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleRemoveFriend(friend.uid)}
                          className="px-2.5 py-1 text-[11px] font-mono rounded-lg bg-zinc-900 hover:bg-red-950/40 border border-zinc-800 hover:border-red-800/60 text-zinc-400 hover:text-red-300 transition-colors"
                        >
                          Sever Bond
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: Mourners (Followers) */}
      {activeSubTab === 'mourners' && (
        <div className="space-y-4">
          {followers.length === 0 ? (
            <div className="py-16 text-center border border-zinc-800/80 bg-zinc-950/40 rounded-2xl p-6 space-y-2">
              <p className="text-3xl">🕯️</p>
              <h4 className="text-sm font-bold font-serif text-white uppercase tracking-wider">
                No Mourners Following
              </h4>
              <p className="text-xs font-mono text-zinc-400 max-w-sm mx-auto">
                No developers are presently monitoring the burials of this yard.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {followers.map(follower => (
                <div
                  key={follower.uid}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 hover:border-zinc-700 transition-all shadow-md group"
                >
                  {follower.username ? (
                    <Link
                      to={`/user/${follower.username}`}
                      className="flex items-center gap-3 min-w-0"
                    >
                      <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-300 font-serif font-bold text-sm shrink-0">
                        {follower.username.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <span className="font-mono text-sm text-zinc-100 font-bold group-hover:text-red-400 transition-colors truncate block">
                          @{follower.username}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                          Mourner
                        </span>
                      </div>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 text-sm">
                        ?
                      </div>
                      <span className="font-mono text-sm text-zinc-400">Anonymous Soul</span>
                    </div>
                  )}

                  {isOwnProfile && (
                    <div className="shrink-0 pl-2">
                      {confirmFollowerId === follower.uid ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setConfirmFollowerId(null)}
                            className="px-2 py-1 text-[10px] font-mono rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleRemoveFollower(follower.uid)}
                            className="px-2 py-1 text-[10px] font-mono rounded bg-red-900/60 border border-red-700 text-red-200 hover:bg-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleRemoveFollower(follower.uid)}
                          className="px-2.5 py-1 text-[11px] font-mono rounded-lg bg-zinc-900 hover:bg-red-950/40 border border-zinc-800 hover:border-red-800/60 text-zinc-400 hover:text-red-300 transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: Coven Invocations (Requests & Search) */}
      {isOwnProfile && activeSubTab === 'invocations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Search & Add Friend */}
          <div className="bg-zinc-950/85 border border-zinc-800/90 rounded-2xl p-5 sm:p-6 space-y-4">
            <h3 className="text-sm font-serif font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-red-400" />
              <span>Summon a Comrade</span>
            </h3>
            <p className="text-xs font-mono text-zinc-400">
              Lookup a fellow developer by their terminal @handle to forge a coven pact.
            </p>

            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                placeholder="Search username handle..."
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2 text-xs font-mono text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500/60"
              />
              <button
                type="submit"
                disabled={searchLoading || !searchUsername.trim()}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-mono text-xs font-bold transition-all disabled:opacity-50"
              >
                {searchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
              </button>
            </form>

            {searchError && (
              <p className="text-xs font-mono text-red-400 bg-red-950/30 p-2.5 rounded-lg border border-red-900/50">
                {searchError}
              </p>
            )}

            {searchResult && (
              <div className="p-3.5 bg-zinc-900/80 border border-zinc-700/80 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-mono text-sm text-white font-bold block">
                    @{searchResult.username}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">Registered Developer</span>
                </div>

                {requestSentFeedback ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-600/50 text-emerald-300 text-xs font-mono font-bold">
                    <Check className="w-3.5 h-3.5" /> Sent
                  </span>
                ) : (
                  <button
                    onClick={handleSendRequest}
                    className="px-3 py-1.5 rounded-lg bg-[#c53030] hover:bg-[#a82525] text-white text-xs font-mono font-bold transition-all shadow-md"
                  >
                    Dispatch Request
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Pending Invocations */}
          <div className="space-y-6">
            {/* Incoming Requests */}
            <div className="bg-zinc-950/85 border border-zinc-800/90 rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-serif font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>Incoming Invocations</span>
                </h3>
                {incomingRequests.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-mono text-xs font-bold">
                    {incomingRequests.length}
                  </span>
                )}
              </div>

              {incomingRequests.length === 0 ? (
                <p className="text-xs font-mono text-zinc-500 italic">
                  No pending summons from other developers.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {incomingRequests.map(req => (
                    <div
                      key={req.id}
                      className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-2"
                    >
                      <Link
                        to={`/user/${req.fromUsername}`}
                        className="font-mono text-xs font-bold text-zinc-200 hover:text-white underline decoration-red-500/50 truncate"
                      >
                        @{req.fromUsername}
                      </Link>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleRespond(req, true)}
                          className="px-2.5 py-1 rounded-md bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-700/60 text-emerald-200 text-xs font-mono font-bold transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRespond(req, false)}
                          className="px-2.5 py-1 rounded-md bg-red-950/50 hover:bg-red-900/60 border border-red-800/60 text-red-200 text-xs font-mono font-bold transition-colors"
                        >
                          Banish
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Outgoing Requests */}
            <div className="bg-zinc-950/85 border border-zinc-800/90 rounded-2xl p-5 sm:p-6 space-y-4">
              <h3 className="text-sm font-serif font-bold text-white uppercase tracking-wider">
                Outgoing Dispatches ({outgoingRequests.length})
              </h3>

              {outgoingRequests.length === 0 ? (
                <p className="text-xs font-mono text-zinc-500 italic">
                  No pending outgoing requests.
                </p>
              ) : (
                <div className="space-y-2">
                  {outgoingRequests.map(req => (
                    <div
                      key={req.id}
                      className="p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800 text-xs font-mono flex items-center justify-between"
                    >
                      <span className="text-zinc-300">To ID: {req.toUserId.substring(0, 10)}...</span>
                      <span className="text-[10px] text-amber-400 uppercase font-bold">Pending</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
