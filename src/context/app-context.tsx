
"use client";

import React, { createContext, useContext, useReducer, useEffect, type ReactNode, useState } from 'react';
import type { Track, Playlist, User } from '@/lib/types';
import { saveUser } from '@/lib/auth';

type Theme = 'light' | 'dark';

interface AppState {
  playlists: Playlist[];
  currentTrack: Track | null;
  defaultPlaylistId: string | null;
  theme: Theme;
}

type AppAction =
  | { type: 'SET_CURRENT_TRACK'; payload: Track | null }
  | { type: 'CREATE_PLAYLIST'; payload: { name: string; tracks: Track[] } }
  | { type: 'ADD_TRACK_TO_PLAYLIST'; payload: { playlistId: string; track: Track } }
  | { type: 'RENAME_PLAYLIST'; payload: { id: string; newName: string } }
  | { type: 'DELETE_PLAYLIST'; payload: { id: string } }
  | { type: 'SET_DEFAULT_PLAYLIST'; payload: { id: string | null } }
  | { type: 'SET_USER_DATA'; payload: { playlists: Playlist[], defaultPlaylistId: string | null, theme?: Theme } }
  | { type: 'SET_THEME'; payload: Theme };

interface AppContextType extends AppState {
  dispatch: React.Dispatch<AppAction>;
  loggedInUser: User | null;
  setLoggedInUser: React.Dispatch<React.SetStateAction<User | null>>;
  setTheme: (theme: Theme) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

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
      return { ...state, playlists: [...state.playlists, newPlaylist] };
    }

    case 'ADD_TRACK_TO_PLAYLIST': {
      return {
        ...state,
        playlists: state.playlists.map((p) => {
          if (p.id === action.payload.playlistId) {
            // Avoid adding duplicate tracks
            if (p.tracks.some(t => t.id === action.payload.track.id)) {
              return p;
            }
            return { ...p, tracks: [...p.tracks, action.payload.track] };
          }
          return p;
        }),
      };
    }
    
    case 'RENAME_PLAYLIST':
      return {
        ...state,
        playlists: state.playlists.map(p => 
          p.id === action.payload.id ? { ...p, name: action.payload.newName } : p
        ),
      };

    case 'DELETE_PLAYLIST':
      const newDefaultId = state.defaultPlaylistId === action.payload.id ? null : state.defaultPlaylistId;
      return {
        ...state,
        playlists: state.playlists.filter(p => p.id !== action.payload.id),
        defaultPlaylistId: newDefaultId,
      };

    case 'SET_DEFAULT_PLAYLIST':
      return { ...state, defaultPlaylistId: action.payload.id };

    case 'SET_USER_DATA':
        return { 
          ...state, 
          playlists: action.payload.playlists, 
          defaultPlaylistId: action.payload.defaultPlaylistId,
          theme: action.payload.theme || state.theme
        };

    case 'SET_THEME':
      return { ...state, theme: action.payload };

    default:
      return state;
  }
}


export function AppProvider({ children }: { children: ReactNode }) {
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);

  const initialState: AppState = {
    playlists: [],
    currentTrack: null,
    defaultPlaylistId: null,
    theme: 'dark'
  };
  
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // Load user from local storage on initial app load
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('loggedInUser');
      if(storedUser) {
        const user = JSON.parse(storedUser);
        setLoggedInUser(user);
      }
      const storedTheme = localStorage.getItem('theme') as Theme | null;
      if (storedTheme) {
        dispatch({ type: 'SET_THEME', payload: storedTheme });
      }
    } catch (error) {
      console.error("Could not load data from localStorage", error);
    }
  }, []);

  // When the user logs in or out, sync their data from the user object to the context state
  useEffect(() => {
    if (loggedInUser) {
        dispatch({
            type: 'SET_USER_DATA',
            payload: {
                playlists: loggedInUser.playlists || [],
                defaultPlaylistId: loggedInUser.defaultPlaylistId || null,
                theme: loggedInUser.theme || 'dark'
            }
        });
    } else {
         dispatch({
            type: 'SET_USER_DATA',
            payload: {
                playlists: [],
                defaultPlaylistId: null,
            }
        });
    }
  }, [loggedInUser]);

  // When the client-side state changes, save it to the database
  useEffect(() => {
      if (!loggedInUser || !loggedInUser.id) return;
      
      const hasStateChanged = JSON.stringify(loggedInUser.playlists || []) !== JSON.stringify(state.playlists) ||
                              loggedInUser.defaultPlaylistId !== state.defaultPlaylistId ||
                              loggedInUser.theme !== state.theme;

      if(hasStateChanged) {
        const updatedUser: User = { 
            ...loggedInUser, 
            playlists: state.playlists, 
            defaultPlaylistId: state.defaultPlaylistId,
            theme: state.theme
        };
        saveUser(updatedUser).then(() => {
            // Also update the state in the provider and local storage
            setLoggedInUser(updatedUser);
            if(typeof window !== "undefined") {
              localStorage.setItem('loggedInUser', JSON.stringify(updatedUser));
            }
        }).catch(err => console.error("Failed to save user state:", err));
      }

  }, [state.playlists, state.defaultPlaylistId, state.theme, loggedInUser]);

  // Handle theme changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('theme', state.theme);
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(state.theme);
    }
  }, [state.theme]);

  const setTheme = (theme: Theme) => {
    dispatch({ type: 'SET_THEME', payload: theme });
  };

  const setAndStoreUser = (user: User | null) => {
    setLoggedInUser(user);
    if(typeof window !== "undefined") {
      if (user) {
        localStorage.setItem('loggedInUser', JSON.stringify(user));
      } else {
        localStorage.removeItem('loggedInUser');
      }
    }
  }


  return <AppContext.Provider value={{ ...state, dispatch, loggedInUser, setLoggedInUser: setAndStoreUser, setTheme }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
