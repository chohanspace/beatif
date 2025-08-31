
"use client";

import React, { createContext, useContext, useReducer, useEffect, type ReactNode, useState } from 'react';
import type { Track, Playlist, User } from '@/lib/types';
import { savePlaylistToFirebase } from '@/lib/firebase';

interface AppState {
  playlists: Playlist[];
  currentTrack: Track | null;
  defaultPlaylistId: string | null;
}

type AppAction =
  | { type: 'SET_CURRENT_TRACK'; payload: Track | null }
  | { type: 'CREATE_PLAYLIST'; payload: { name: string; tracks: Track[] } }
  | { type: 'ADD_TRACK_TO_PLAYLIST'; payload: { playlistId: string; track: Track } }
  | { type: 'LOAD_PLAYLISTS'; payload: Playlist[] }
  | { type: 'RENAME_PLAYLIST'; payload: { id: string; newName: string } }
  | { type: 'DELETE_PLAYLIST'; payload: { id: string } }
  | { type: 'SET_DEFAULT_PLAYLIST'; payload: { id: string } }
  | { type: 'LOAD_DEFAULT_PLAYLIST'; payload: string | null };

const initialState: AppState = {
  playlists: [],
  currentTrack: null,
  defaultPlaylistId: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  let updatedPlaylists;
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
      if (typeof window !== 'undefined') {
        localStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
      }
      return { ...state, playlists: updatedPlaylists };
    }
    case 'ADD_TRACK_TO_PLAYLIST': {
      updatedPlaylists = state.playlists.map((p) => {
        if (p.id === action.payload.playlistId) {
          // Avoid adding duplicate tracks
          if (p.tracks.some(t => t.id === action.payload.track.id)) {
            return p;
          }
          const newPlaylist = { ...p, tracks: [...p.tracks, action.payload.track] };
          return newPlaylist;
        }
        return p;
      });
       if (typeof window !== 'undefined') {
        localStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
      }
      return { ...state, playlists: updatedPlaylists };
    }
    case 'LOAD_PLAYLISTS':
      return { ...state, playlists: action.payload };
    
    case 'RENAME_PLAYLIST':
      updatedPlaylists = state.playlists.map(p => 
        p.id === action.payload.id ? { ...p, name: action.payload.newName } : p
      );
      localStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
      return { ...state, playlists: updatedPlaylists };

    case 'DELETE_PLAYLIST':
      updatedPlaylists = state.playlists.filter(p => p.id !== action.payload.id);
      localStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
      // If the deleted playlist was the default, unset it
      const newDefaultId = state.defaultPlaylistId === action.payload.id ? null : state.defaultPlaylistId;
      if (state.defaultPlaylistId === action.payload.id) {
          localStorage.removeItem('defaultPlaylistId');
      }
      return { ...state, playlists: updatedPlaylists, defaultPlaylistId: newDefaultId };

    case 'SET_DEFAULT_PLAYLIST':
      localStorage.setItem('defaultPlaylistId', action.payload.id);
      return { ...state, defaultPlaylistId: action.payload.id };

    case 'LOAD_DEFAULT_PLAYLIST':
        return { ...state, defaultPlaylistId: action.payload };

    default:
      return state;
  }
}

interface AppContextType extends AppState {
  dispatch: React.Dispatch<AppAction>;
  loggedInUser: User | null;
  setLoggedInUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const storedPlaylists = localStorage.getItem('playlists');
      if (storedPlaylists) {
        dispatch({ type: 'LOAD_PLAYLISTS', payload: JSON.parse(storedPlaylists) });
      }
      const storedDefaultPlaylistId = localStorage.getItem('defaultPlaylistId');
      if (storedDefaultPlaylistId) {
          dispatch({ type: 'LOAD_DEFAULT_PLAYLIST', payload: storedDefaultPlaylistId });
      }
      const storedUser = localStorage.getItem('loggedInUser');
      if(storedUser) {
        setLoggedInUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Could not load from localStorage", error);
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
