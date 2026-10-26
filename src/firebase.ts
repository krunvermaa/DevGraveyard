import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GithubAuthProvider, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const rawApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const rawAuthDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
const rawProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const rawStorageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
const rawMessagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
const rawAppId = import.meta.env.VITE_FIREBASE_APP_ID;
const databaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID;

// Validate whether real Firebase configuration credentials have been supplied
export const isFirebaseConfigured = Boolean(
  rawApiKey &&
  rawApiKey.trim() !== '' &&
  rawApiKey !== 'YOUR_FIREBASE_API_KEY' &&
  rawProjectId &&
  rawProjectId.trim() !== '' &&
  rawProjectId !== 'YOUR_FIREBASE_PROJECT_ID'
);

if (!isFirebaseConfigured) {
  console.warn(
    '[DevGraveyard] Firebase credentials are not yet configured in .env.local. ' +
    'Please copy .env.example to .env.local and populate your Firebase project credentials.'
  );
}

// Fallback configuration prevents getAuth() from throwing an unhandled runtime error on initialization
const firebaseConfig = {
  apiKey: isFirebaseConfigured ? rawApiKey : 'placeholder-api-key',
  authDomain: isFirebaseConfigured ? (rawAuthDomain || '') : 'placeholder.firebaseapp.com',
  projectId: isFirebaseConfigured ? rawProjectId : 'placeholder-project',
  storageBucket: isFirebaseConfigured ? (rawStorageBucket || '') : 'placeholder.appspot.com',
  messagingSenderId: isFirebaseConfigured ? (rawMessagingSenderId || '') : '123456789012',
  appId: isFirebaseConfigured ? (rawAppId || '') : '1:123456789012:web:placeholderappid',
};

// Ensure single initialization
export const app = getApps().length > 0 
  ? getApp() 
  : initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Use custom database ID only if explicitly provided, else use default Firestore database
export const db = (databaseId && isFirebaseConfigured)
  ? getFirestore(app, databaseId) 
  : getFirestore(app);

export { GithubAuthProvider, GoogleAuthProvider, signInWithPopup, signOut };

export const githubProvider = new GithubAuthProvider();
export const googleProvider = new GoogleAuthProvider();

// Request standard email and profile scopes for seamless Google authentication
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const loginWithGithub = async () => {
  if (!isFirebaseConfigured) {
    throw new Error(
      'Firebase credentials are not configured yet. Please supply your Firebase project credentials in .env.local'
    );
  }
  return signInWithPopup(auth, githubProvider);
};

export const loginWithGoogle = async () => {
  if (!isFirebaseConfigured) {
    throw new Error(
      'Firebase credentials are not configured yet. Please supply your Firebase project credentials in .env.local'
    );
  }
  return signInWithPopup(auth, googleProvider);
};

export const logout = () => signOut(auth);
