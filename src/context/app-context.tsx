
"use client";

import React, { createContext, useContext, useReducer, useEffect, type ReactNode, useState } from 'react';
import type { Track, Playlist, User } from '@/lib/types';
import { saveUser } from '@/lib/auth';

interface AppState {
  playlists: Playlist[];
  currentTrack: Track | null;
  defaultPlaylistId: string | null;
}

type AppAction =
  | { type: 'SET_CURRENT_TRACK'; payload: Track | null }
  | { type: 'CREATE_PLAYLIST'; payload: { name: string; tracks: Track[] } }
  | { type: 'ADD_TRACK_TO_PLAYLIST'; payload: { playlistId: string; track: Track } }
  | { type: 'RENAME_PLAYLIST'; payload: { id: string; newName: string } }
  | { type: 'DELETE_PLAYLIST'; payload: { id: string } }
  | { type: 'SET_DEFAULT_PLAYLIST'; payload: { id: string | null } }
  | { type: 'SET_USER_DATA'; payload: { playlists: Playlist[], defaultPlaylistId: string | null }};

interface AppContextType extends AppState {
  dispatch: React.Dispatch<AppAction>;
  loggedInUser: User | null;
  setLoggedInUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// A helper function to save the user state to the database
async function saveUserState(user: User | null, newPlaylists: Playlist[], newDefaultPlaylistId: string | null) {
  if (!user) return;
  const updatedUser = { ...user, playlists: newPlaylists, defaultPlaylistId: newDefaultPlaylistId };
  await saveUser(updatedUser);
  // We return the updated user object to sync the client state
  return updatedUser;
}


function appReducer(state: AppState, action: AppAction, user: User | null, setUser: (u: User) => void): AppState {
  let updatedPlaylists: Playlist[];
  switch (action.type) {
    case 'SET_CURRENT_TRACK':
      return { ...state, currentTrack: action.payload };

    case 'CREATE_PLAYLIST': {
      const newPlaylist: Playlist = {
        id: new Date().toISOString(),
        name: action.payload.name,
        tracks: action.payload.tracks,
      };
      updatedPlaylists = [...state.playlists, newPlaylist];
      saveUserState(user, updatedPlaylists, state.defaultPlaylistId).then(updatedUser => updatedUser && setUser(updatedUser));
      return { ...state, playlists: updatedPlaylists };
    }

    case 'ADD_TRACK_TO_PLAYLIST': {
      updatedPlaylists = state.playlists.map((p) => {
        if (p.id === action.payload.playlistId) {
          if (p.tracks.some(t => t.id === action.payload.track.id)) {
            return p;
          }
          return { ...p, tracks: [...p.tracks, action.payload.track] };
        }
        return p;
      });
      saveUserState(user, updatedPlaylists, state.defaultPlaylistId).then(updatedUser => updatedUser && setUser(updatedUser));
      return { ...state, playlists: updatedPlaylists };
    }
    
    case 'RENAME_PLAYLIST':
      updatedPlaylists = state.playlists.map(p => 
        p.id === action.payload.id ? { ...p, name: action.payload.newName } : p
      );
      saveUserState(user, updatedPlaylists, state.defaultPlaylistId).then(updatedUser => updatedUser && setUser(updatedUser));
      return { ...state, playlists: updatedPlaylists };

    case 'DELETE_PLAYLIST':
      updatedPlaylists = state.playlists.filter(p => p.id !== action.payload.id);
      const newDefaultId = state.defaultPlaylistId === action.payload.id ? null : state.defaultPlaylistId;
      saveUserState(user, updatedPlaylists, newDefaultId).then(updatedUser => updatedUser && setUser(updatedUser));
      return { ...state, playlists: updatedPlaylists, defaultPlaylistId: newDefaultId };

    case 'SET_DEFAULT_PLAYLIST':
      saveUserState(user, state.playlists, action.payload.id).then(updatedUser => updatedUser && setUser(updatedUser));
      return { ...state, defaultPlaylistId: action.payload.id };

    case 'SET_USER_DATA':
        return { ...state, playlists: action.payload.playlists, defaultPlaylistId: action.payload.defaultPlaylistId };

    default:
      return state;
  }
}


export function AppProvider({ children }: { children: ReactNode }) {
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);

  const initialState: AppState = {
    playlists: loggedInUser?.playlists || [],
    currentTrack: null,
    defaultPlaylistId: loggedInUser?.defaultPlaylistId || null,
  };
  
  const [state, dispatch] = useReducer((state: AppState, action: AppAction) => appReducer(state, action, loggedInUser, setLoggedInUser), initialState);

  // When the user logs in or out, sync their data to the context state
  useEffect(() => {
    if (loggedInUser) {
        dispatch({
            type: 'SET_USER_DATA',
            payload: {
                playlists: loggedInUser.playlists || [],
                defaultPlaylistId: loggedInUser.defaultPlaylistId || null
            }
        });
    } else {
         dispatch({
            type: 'SET_USER_DATA',
            payload: {
                playlists: [],
                defaultPlaylistId: null
            }
        });
    }
  }, [loggedInUser]);

  // Load user from local storage on initial app load
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('loggedInUser');
      if(storedUser) {
        const user = JSON.parse(storedUser);
        setLoggedInUser(user);
      }
    } catch (error) {
      console.error("Could not load user from localStorage", error);
    }
  }, []);

  return <AppContext.Provider value={{ ...state, dispatch, loggedInUser, setLoggedInUser }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
