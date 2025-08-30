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

export type View =
  | { type: 'discover'; results?: Track[] }
  | { type: 'recommendations' }
  | { type: 'playlist'; playlistId: string }
  | { type: 'search'; query: string; results?: Track[] };
