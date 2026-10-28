import { AVATARS } from "../pixelAvatars";
import { db } from '../firebase';
import { 
  collection, doc, getDoc, getDocs, setDoc, query, where, 
  writeBatch, updateDoc, onSnapshot, arrayUnion, deleteDoc 
} from 'firebase/firestore';
import { User, FriendRequest, Friend, SharedGrave } from '../types';

export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  if (!username) return false;
  const usernameDoc = await getDoc(doc(db, 'usernames', username.toLowerCase()));
  return !usernameDoc.exists();
};

export const createUserProfile = async (uid: string, email: string, username: string, photoURL: string): Promise<void> => {
  const normalizedUsername = username.toLowerCase();
  
  const batch = writeBatch(db);
  
  // Create username reservation
  const usernameRef = doc(db, 'usernames', normalizedUsername);
  batch.set(usernameRef, { uid });
  
  // Create user profile
  const userRef = doc(db, 'users', uid);
  const userData = {
    username: normalizedUsername,
    email,
    photoURL,
    createdAt: new Date().toISOString()
  };
  batch.set(userRef, userData);
  
  await batch.commit();
};

export const getUserProfile = async (uid: string): Promise<User | null> => {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (userDoc.exists()) {
    return { uid, ...userDoc.data() } as User;
  }
  return null;
};

export const findUserByUsername = async (username: string): Promise<{uid: string, username: string} | null> => {
  const normalizedUsername = username.toLowerCase();
  const usernameDoc = await getDoc(doc(db, 'usernames', normalizedUsername));
  
  if (usernameDoc.exists()) {
    return { uid: usernameDoc.data().uid, username: normalizedUsername };
  }
  return null;
};

export const sendFriendRequest = async (fromUserId: string, fromUsername: string, toUserId: string, toUsername?: string): Promise<void> => {
  // Check if they are already friends
  const friendDoc = await getDoc(doc(db, 'users', fromUserId, 'friends', toUserId));
  if (friendDoc.exists()) throw new Error('Already friends');

  // Check if request already exists
  const q = query(collection(db, 'friend_requests'), 
    where('fromUserId', '==', fromUserId),
    where('toUserId', '==', toUserId)
  );
  const existing = await getDocs(q);
  
  const q2 = query(collection(db, 'friend_requests'), 
    where('fromUserId', '==', toUserId),
    where('toUserId', '==', fromUserId)
  );
  const existing2 = await getDocs(q2);

  if (!existing.empty || !existing2.empty) {
    throw new Error('Friend request already exists');
  }

  const newRequestRef = doc(collection(db, 'friend_requests'));
  await setDoc(newRequestRef, {
    fromUserId,
    fromUsername,
    toUserId,
    toUsername: toUsername || '',
    status: 'pending',
    createdAt: new Date().toISOString()
  });
};

export const cancelFriendRequest = async (requestId: string): Promise<void> => {
  await deleteDoc(doc(db, 'friend_requests', requestId));
};

export const respondToFriendRequest = async (requestId: string, fromUserId: string, toUserId: string, toUsername: string, fromUsername: string, accept: boolean): Promise<void> => {
  const batch = writeBatch(db);
  
  const requestRef = doc(db, 'friend_requests', requestId);
  
  if (accept) {
    batch.update(requestRef, { status: 'accepted' });
    
    // Add to 'toUser' friends list
    const toFriendRef = doc(db, 'users', toUserId, 'friends', fromUserId);
    batch.set(toFriendRef, {
      username: fromUsername,
      addedAt: new Date().toISOString()
    });
    
    // Add to 'fromUser' friends list
    const fromFriendRef = doc(db, 'users', fromUserId, 'friends', toUserId);
    batch.set(fromFriendRef, {
      username: toUsername,
      addedAt: new Date().toISOString()
    });
  } else {
    batch.update(requestRef, { status: 'rejected' });
  }
  
  await batch.commit();
};

export const shareGraveWithFriend = async (
  graveId: string,
  graveName: string,
  fromUserId: string,
  fromUsername: string,
  toUserId: string,
  toUsername: string
): Promise<void> => {
  const batch = writeBatch(db);
  const createdAt = new Date().toISOString();
  const safeFromUsername = fromUsername?.trim() || 'Cryptkeeper';
  const safeToUsername = toUsername?.trim() || 'Friend';
  const safeGraveName = graveName?.trim() || 'Tombstone';

  // Recipient copy (received)
  const recipientShareRef = doc(collection(db, 'users', toUserId, 'shared_graves'));
  batch.set(recipientShareRef, {
    graveId,
    graveName: safeGraveName,
    fromUserId,
    fromUsername: safeFromUsername,
    toUserId,
    toUsername: safeToUsername,
    direction: 'received',
    createdAt
  });

  // Sender copy (sent)
  const senderShareRef = doc(collection(db, 'users', fromUserId, 'shared_graves'));
  batch.set(senderShareRef, {
    graveId,
    graveName: safeGraveName,
    fromUserId,
    fromUsername: safeFromUsername,
    toUserId,
    toUsername: safeToUsername,
    direction: 'sent',
    createdAt
  });

  await batch.commit();
};

/**
 * Synchronize any graves shared by the user in older versions of the app where
 * dispatches were only recorded in the recipient's subcollection (users/{recipientUid}/shared_graves).
 * Firestore rules allow the sender to read where resource.data.fromUserId == request.auth.uid.
 */
export const syncPastSentGraves = async (
  currentUserId: string,
  currentUsername: string
): Promise<number> => {
  if (!currentUserId) return 0;

  try {
    // 1. Gather all friend UIDs
    const friendsSnap = await getDocs(collection(db, 'users', currentUserId, 'friends'));
    const friendsMap = new Map<string, string>();
    friendsSnap.docs.forEach(d => {
      friendsMap.set(d.id, d.data().username || 'Friend');
    });

    // Also gather friends from accepted friend requests for full coverage
    try {
      const qFrom = query(
        collection(db, 'friend_requests'),
        where('fromUserId', '==', currentUserId),
        where('status', '==', 'accepted')
      );
      const qTo = query(
        collection(db, 'friend_requests'),
        where('toUserId', '==', currentUserId),
        where('status', '==', 'accepted')
      );
      const [fromSnaps, toSnaps] = await Promise.all([getDocs(qFrom), getDocs(qTo)]);
      fromSnaps.docs.forEach(d => {
        const data = d.data();
        if (data.toUserId && !friendsMap.has(data.toUserId)) {
          friendsMap.set(data.toUserId, data.toUsername || 'Friend');
        }
      });
      toSnaps.docs.forEach(d => {
        const data = d.data();
        if (data.fromUserId && !friendsMap.has(data.fromUserId)) {
          friendsMap.set(data.fromUserId, data.fromUsername || 'Friend');
        }
      });
    } catch {
      // Non-critical, continue with friends
    }

    if (friendsMap.size === 0) return 0;

    // 2. Fetch existing sent dispatches in current user's collection to avoid duplicates
    const userSharesSnap = await getDocs(
      collection(db, 'users', currentUserId, 'shared_graves')
    );
    const existingKeys = new Set<string>();
    userSharesSnap.docs.forEach(d => {
      const data = d.data();
      const isSent = data.direction ? data.direction === 'sent' : data.fromUserId === currentUserId;
      if (isSent && data.graveId) {
        existingKeys.add(`${data.graveId}_${data.toUserId || ''}`);
      }
      existingKeys.add(d.id);
    });

    let syncedCount = 0;

    // 3. For each friend, query documents where fromUserId == currentUserId
    for (const [friendUid, friendUsername] of friendsMap.entries()) {
      try {
        const friendSharesQuery = query(
          collection(db, 'users', friendUid, 'shared_graves'),
          where('fromUserId', '==', currentUserId)
        );
        const friendSharesSnap = await getDocs(friendSharesQuery);

        for (const shareDoc of friendSharesSnap.docs) {
          const shareData = shareDoc.data();
          const deterministicDocId = `sent_${friendUid}_${shareDoc.id}`;
          const graveKey = `${shareData.graveId}_${friendUid}`;

          // Only sync if not already recorded in user's sent dispatches
          if (!existingKeys.has(deterministicDocId) && !existingKeys.has(graveKey)) {
            const userSentDocRef = doc(db, 'users', currentUserId, 'shared_graves', deterministicDocId);
            await setDoc(userSentDocRef, {
              graveId: shareData.graveId,
              graveName: shareData.graveName || 'Tombstone',
              fromUserId: currentUserId,
              fromUsername: shareData.fromUsername || currentUsername || 'Cryptkeeper',
              toUserId: friendUid,
              toUsername: shareData.toUsername || friendUsername,
              direction: 'sent',
              createdAt: shareData.createdAt || new Date().toISOString()
            }, { merge: true });

            existingKeys.add(deterministicDocId);
            existingKeys.add(graveKey);
            syncedCount++;
          }
        }
      } catch (err) {
        console.warn(`Could not sync sent graves from friend ${friendUid}:`, err);
      }
    }

    return syncedCount;
  } catch (error) {
    console.error("Error running sent graves sync:", error);
    return 0;
  }
};

export const followUser = async (currentUserId: string, currentUsername: string, targetUserId: string, targetUsername: string): Promise<void> => {
  const batch = writeBatch(db);
  
  // Add to current user's following list
  const followingRef = doc(db, 'users', currentUserId, 'following', targetUserId);
  batch.set(followingRef, { username: targetUsername, addedAt: new Date().toISOString() });
  
  // Add to target user's followers list
  const followerRef = doc(db, 'users', targetUserId, 'followers', currentUserId);
  batch.set(followerRef, { username: currentUsername, addedAt: new Date().toISOString() });
  
  await batch.commit();
};

export const removeFriend = async (currentUserId: string, targetUserId: string): Promise<void> => {
  const batch = writeBatch(db);
  
  // Remove from current user's friends list
  const currentFriendRef = doc(db, 'users', currentUserId, 'friends', targetUserId);
  batch.delete(currentFriendRef);
  
  // Remove from target user's friends list
  const targetFriendRef = doc(db, 'users', targetUserId, 'friends', currentUserId);
  batch.delete(targetFriendRef);
  
  await batch.commit();
};

export const unfollowUser = async (currentUserId: string, targetUserId: string): Promise<void> => {
  const batch = writeBatch(db);
  
  const followingRef = doc(db, 'users', currentUserId, 'following', targetUserId);
  batch.delete(followingRef);
  
  const followerRef = doc(db, 'users', targetUserId, 'followers', currentUserId);
  batch.delete(followerRef);
  
  await batch.commit();
};

export const removeFollower = async (currentUserId: string, followerId: string): Promise<void> => {
  const batch = writeBatch(db);
  
  const followerRef = doc(db, 'users', currentUserId, 'followers', followerId);
  batch.delete(followerRef);
  
  const followingRef = doc(db, 'users', followerId, 'following', currentUserId);
  batch.delete(followingRef);
  
  await batch.commit();
};
