import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GithubAuthProvider, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

const databaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID;

// Ensure single initialization
export const app = getApps().length > 0 
  ? getApp() 
  : initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Use custom database ID only if explicitly provided, else use default Firestore database
export const db = databaseId 
  ? getFirestore(app, databaseId) 
  : getFirestore(app);

export const githubProvider = new GithubAuthProvider();
export const googleProvider = new GoogleAuthProvider();

export const loginWithGithub = () => signInWithPopup(auth, githubProvider);
export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = () => signOut(auth);
