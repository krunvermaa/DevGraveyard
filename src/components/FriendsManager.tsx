import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { FriendRequest, Friend } from '../types';
import { 
  findUserByUsername, 
  sendFriendRequest, 
  respondToFriendRequest, 
  removeFriend, 
  removeFollower,
  cancelFriendRequest,
  getUserProfile 
} from '../services/userService';
import { Button } from './ui/Button';
import { 
  Loader2, 
  UserPlus, 
  Users, 
  UserCheck, 
  Inbox, 
  Send, 
  Share2, 
  Copy, 
  Check 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const FriendsManager: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [followers, setFollowers] = useState<{ uid: string; username?: string }[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  
  const [searchUsername, setSearchUsername] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<{ uid: string; username: string } | null>(null);
  const [searchError, setSearchError] = useState('');
  const [requestSuccess, setRequestSuccess] = useState('');

  const [confirmFriendId, setConfirmFriendId] = useState<string | null>(null);
  const [confirmFollowerId, setConfirmFollowerId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Cached profile data (avatars and usernames for outgoing/followers)
  const [profileCache, setProfileCache] = useState<Record<string, { username?: string; photoURL?: string }>>({});

  useEffect(() => {
    if (!user) return;

    // Listen to friends
    const friendsUnsubscribe = onSnapshot(collection(db, 'users', user.uid, 'friends'), (snapshot) => {
      const friendsData = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as Friend));
      setFriends(friendsData);
    });

    // Listen to followers
    const followersUnsubscribe = onSnapshot(collection(db, 'users', user.uid, 'followers'), (snapshot) => {
      const followersData = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as { uid: string; username?: string }));
      setFollowers(followersData);
    });

    // Listen to incoming requests
    const incomingQuery = query(
      collection(db, 'friend_requests'), 
      where('toUserId', '==', user.uid), 
      where('status', '==', 'pending')
    );
    const incomingUnsubscribe = onSnapshot(incomingQuery, (snapshot) => {
      const reqs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FriendRequest));
      setIncomingRequests(reqs);
    });

    // Listen to outgoing requests
    const outgoingQuery = query(
      collection(db, 'friend_requests'), 
      where('fromUserId', '==', user.uid), 
      where('status', '==', 'pending')
    );
    const outgoingUnsubscribe = onSnapshot(outgoingQuery, (snapshot) => {
      const reqs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FriendRequest));
      setOutgoingRequests(reqs);
    });

    return () => {
      friendsUnsubscribe();
      followersUnsubscribe();
      incomingUnsubscribe();
      outgoingUnsubscribe();
    };
  }, [user]);

  // Fetch missing profile data (photoURL and username) for users appearing in lists
  useEffect(() => {
    const uidsToFetch = new Set<string>();

    friends.forEach(f => {
      if (!profileCache[f.uid]) uidsToFetch.add(f.uid);
    });
    followers.forEach(f => {
      if (!profileCache[f.uid]) uidsToFetch.add(f.uid);
    });
    incomingRequests.forEach(r => {
      if (!profileCache[r.fromUserId]) uidsToFetch.add(r.fromUserId);
    });
    outgoingRequests.forEach(r => {
      if (!profileCache[r.toUserId]) uidsToFetch.add(r.toUserId);
    });

    if (uidsToFetch.size === 0) return;

    let cancelled = false;

    Promise.all(
      Array.from(uidsToFetch).map(async (uid) => {
        try {
          const profile = await getUserProfile(uid);
          return { uid, profile };
        } catch {
          return { uid, profile: null };
        }
      })
    ).then((results) => {
      if (cancelled) return;
      setProfileCache((prev) => {
        const next = { ...prev };
        results.forEach(({ uid, profile }) => {
          if (profile) {
            next[uid] = { username: profile.username, photoURL: profile.photoURL };
          } else {
            next[uid] = {};
          }
        });
        return next;
      });
    });

    return () => {
      cancelled = true;
    };
  }, [friends, followers, incomingRequests, outgoingRequests, profileCache]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchUsername.trim() || !userProfile) return;
    
    if (searchUsername.toLowerCase() === userProfile.username.toLowerCase()) {
      setSearchError("You cannot summon yourself.");
      return;
    }

    setSearchLoading(true);
    setSearchError('');
    setRequestSuccess('');
    setSearchResult(null);

    try {
      const result = await findUserByUsername(searchUsername);
      if (result) {
        setSearchResult(result);
      } else {
        setSearchError('No developer found with this username.');
      }
    } catch {
      setSearchError('Error searching for user.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSendRequest = async () => {
    if (!searchResult || !user || !userProfile) return;
    try {
      await sendFriendRequest(user.uid, userProfile.username, searchResult.uid, searchResult.username);
      setRequestSuccess(`Summons dispatched to @${searchResult.username}`);
      setSearchResult(null);
      setSearchUsername('');
      setTimeout(() => setRequestSuccess(''), 4000);
    } catch (err: any) {
      setSearchError(err.message || 'Failed to send request.');
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
      console.error('Error responding to request', err);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      await cancelFriendRequest(requestId);
    } catch (err) {
      console.error('Failed to cancel friend request', err);
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!user) return;
    if (confirmFriendId === friendId) {
      try {
        await removeFriend(user.uid, friendId);
        setConfirmFriendId(null);
      } catch (err) {
        console.error('Failed to remove friend', err);
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
        console.error('Failed to remove follower', err);
      }
    } else {
      setConfirmFollowerId(followerId);
    }
  };

  const profileUrl = typeof window !== 'undefined' && userProfile?.username 
    ? `${window.location.origin}/#/user/${userProfile.username}` 
    : '';

  const handleCopyLink = () => {
    if (!profileUrl) return;
    navigator.clipboard.writeText(profileUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }).catch(err => {
      console.error('Failed to copy', err);
    });
  };

  const renderAvatar = (uid: string, username?: string, photoURL?: string) => {
    const cachedPhoto = photoURL || profileCache[uid]?.photoURL;
    if (cachedPhoto) {
      return (
        <img
          src={cachedPhoto}
          alt={username || 'User'}
          className="w-9 h-9 rounded-full object-cover border border-zinc-700 bg-zinc-950 shrink-0"
        />
      );
    }
    const initial = username ? username.charAt(0).toUpperCase() : '?';
    return (
      <div className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 group-hover:border-red-600/50 transition-colors">
        <span className="text-xs font-serif text-red-400 font-bold uppercase">
          {initial}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h2 className="text-xl md:text-2xl font-bold font-sans text-zinc-200 flex items-center gap-2">
          <span>Covens & Contacts</span>
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent" />
      </div>

      {/* 2-Column Balanced Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* Column 1 (Left): Add Comrade, Friends, Followers */}
        <div className="flex flex-col gap-6">
          
          {/* Card 1: Add Comrade Search Box */}
          <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-5 sm:p-6 backdrop-blur-md shadow-xl space-y-4 relative overflow-hidden group hover:border-zinc-700/80 transition-all">
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-red-500" />
              <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-300 font-semibold">
                Summon Comrade
              </h3>
            </div>
            
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                placeholder="Search by crypt @username..."
                value={searchUsername}
                onChange={e => {
                  setSearchUsername(e.target.value);
                  if (searchError) setSearchError('');
                  if (requestSuccess) setRequestSuccess('');
                }}
                className="flex-1 bg-black/60 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-red-600/50 transition-colors"
              />
              <Button 
                type="submit" 
                variant="secondary"
                disabled={searchLoading || !searchUsername.trim()} 
                className="bg-zinc-800 text-zinc-100 hover:text-white border-zinc-700 hover:border-red-600/50 hover:bg-zinc-700 font-mono text-xs px-4 h-10 rounded-xl shadow-sm transition-all shrink-0"
              >
                {searchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
              </Button>
            </form>

            {searchError && (
              <p className="text-xs text-code-red font-mono animate-fade-in">{searchError}</p>
            )}

            {requestSuccess && (
              <p className="text-xs text-code-green font-mono animate-fade-in flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>{requestSuccess}</span>
              </p>
            )}

            {searchResult && (
              <div className="flex items-center justify-between p-3.5 bg-black/50 border border-zinc-800/90 rounded-xl animate-fade-in">
                <div className="flex items-center gap-3 min-w-0 mr-3">
                  {renderAvatar(searchResult.uid, searchResult.username)}
                  <Link 
                    to={`/user/${searchResult.username}`} 
                    className="text-sm text-zinc-200 font-mono hover:text-white underline decoration-red-500/50 underline-offset-4 truncate"
                  >
                    @{searchResult.username}
                  </Link>
                </div>
                <Button 
                  onClick={handleSendRequest} 
                  variant="secondary"
                  className="bg-red-600/20 text-red-200 hover:text-white border border-red-500/40 hover:border-red-500 hover:bg-red-600 h-8 text-xs font-mono px-3.5 rounded-lg transition-all shadow-sm shrink-0"
                >
                  Send Request
                </Button>
              </div>
            )}
          </div>

          {/* Card 2: Friends List (Comrades) */}
          <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-5 sm:p-6 backdrop-blur-md shadow-xl space-y-4 relative overflow-hidden group hover:border-zinc-700/80 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-red-500" />
                <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-300 font-semibold">
                  Comrades
                </h3>
              </div>
              <span className="text-[11px] font-mono text-zinc-500 bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 rounded-full">
                {friends.length}
              </span>
            </div>

            {friends.length === 0 ? (
              <p className="text-xs text-zinc-500 font-mono italic py-2">
                No comrades yet. It's quiet in the graveyard.
              </p>
            ) : (
              <ul className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {friends.map(friend => (
                  <li 
                    key={friend.uid} 
                    className="flex items-center justify-between p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/80 hover:border-zinc-700/80 transition-colors group/item"
                  >
                    <div className="flex items-center gap-3 min-w-0 mr-3">
                      {renderAvatar(friend.uid, friend.username)}
                      <Link 
                        to={`/user/${friend.username}`} 
                        className="text-sm text-zinc-200 font-mono hover:text-white underline decoration-red-500/50 underline-offset-4 truncate"
                      >
                        @{friend.username}
                      </Link>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {confirmFriendId === friend.uid ? (
                        <>
                          <Button 
                            onClick={() => setConfirmFriendId(null)} 
                            variant="secondary"
                            className="h-7 px-2.5 text-[11px] font-mono bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 hover:bg-zinc-700 rounded-lg"
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={() => handleRemoveFriend(friend.uid)} 
                            variant="danger"
                            className="h-7 px-2.5 text-[11px] font-mono bg-red-600 text-white border border-red-500 hover:bg-red-700 rounded-lg shadow-sm"
                          >
                            Confirm
                          </Button>
                        </>
                      ) : (
                        <Button 
                          onClick={() => handleRemoveFriend(friend.uid)} 
                          variant="secondary"
                          className="h-7 px-2.5 text-[11px] font-mono bg-zinc-900 text-zinc-400 hover:text-red-400 border border-zinc-800 hover:border-red-500/40 hover:bg-red-950/20 rounded-lg transition-colors"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Card 3: Followers List */}
          <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-5 sm:p-6 backdrop-blur-md shadow-xl space-y-4 relative overflow-hidden group hover:border-zinc-700/80 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-red-500" />
                <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-300 font-semibold">
                  Followers
                </h3>
              </div>
              <span className="text-[11px] font-mono text-zinc-500 bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 rounded-full">
                {followers.length}
              </span>
            </div>

            {followers.length === 0 ? (
              <p className="text-xs text-zinc-500 font-mono italic py-2">
                No mourners watching over your yard yet.
              </p>
            ) : (
              <ul className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {followers.map(follower => {
                  const followerUsername = follower.username || profileCache[follower.uid]?.username;
                  return (
                    <li 
                      key={follower.uid} 
                      className="flex items-center justify-between p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/80 hover:border-zinc-700/80 transition-colors group/item"
                    >
                      <div className="flex items-center gap-3 min-w-0 mr-3">
                        {renderAvatar(follower.uid, followerUsername)}
                        {followerUsername ? (
                          <Link 
                            to={`/user/${followerUsername}`} 
                            className="text-sm text-zinc-200 font-mono hover:text-white underline decoration-red-500/50 underline-offset-4 truncate"
                          >
                            @{followerUsername}
                          </Link>
                        ) : (
                          <span className="text-sm text-zinc-500 font-mono truncate">Unknown mourner</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {confirmFollowerId === follower.uid ? (
                          <>
                            <Button 
                              onClick={() => setConfirmFollowerId(null)} 
                              variant="secondary"
                              className="h-7 px-2.5 text-[11px] font-mono bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 hover:bg-zinc-700 rounded-lg"
                            >
                              Cancel
                            </Button>
                            <Button 
                              onClick={() => handleRemoveFollower(follower.uid)} 
                              variant="danger"
                              className="h-7 px-2.5 text-[11px] font-mono bg-red-600 text-white border border-red-500 hover:bg-red-700 rounded-lg shadow-sm"
                            >
                              Confirm
                            </Button>
                          </>
                        ) : (
                          <Button 
                            onClick={() => handleRemoveFollower(follower.uid)} 
                            variant="secondary"
                            className="h-7 px-2.5 text-[11px] font-mono bg-zinc-900 text-zinc-400 hover:text-red-400 border border-zinc-800 hover:border-red-500/40 hover:bg-red-950/20 rounded-lg transition-colors"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Column 2 (Right): Incoming Requests, Outgoing Requests, Crypt Invite & Guidelines */}
        <div className="flex flex-col gap-6">
          
          {/* Card 1: Incoming Requests */}
          <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-5 sm:p-6 backdrop-blur-md shadow-xl space-y-4 relative overflow-hidden group hover:border-zinc-700/80 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Inbox className="w-4 h-4 text-red-500" />
                <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-300 font-semibold">
                  Incoming Requests
                </h3>
              </div>
              {incomingRequests.length > 0 && (
                <span className="bg-red-600 text-white font-mono font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow-sm animate-pulse">
                  {incomingRequests.length}
                </span>
              )}
            </div>

            {incomingRequests.length === 0 ? (
              <p className="text-xs text-zinc-500 font-mono italic py-2">
                No incoming requests awaiting your answer.
              </p>
            ) : (
              <ul className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {incomingRequests.map(req => (
                  <li 
                    key={req.id} 
                    className="flex flex-wrap sm:flex-nowrap items-center justify-between p-3 bg-zinc-900/60 rounded-xl border border-red-950/40 hover:border-red-800/50 transition-colors gap-2"
                  >
                    <div className="flex items-center gap-3 min-w-0 mr-2">
                      {renderAvatar(req.fromUserId, req.fromUsername)}
                      <Link 
                        to={`/user/${req.fromUsername}`} 
                        className="text-sm text-zinc-200 font-mono hover:text-white underline decoration-red-500/50 underline-offset-4 truncate"
                      >
                        @{req.fromUsername}
                      </Link>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button 
                        onClick={() => handleRespond(req, true)} 
                        variant="secondary"
                        className="h-7 px-3 text-[11px] font-mono bg-red-600 text-white font-semibold border border-red-500 hover:bg-red-700 rounded-lg shadow-sm"
                      >
                        Accept
                      </Button>
                      <Button 
                        onClick={() => handleRespond(req, false)} 
                        variant="secondary"
                        className="h-7 px-3 text-[11px] font-mono bg-zinc-800 text-zinc-300 hover:text-red-300 border border-zinc-700 hover:border-red-500/40 hover:bg-zinc-700 rounded-lg transition-colors"
                      >
                        Reject
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Card 2: Outgoing Requests */}
          <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-5 sm:p-6 backdrop-blur-md shadow-xl space-y-4 relative overflow-hidden group hover:border-zinc-700/80 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-red-500" />
                <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-300 font-semibold">
                  Outgoing Requests
                </h3>
              </div>
              <span className="text-[11px] font-mono text-zinc-500 bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 rounded-full">
                {outgoingRequests.length}
              </span>
            </div>

            {outgoingRequests.length === 0 ? (
              <p className="text-xs text-zinc-500 font-mono italic py-2">
                No outgoing requests pending response.
              </p>
            ) : (
              <ul className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {outgoingRequests.map(req => {
                  const targetUsername = req.toUsername || profileCache[req.toUserId]?.username;
                  return (
                    <li 
                      key={req.id} 
                      className="flex flex-wrap sm:flex-nowrap items-center justify-between p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/80 gap-2"
                    >
                      <div className="flex items-center gap-3 min-w-0 mr-2">
                        {renderAvatar(req.toUserId, targetUsername)}
                        {targetUsername ? (
                          <Link 
                            to={`/user/${targetUsername}`} 
                            className="text-sm text-zinc-200 font-mono hover:text-white underline decoration-red-500/50 underline-offset-4 truncate"
                          >
                            @{targetUsername}
                          </Link>
                        ) : (
                          <span className="text-xs text-zinc-500 font-mono truncate">
                            To: {req.toUserId.slice(0, 8)}...
                          </span>
                        )}
                        <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded shrink-0">
                          Pending
                        </span>
                      </div>

                      <Button 
                        onClick={() => handleCancelRequest(req.id)} 
                        variant="secondary"
                        className="h-7 px-2.5 text-[11px] font-mono bg-zinc-900 text-zinc-400 hover:text-red-400 border border-zinc-800 hover:border-red-500/40 hover:bg-red-950/20 rounded-lg transition-colors shrink-0"
                      >
                        Cancel
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Card 3: Crypt Invite & Guidelines (Elegantly eliminates white space) */}
          <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-5 sm:p-6 backdrop-blur-md shadow-xl space-y-4 relative overflow-hidden group hover:border-zinc-700/80 transition-all flex-1 flex flex-col justify-between">
            {/* Subtle corner ambient glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-2xl pointer-events-none group-hover:bg-red-600/10 transition-all" />

            <div className="space-y-3.5">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-red-500" />
                <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-300 font-semibold">
                  Invite Friends to Your Crypt
                </h3>
              </div>

              <p className="text-xs text-zinc-400 font-mono leading-relaxed">
                Share your personal graveyard link with fellow developers so they can mourn your projects, leave tributes, and connect as comrades.
              </p>

              {/* 1-Click Profile Link Copy Box */}
              {profileUrl ? (
                <div className="flex items-center gap-2 bg-black/60 border border-zinc-800 rounded-xl p-1.5 pl-3 focus-within:border-red-600/50 transition-colors">
                  <span className="text-xs font-mono text-zinc-300 truncate flex-1 select-all">
                    {profileUrl}
                  </span>
                  <Button
                    onClick={handleCopyLink}
                    variant="secondary"
                    className="h-8 px-3 text-xs font-mono bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 hover:border-red-500/50 flex items-center gap-1.5 shrink-0 transition-colors rounded-lg"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-code-green" />
                        <span className="text-code-green">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Copy</span>
                      </>
                    )}
                  </Button>
                </div>
              ) : null}
            </div>

            {/* Crypt Comrade Guidelines */}
            <div className="pt-3 border-t border-zinc-800/70 space-y-2 text-[11px] font-mono text-zinc-400">
              <div className="flex items-start gap-2">
                <span className="text-red-500 select-none text-xs">✟</span>
                <span>
                  <strong className="text-zinc-200">Comrades</strong> can share graves directly and write eulogies on your stones.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-zinc-500 select-none text-xs">👁</span>
                <span>
                  <strong className="text-zinc-200">Mourners</strong> follow your yard to read wisdom from abandoned repos.
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
