import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

const firebaseConfig = {
  apiKey: apiKey,
  authDomain: "reenat-trends.firebaseapp.com",
  projectId: "reenat-trends",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

let app = null;
let auth = null;
let googleProvider = null;
const isFirebaseConfigured = Boolean(apiKey && apiKey.length > 5 && apiKey !== 'undefined');

try {
  if (isFirebaseConfigured) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
  }
} catch (err) {
  console.warn("Firebase initialization skipped or failed:", err.message);
}

export { auth, googleProvider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber, isFirebaseConfigured };
