import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { FriendRequest, Friend } from '../types';
import { findUserByUsername, sendFriendRequest, respondToFriendRequest, removeFriend, removeFollower } from '../services/userService';
import { Button } from './ui/Button';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FriendsManager: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [followers, setFollowers] = useState<{uid: string, username?: string}[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  
  const [searchUsername, setSearchUsername] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<{uid: string, username: string} | null>(null);
  const [searchError, setSearchError] = useState('');

  useEffect(() => {
    if (!user) return;

    // Listen to friends
    const friendsUnsubscribe = onSnapshot(collection(db, 'users', user.uid, 'friends'), (snapshot) => {
      const friendsData = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as Friend));
      setFriends(friendsData);
    });

    // Listen to followers
    const followersUnsubscribe = onSnapshot(collection(db, 'users', user.uid, 'followers'), (snapshot) => {
      const followersData = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as {uid: string, username?: string}));
      setFollowers(followersData);
    });

    // Listen to incoming requests
    const incomingQuery = query(collection(db, 'friend_requests'), where('toUserId', '==', user.uid), where('status', '==', 'pending'));
    const incomingUnsubscribe = onSnapshot(incomingQuery, (snapshot) => {
      const reqs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FriendRequest));
      setIncomingRequests(reqs);
    });

    // Listen to outgoing requests
    const outgoingQuery = query(collection(db, 'friend_requests'), where('fromUserId', '==', user.uid), where('status', '==', 'pending'));
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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchUsername.trim() || !userProfile) return;
    
    if (searchUsername.toLowerCase() === userProfile.username) {
      setSearchError("You can't add yourself.");
      return;
    }

    setSearchLoading(true);
    setSearchError('');
    setSearchResult(null);

    try {
      const result = await findUserByUsername(searchUsername);
      if (result) {
        setSearchResult(result);
      } else {
        setSearchError('User not found.');
      }
    } catch (err) {
      setSearchError('Error searching for user.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSendRequest = async () => {
    if (!searchResult || !user || !userProfile) return;
    try {
      await sendFriendRequest(user.uid, userProfile.username, searchResult.uid);
      setSearchResult(null);
      setSearchUsername('');
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
      console.error(err);
    }
  };

  const [confirmFriendId, setConfirmFriendId] = useState<string | null>(null);
  const [confirmFollowerId, setConfirmFollowerId] = useState<string | null>(null);

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
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold font-sans text-zinc-200">
          Covens & Contacts
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Friends List & Search */}
        <div className="space-y-6">
          <div className="p-6 border border-[#c53030]/20 bg-surface/30 rounded-xl space-y-4">
            <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-400">Add Friend</h3>
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                placeholder="Search username..."
                value={searchUsername}
                onChange={e => setSearchUsername(e.target.value)}
                className="flex-1 bg-black/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-[#c53030]/50 transition-colors"
              />
              <Button type="submit" disabled={searchLoading || !searchUsername.trim()} className="bg-zinc-800 text-white border-zinc-700 hover:border-[#c53030]/50 text-xs px-3">
                {searchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
              </Button>
            </form>
            {searchError && <p className="text-xs text-code-red font-mono">{searchError}</p>}
            {searchResult && (
              <div className="flex items-center justify-between p-3 bg-black/40 border border-zinc-800 rounded-lg">
                <Link to={`/user/${searchResult.username}`} className="text-sm text-zinc-300 font-mono hover:text-white underline decoration-[#c53030]/50 underline-offset-4">
                  @{searchResult.username}
                </Link>
                <Button onClick={handleSendRequest} className="bg-[#c53030]/20 text-[#c53030] border border-[#c53030]/30 hover:bg-[#c53030]/30 h-8 text-xs">
                  Send Request
                </Button>
              </div>
            )}
          </div>

          <div className="p-6 border border-zinc-800/50 bg-surface/30 rounded-xl space-y-4">
            <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-400">Friends ({friends.length})</h3>
            {friends.length === 0 ? (
              <p className="text-xs text-zinc-600 font-mono italic">No friends yet. It's lonely in the graveyard.</p>
            ) : (
              <ul className="space-y-2">
                {friends.map(friend => (
                  <li key={friend.uid} className="flex flex-wrap gap-2 items-center justify-between p-3 bg-black/20 rounded-lg border border-white/5">
                    <Link to={`/user/${friend.username}`} className="text-sm text-zinc-300 font-mono hover:text-white underline decoration-[#c53030]/50 underline-offset-4 break-all">
                      @{friend.username}
                    </Link>
                    <div className="flex gap-2">
                      {confirmFriendId === friend.uid ? (
                        <>
                          <Button onClick={() => setConfirmFriendId(null)} className="h-7 px-2 text-[10px] bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-700">
                            Cancel
                          </Button>
                          <Button onClick={() => handleRemoveFriend(friend.uid)} className="h-7 px-2 text-[10px] bg-code-red/20 text-code-red border border-code-red/30 hover:bg-code-red/30">
                            Confirm
                          </Button>
                        </>
                      ) : (
                        <Button onClick={() => handleRemoveFriend(friend.uid)} className="h-7 px-2 text-[10px] bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:bg-code-red/20 hover:text-code-red hover:border-code-red/30">
                          Remove
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="p-6 border border-zinc-800/50 bg-surface/30 rounded-xl space-y-4">
            <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-400">Followers ({followers.length})</h3>
            {followers.length === 0 ? (
              <p className="text-xs text-zinc-600 font-mono italic">No followers yet.</p>
            ) : (
              <ul className="space-y-2">
                {followers.map(follower => (
                  <li key={follower.uid} className="flex flex-wrap gap-2 items-center justify-between p-3 bg-black/20 rounded-lg border border-white/5">
                    {follower.username ? (
                      <Link to={`/user/${follower.username}`} className="text-sm text-zinc-300 font-mono hover:text-white underline decoration-[#c53030]/50 underline-offset-4 break-all">
                        @{follower.username}
                      </Link>
                    ) : (
                      <span className="text-sm text-zinc-500 font-mono">Unknown user</span>
                    )}
                    <div className="flex gap-2">
                      {confirmFollowerId === follower.uid ? (
                        <>
                          <Button onClick={() => setConfirmFollowerId(null)} className="h-7 px-2 text-[10px] bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-700">
                            Cancel
                          </Button>
                          <Button onClick={() => handleRemoveFollower(follower.uid)} className="h-7 px-2 text-[10px] bg-code-red/20 text-code-red border border-code-red/30 hover:bg-code-red/30">
                            Confirm
                          </Button>
                        </>
                      ) : (
                        <Button onClick={() => handleRemoveFollower(follower.uid)} className="h-7 px-2 text-[10px] bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:bg-code-red/20 hover:text-code-red hover:border-code-red/30">
                          Remove
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right Column: Requests */}
        <div className="space-y-6">
          <div className="p-6 border border-zinc-800/50 bg-surface/30 rounded-xl space-y-4">
            <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-400 flex items-center justify-between">
              Incoming Requests
              {incomingRequests.length > 0 && (
                <span className="bg-[#c53030] text-white text-[10px] px-2 py-0.5 rounded-full">{incomingRequests.length}</span>
              )}
            </h3>
            {incomingRequests.length === 0 ? (
              <p className="text-xs text-zinc-600 font-mono italic">No incoming requests.</p>
            ) : (
              <ul className="space-y-2">
                {incomingRequests.map(req => (
                  <li key={req.id} className="flex flex-wrap gap-2 items-center justify-between p-3 bg-black/20 rounded-lg border border-[#c53030]/20">
                    <Link to={`/user/${req.fromUsername}`} className="text-sm text-zinc-300 font-mono hover:text-white underline decoration-[#c53030]/50 underline-offset-4 break-all">
                      @{req.fromUsername}
                    </Link>
                    <div className="flex gap-2">
                      <Button onClick={() => handleRespond(req, true)} className="h-7 px-2 text-[10px] bg-[#c53030]/20 text-[#c53030] border border-[#c53030]/30 hover:bg-[#c53030]/30">Accept</Button>
                      <Button onClick={() => handleRespond(req, false)} className="h-7 px-2 text-[10px] bg-code-red/20 text-code-red border border-code-red/30 hover:bg-code-red/30">Reject</Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="p-6 border border-zinc-800/50 bg-surface/30 rounded-xl space-y-4">
            <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-400">Outgoing Requests</h3>
            {outgoingRequests.length === 0 ? (
              <p className="text-xs text-zinc-600 font-mono italic">No outgoing requests.</p>
            ) : (
              <ul className="space-y-2">
                {outgoingRequests.map(req => (
                  <li key={req.id} className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/5">
                    <span className="text-sm text-zinc-400 font-mono">To: {req.toUserId}</span>
                    <span className="text-[10px] text-zinc-500 uppercase">Pending</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
