
// This is a placeholder for your Firebase configuration.
// In a real application, you would populate this with your own Firebase project credentials.
// Make sure to install the 'firebase' package: npm install firebase

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, set, get, child, remove } from 'firebase/database';
import type { Playlist, User } from './types';

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

export async function saveUser(user: User) {
    const app = getFirebaseApp();
    if (!app) return;
    const db = getDatabase(app);
    // Use user.id (which is the email) as the key for the user document.
    await set(ref(db, 'users/' + user.id), user);
}

export async function getUser(email: string): Promise<User | null> {
    const app = getFirebaseApp();
    if (!app) return null;
    const dbRef = ref(getDatabase(app));
    // Use the email directly as the key to look up the user.
    const snapshot = await get(child(dbRef, `users/${email}`));
    if (snapshot.exists()) {
        const user = snapshot.val();
        // The key of the user object is the ID in firebase, let's make sure it's part of the object
        return { ...user, id: snapshot.key };
    }
    return null;
}

export async function getAllUsers(): Promise<User[]> {
    const app = getFirebaseApp();
    if (!app) return [];
    const db = getDatabase(app);
    const snapshot = await get(ref(db, 'users'));
    if (snapshot.exists()) {
        const usersObject = snapshot.val();
        return Object.values(usersObject);
    }
    return [];
}

export async function deleteUser(email: string): Promise<void> {
    const app = getFirebaseApp();
    if (!app) return;
    const db = getDatabase(app);
    await remove(ref(db, 'users/' + email));
}
