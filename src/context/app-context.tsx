
"use client";

import React, { createContext, useContext, useReducer, useEffect, type ReactNode, useState, useRef, useCallback } from 'react';
import type { Track, Playlist, User } from '@/lib/types';
import { saveUser } from '@/lib/auth';
import { useSession } from 'next-auth/react';

type Theme = 'light' | 'dark';

interface AppState {
  playlists: Playlist[];
  currentTrack: Track | null;
  defaultPlaylistId: string | null;
  theme: Theme;
  playerState: PlayerState;
}

interface PlayerState {
  isPlaying: boolean;
  progress: number;
  duration: number;
}

interface PlayerControls {
    play: () => void;
    pause: () => void;
    togglePlay: () => void;
    seek: (time: number) => void;
    playNext: () => void;
    playPrev: () => void;
    canPlayNext: () => boolean;
    canPlayPrev: () => boolean;
}

interface AppContextType extends AppState {
  dispatch: React.Dispatch<AppAction>;
  loggedInUser: User | null;
  setLoggedInUser: (user: User | null) => void;
  setTheme: (theme: Theme) => void;
  ytPlayer: any | null;
  setYtPlayer: (player: any) => void;
  playerRef: React.RefObject<HTMLDivElement> | null;
  controls: PlayerControls;
}

type AppAction =
  | { type: 'SET_CURRENT_TRACK'; payload: Track | null }
  | { type: 'CREATE_PLAYLIST'; payload: { name: string; tracks: Track[] } }
  | { type: 'ADD_TRACK_TO_PLAYLIST'; payload: { playlistId: string; track: Track } }
  | { type: 'RENAME_PLAYLIST'; payload: { id: string; newName: string } }
  | { type: 'DELETE_PLAYLIST'; payload: { id: string } }
  | { type: 'SET_DEFAULT_PLAYLIST'; payload: { id: string } }
  | { type: 'SET_USER_DATA'; payload: { playlists: Playlist[], defaultPlaylistId: string | null, theme?: Theme } }
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'SET_PLAYER_STATE'; payload: Partial<PlayerState> };

const AppContext = createContext<AppContextType | undefined>(undefined);

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_CURRENT_TRACK':
      return { ...state, currentTrack: action.payload, playerState: { ...state.playerState, isPlaying: !!action.payload, progress: 0 } };

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

    case 'SET_PLAYER_STATE':
        return {
            ...state,
            playerState: { ...state.playerState, ...action.payload },
        };

    default:
      return state;
  }
}


export function AppProvider({ children }: { children: ReactNode }) {
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const { data: session, status } = useSession();
  const [ytPlayer, setYtPlayer] = useState<any>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  
  const initialState: AppState = {
    playlists: [],
    currentTrack: null,
    defaultPlaylistId: null,
    theme: 'dark',
    playerState: {
        isPlaying: false,
        progress: 0,
        duration: 0,
    }
  };
  
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  const findTrackInPlaylists = useCallback((trackId: string) => {
    for (const playlist of state.playlists) {
        const trackIndex = playlist.tracks.findIndex(t => t.youtubeId === trackId);
        if (trackIndex !== -1) {
            return { playlist, trackIndex };
        }
    }
    return { playlist: null, trackIndex: -1 };
  }, [state.playlists]);
  
  const playNext = useCallback(() => {
    if (!state.currentTrack) return;
    const { playlist, trackIndex } = findTrackInPlaylists(state.currentTrack.youtubeId);
    if (playlist && trackIndex < playlist.tracks.length - 1) {
        dispatch({ type: 'SET_CURRENT_TRACK', payload: playlist.tracks[trackIndex + 1] });
    }
  }, [state.currentTrack, findTrackInPlaylists, dispatch]);

  const playPrev = useCallback(() => {
    if (!state.currentTrack) return;
    if (state.playerState.progress > 3 && ytPlayer) {
        ytPlayer.seekTo(0);
        return;
    }
    const { playlist, trackIndex } = findTrackInPlaylists(state.currentTrack.youtubeId);
    if (playlist && trackIndex > 0) {
        dispatch({ type: 'SET_CURRENT_TRACK', payload: playlist.tracks[trackIndex - 1] });
    }
  }, [state.currentTrack, state.playerState.progress, ytPlayer, findTrackInPlaylists, dispatch]);
  
  const controls: PlayerControls = {
    play: () => ytPlayer?.playVideo(),
    pause: () => ytPlayer?.pauseVideo(),
    togglePlay: () => {
        if (!ytPlayer) return;
        if (state.playerState.isPlaying) {
            ytPlayer.pauseVideo();
        } else {
            ytPlayer.playVideo();
        }
    },
    seek: (time: number) => ytPlayer?.seekTo(time, true),
    playNext,
    playPrev,
    canPlayNext: () => {
        if (!state.currentTrack) return false;
        const { playlist, trackIndex } = findTrackInPlaylists(state.currentTrack.youtubeId);
        return !!playlist && trackIndex < playlist.tracks.length - 1;
    },
    canPlayPrev: () => {
        if (!state.currentTrack) return false;
        if (state.playerState.progress > 3) return true; // Can rewind
        const { playlist, trackIndex } = findTrackInPlaylists(state.currentTrack.youtubeId);
        return !!playlist && trackIndex > 0;
    },
  };

  // Handle user state from both next-auth session and our custom JWT
  useEffect(() => {
    // This effect runs on initial mount to load user from localStorage
    try {
      const storedUser = localStorage.getItem('loggedInUser');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setLoggedInUser(user);
      }
    } catch (error) {
      console.error("Could not load user from localStorage", error);
      setLoggedInUser(null);
    }
  }, []);
  
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setLoggedInUser(session.user as User);
    }
  }, [session, status]);


  // Load theme from local storage on initial app load
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem('theme') as Theme | null;
      if (storedTheme) {
        dispatch({ type: 'SET_THEME', payload: storedTheme });
      } else {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        dispatch({ type: 'SET_THEME', payload: prefersDark ? 'dark' : 'light' });
      }
    } catch (error) {
      console.error("Could not load theme from localStorage", error);
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
                theme: loggedInUser.theme || state.theme
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
            if(typeof window !== "undefined" && !session?.user) { // Only use localStorage for non-google auth
              localStorage.setItem('loggedInUser', JSON.stringify(updatedUser));
            }
        }).catch(err => console.error("Failed to save user state:", err));
      }

  }, [state.playlists, state.defaultPlaylistId, state.theme, loggedInUser, session]);

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
        // For email/pass logins, also store the JWT if it's generated
        if ('token' in user && (user as any).token) {
            localStorage.setItem('jwt', (user as any).token);
        }
      } else {
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('jwt');
      }
    }
  }

  const contextValue: AppContextType = {
    ...state,
    dispatch,
    loggedInUser,
    setLoggedInUser: setAndStoreUser,
    setTheme,
    ytPlayer,
    setYtPlayer,
    playerRef,
    controls,
  };


  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
