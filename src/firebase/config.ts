import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyApiKeyForPortfolioMock123",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "shoron-portfolio.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "shoron-portfolio",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "shoron-portfolio.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1234567890:web:abcdef123456"
};

export function getSavedFirebaseConfig() {
  const saved = localStorage.getItem('shoron_firebase_config');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return firebaseConfig;
    }
  }
  return firebaseConfig;
}

const activeConfig = getSavedFirebaseConfig();
const app = !getApps().length ? initializeApp(activeConfig) : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
