import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "YOUR_API_KEY", // Get this from your Firebase Project Settings
  authDomain: "reenat-trends.firebaseapp.com", 
  projectId: "reenat-trends",
  storageBucket: "reenat-trends.firebasestorage.app",
  messagingSenderId: "742980721056",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "YOUR_APP_ID" // Get this from your Firebase Project Settings
};

// Evaluate configuration status identically on both Server (SSR) and Client (browser)
const isFirebaseConfigured = !!(
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "YOUR_API_KEY"
);

let app;
let auth = null;

// Safe check to prevent initialization issues during Next.js server-side pre-rendering
if (typeof window !== 'undefined') {
  try {
    if (isFirebaseConfigured) {
      app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
      auth = getAuth(app);
    } else {
      console.warn("Firebase credentials are not configured.");
    }
  } catch (error) {
    console.error("Firebase initialization error:", error);
  }
}

export { app, auth, isFirebaseConfigured };
