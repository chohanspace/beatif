"use client";

import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { Track, Playlist } from '@/lib/types';
import { savePlaylistToFirebase } from '@/lib/firebase';

interface AppState {
  playlists: Playlist[];
  currentTrack: Track | null;
}

type AppAction =
  | { type: 'SET_CURRENT_TRACK'; payload: Track | null }
  | { type: 'CREATE_PLAYLIST'; payload: { name: string; tracks: Track[] } }
  | { type: 'ADD_TRACK_TO_PLAYLIST'; payload: { playlistId: string; track: Track } }
  | { type: 'LOAD_PLAYLISTS'; payload: Playlist[] };

const initialState: AppState = {
  playlists: [],
  currentTrack: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_CURRENT_TRACK':
      return { ...state, currentTrack: action.payload };
    case 'CREATE_PLAYLIST': {
      const newPlaylist: Playlist = {
        id: new Date().toISOString(),
        name: action.payload.name,
        tracks: action.payload.tracks,
      };
      const updatedPlaylists = [...state.playlists, newPlaylist];
      if (typeof window !== 'undefined') {
        localStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
        savePlaylistToFirebase(newPlaylist);
      }
      return { ...state, playlists: updatedPlaylists };
    }
    case 'ADD_TRACK_TO_PLAYLIST': {
      const updatedPlaylists = state.playlists.map((p) => {
        if (p.id === action.payload.playlistId) {
          const newPlaylist = { ...p, tracks: [...p.tracks, action.payload.track] };
          savePlaylistToFirebase(newPlaylist);
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
    default:
      return state;
  }
}

interface AppContextType extends AppState {
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    try {
      const storedPlaylists = localStorage.getItem('playlists');
      if (storedPlaylists) {
        dispatch({ type: 'LOAD_PLAYLISTS', payload: JSON.parse(storedPlaylists) });
      }
    } catch (error) {
      console.error("Could not load playlists from localStorage", error);
    }
  }, []);

  return <AppContext.Provider value={{ ...state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
