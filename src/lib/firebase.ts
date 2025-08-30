// This is a placeholder for your Firebase configuration.
// In a real application, you would populate this with your own Firebase project credentials.
// Make sure to install the 'firebase' package: npm install firebase

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, set } from 'firebase/database';
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
    if (!firebaseConfig.projectId) {
        return null;
    }
    if (getApps().length > 0) {
        return getApp();
    }
    return initializeApp(firebaseConfig);
}

/**
 * Saves a user's playlist to the Firebase Realtime Database.
 * NOTE: This is a simplified example. In a real app, you'd likely want to
 * associate playlists with a user ID.
 * @param playlist - The playlist object to save.
 */
export function savePlaylistToFirebase(playlist: Playlist) {
  const app = getFirebaseApp();
  if (!app) {
    console.log("Firebase config not found, skipping save to Firebase.");
    return;
  }
  
  try {
    const database = getDatabase(app);
    // Using playlist.id as the key.
    return set(ref(database, 'playlists/' + playlist.id), playlist);
  } catch (error) {
    console.error("Error saving playlist to Firebase:", error);
  }
}
