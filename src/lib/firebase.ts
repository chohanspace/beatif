
// This is a placeholder for your Firebase configuration.
// In a real application, you would populate this with your own Firebase project credentials.
// Make sure to install the 'firebase' package: npm install firebase

import { initializeApp, getApps, getApp } from 'firebase/app';
import type { Playlist } from './types';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
function getFirebaseApp() {
    if (!firebaseConfig.projectId || firebaseConfig.projectId === 'dummy-project') {
        console.log("Firebase config is using dummy values. Skipping Firebase operations.");
        return null;
    }
    if (getApps().length > 0) {
        return getApp();
    }
    return initializeApp(firebaseConfig);
}

// NOTE: All database logic has been moved to use MongoDB.
// These functions are kept to prevent breaking imports but are non-functional for the database.
// Playlist data is now only stored in localStorage.

export function savePlaylistToFirebase(playlist: Playlist) {
  const app = getFirebaseApp();
  if (!app) {
    console.log("Firebase config not found, skipping save to Firebase.");
    return;
  }
  console.log("Playlist saving to Firebase is disabled; using MongoDB for user data.");
}
