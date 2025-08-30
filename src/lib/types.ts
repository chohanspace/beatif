
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
  id: string; // email
  email: string;
  password_placeholder?: string; // For demonstration, not for real auth
  otp?: string;
  otpExpires?: number;
  createdAt: number;
}

export type View =
  | { type: 'discover'; results?: Track[] }
  | { type: 'recommendations' }
  | { type: 'playlist'; playlistId: string }
  | { type: 'search'; query: string; results?: Track[] }
  | { type: 'login' }
  | { type: 'signup' };


export type GenreBasedRecommendationsInput = {
    listeningHistory: string;
}
