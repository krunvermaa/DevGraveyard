import { db, auth } from '../firebase';
import { 
  collection, doc, getDocs, query, where, 
  writeBatch, getDoc, deleteDoc 
} from 'firebase/firestore';
import { deleteUser, signOut } from 'firebase/auth';

export const updateUsernameEverywhere = async (
  userId: string, 
  oldUsername: string, 
  newUsername: string
): Promise<void> => {
  const batch = writeBatch(db);

  // Update in graves where they are the owner
  const gravesQuery = query(collection(db, 'graves'), where('user_id', '==', userId));
  const gravesSnap = await getDocs(gravesQuery);
  gravesSnap.forEach((docSnap) => {
    batch.update(docSnap.ref, { user_name: newUsername });
  });

  // Update in friend_requests (where user is fromUser)
  const reqsFromQuery = query(collection(db, 'friend_requests'), where('fromUserId', '==', userId));
  const reqsFromSnap = await getDocs(reqsFromQuery);
  reqsFromSnap.forEach((docSnap) => {
    batch.update(docSnap.ref, { fromUsername: newUsername });
  });

  // Update in friend_requests (where user is toUser)
  const reqsToQuery = query(collection(db, 'friend_requests'), where('toUserId', '==', userId));
  const reqsToSnap = await getDocs(reqsToQuery);
  reqsToSnap.forEach((docSnap) => {
    batch.update(docSnap.ref, { toUsername: newUsername });
  });

  // Update in friends lists
  const myFriendsSnap = await getDocs(collection(db, 'users', userId, 'friends'));
  myFriendsSnap.forEach((friendDoc) => {
    const friendId = friendDoc.id;
    const friendSubdocRef = doc(db, 'users', friendId, 'friends', userId);
    batch.update(friendSubdocRef, { username: newUsername });
  });

  // Update in friends' shared_graves where this user was the sender
  for (const friendDoc of myFriendsSnap.docs) {
    const friendId = friendDoc.id;
    const sharedWithFriendQuery = query(collection(db, 'users', friendId, 'shared_graves'), where('fromUserId', '==', userId));
    const sharedWithFriendSnap = await getDocs(sharedWithFriendQuery);
    sharedWithFriendSnap.forEach((docSnap) => {
      batch.update(docSnap.ref, { fromUsername: newUsername });
    });
  }

  // Read all graves to update rips and eulogies (expensive but complete)
  const allGravesSnap = await getDocs(collection(db, 'graves'));
  allGravesSnap.forEach((docSnap) => {
    const graveData = docSnap.data();
    let needsUpdate = false;
    const updates: any = {};

    if (graveData.rips && graveData.rips.includes(oldUsername)) {
      updates.rips = graveData.rips.map((r: string) => r === oldUsername ? newUsername : r);
      needsUpdate = true;
    }

    if (graveData.eulogies) {
      let eulogiesChanged = false;
      const newEulogies = graveData.eulogies.map((e: any) => {
        if (e.user_id === userId) {
          eulogiesChanged = true;
          return { ...e, user_name: newUsername };
        }
        return e;
      });
      if (eulogiesChanged) {
        updates.eulogies = newEulogies;
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      batch.update(docSnap.ref, updates);
    }
  });

  await batch.commit();
};

export const deleteAccountCompletely = async (userId: string, username?: string): Promise<void> => {
  // We need to delete:
  // 1. All their graves
  // 2. All friend requests sent/received by them
  // 3. Their username reservation
  // 4. Their user doc and subcollections (friends, followers, following, shared_graves)
  // 5. Their presence in other people's friends/followers/following lists. (Complex, we can try)
  // 6. Auth user

  const batch = writeBatch(db);

  // 1. Delete graves
  const gravesQuery = query(collection(db, 'graves'), where('user_id', '==', userId));
  const gravesSnap = await getDocs(gravesQuery);
  gravesSnap.forEach((docSnap) => {
    batch.delete(docSnap.ref);
  });

  // 2. Delete friend requests
  const reqsFromQuery = query(collection(db, 'friend_requests'), where('fromUserId', '==', userId));
  const reqsFromSnap = await getDocs(reqsFromQuery);
  reqsFromSnap.forEach((docSnap) => {
    batch.delete(docSnap.ref);
  });

  const reqsToQuery = query(collection(db, 'friend_requests'), where('toUserId', '==', userId));
  const reqsToSnap = await getDocs(reqsToQuery);
  reqsToSnap.forEach((docSnap) => {
    batch.delete(docSnap.ref);
  });

  // 3. Delete username
  if (username) {
    const usernameRef = doc(db, 'usernames', username.toLowerCase());
    batch.delete(usernameRef);
  }

  // 4. Delete user doc (we can't easily delete all subcollections in a batch without reading them first)
  const subcollections = ['friends', 'followers', 'following', 'shared_graves'];
  for (const sub of subcollections) {
    const subSnap = await getDocs(collection(db, 'users', userId, sub));
    subSnap.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
  }
  
  const userRef = doc(db, 'users', userId);
  batch.delete(userRef);

  // 5. Remove from other people's friends lists
  const myFriendsSnap = await getDocs(collection(db, 'users', userId, 'friends'));
  myFriendsSnap.forEach((friendDoc) => {
    const friendId = friendDoc.id;
    const friendSubdocRef = doc(db, 'users', friendId, 'friends', userId);
    batch.delete(friendSubdocRef);
  });

  // 6. Delete from friends' shared_graves where this user was the sender
  for (const friendDoc of myFriendsSnap.docs) {
    const friendId = friendDoc.id;
    const sharedWithFriendQuery = query(collection(db, 'users', friendId, 'shared_graves'), where('fromUserId', '==', userId));
    const sharedWithFriendSnap = await getDocs(sharedWithFriendQuery);
    sharedWithFriendSnap.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
  }

  // 7. Read all graves to remove rips and eulogies
  const allGravesSnap = await getDocs(collection(db, 'graves'));
  allGravesSnap.forEach((docSnap) => {
    const graveData = docSnap.data();
    let needsUpdate = false;
    const updates: any = {};

    if (username && graveData.rips && graveData.rips.includes(username)) {
      updates.rips = graveData.rips.filter((r: string) => r !== username);
      updates.respects = Math.max(0, (graveData.respects || 1) - 1); // Decrement respect counter
      needsUpdate = true;
    }

    if (graveData.eulogies && graveData.eulogies.some((e: any) => e.user_id === userId)) {
      updates.eulogies = graveData.eulogies.filter((e: any) => e.user_id !== userId);
      needsUpdate = true;
    }

    if (needsUpdate) {
      batch.update(docSnap.ref, updates);
    }
  });

  await batch.commit();

  // 6. Delete Auth User
  if (auth.currentUser) {
    await deleteUser(auth.currentUser);
  }
};
