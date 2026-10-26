import { Grave, GraveFormData, Eulogy } from '../types';
import { db } from '../firebase';
import { collection, getDoc, getDocs, addDoc, query, orderBy, where, doc, updateDoc, increment, arrayUnion, deleteDoc, arrayRemove } from 'firebase/firestore';

const GRAVES_COLLECTION = 'graves';

export const getGrave = async (graveId: string): Promise<Grave | null> => {
  try {
    const docRef = doc(db, GRAVES_COLLECTION, graveId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Grave;
    }
    return null;
  } catch (error) {
    console.error("Error fetching grave:", error);
    return null;
  }
};

export const getGraves = async (): Promise<Grave[]> => {
  try {
    const q = query(collection(db, GRAVES_COLLECTION), orderBy('created_at', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Grave));
  } catch (error) {
    console.error("Error fetching graves:", error);
    return [];
  }
};

export const getUserGraves = async (userId: string): Promise<Grave[]> => {
  try {
    const q = query(
      collection(db, GRAVES_COLLECTION),
      where('user_id', '==', userId)
    );
    const snapshot = await getDocs(q);
    // Sort in memory since we might need a composite index for where + orderBy
    const graves = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Grave));
    return graves.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } catch (error) {
    console.error("Error fetching user graves:", error);
    return [];
  }
};

export const submitGrave = async (data: GraveFormData, userId?: string, userName?: string, userAvatar?: string): Promise<Grave> => {
  const newGraveData = {
    ...data,
    created_at: new Date().toISOString(),
    ...(userId && { user_id: userId }),
    ...(userName && !data.is_anonymous && { user_name: userName }),
    ...(userAvatar && !data.is_anonymous && { user_avatar: userAvatar }),
  };

  const docRef = await addDoc(collection(db, GRAVES_COLLECTION), newGraveData);
  
  return {
    id: docRef.id,
    ...newGraveData
  } as Grave;
};

export const pressF = async (graveId: string, userName?: string): Promise<void> => {
  const graveRef = doc(db, GRAVES_COLLECTION, graveId);
  await updateDoc(graveRef, {
    respects: increment(1),
    ...(userName && { rips: arrayUnion(userName) })
  });
};

export const unpressF = async (graveId: string, userName: string): Promise<void> => {
  const graveRef = doc(db, GRAVES_COLLECTION, graveId);
  await updateDoc(graveRef, {
    respects: increment(-1),
    rips: arrayRemove(userName)
  });
};

export const dropEulogy = async (graveId: string, text: string, userName: string, userId?: string): Promise<Eulogy> => {
  const graveRef = doc(db, GRAVES_COLLECTION, graveId);
  const newEulogy: Eulogy = {
    id: crypto.randomUUID(),
    text,
    user_name: userName,
    ...(userId && { user_id: userId }),
    created_at: new Date().toISOString()
  };
  
  await updateDoc(graveRef, {
    eulogies: arrayUnion(newEulogy)
  });
  
  return newEulogy;
};

export const deleteEulogy = async (graveId: string, eulogy: Eulogy): Promise<void> => {
  const graveRef = doc(db, GRAVES_COLLECTION, graveId);
  const graveSnap = await getDoc(graveRef);
  if (graveSnap.exists()) {
    const data = graveSnap.data();
    const currentEulogies = data.eulogies || [];
    const updatedEulogies = currentEulogies.filter((e: any) => {
      if (e.id && eulogy.id) return e.id !== eulogy.id;
      return e.created_at !== eulogy.created_at || e.text !== eulogy.text;
    });
    await updateDoc(graveRef, {
      eulogies: updatedEulogies
    });
  }
};

export const deleteGrave = async (graveId: string): Promise<void> => {
  const graveRef = doc(db, GRAVES_COLLECTION, graveId);
  await deleteDoc(graveRef);
};