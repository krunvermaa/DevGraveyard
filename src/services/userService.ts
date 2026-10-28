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

  // Recipient copy (received)
  const recipientShareRef = doc(collection(db, 'users', toUserId, 'shared_graves'));
  batch.set(recipientShareRef, {
    graveId,
    graveName,
    fromUserId,
    fromUsername,
    toUserId,
    toUsername,
    direction: 'received',
    createdAt
  });

  // Sender copy (sent)
  const senderShareRef = doc(collection(db, 'users', fromUserId, 'shared_graves'));
  batch.set(senderShareRef, {
    graveId,
    graveName,
    fromUserId,
    fromUsername,
    toUserId,
    toUsername,
    direction: 'sent',
    createdAt
  });

  await batch.commit();
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
