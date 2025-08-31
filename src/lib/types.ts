
export interface Track {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  youtubeId: string;
}

export interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
}

export interface User {
  id:string; // email
  email: string;
  password?: string;
  createdAt: number;
  isVerified?: boolean;
  otp?: string;
  otpExpires?: number;
  country?: string;
  playlists?: Playlist[];
  defaultPlaylistId?: string | null;
}

export type View =
  | { type: 'discover'; results?: Track[] }
  | { type: 'playlist'; playlistId: string }
  | { type: 'search'; query: string; results?: Track[] }
  | { type: 'settings' }
  | { type: 'login' }
  | { type: 'signup' }
  | { type: 'forgot-password' };


export type GenreBasedRecommendationsInput = {
    listeningHistory: string;
}
