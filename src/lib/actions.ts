"use server";

import { generateMoodPlaylist } from "@/ai/flows/mood-based-playlists";
import { generateGenreBasedRecommendations } from "@/ai/flows/genre-based-recommendations";
import type { Track, GenreBasedRecommendationsInput } from "@/lib/types";

// This is a mock search function. In a real application, you would
// use the YouTube Data API v3 here.
const mockTracks: Track[] = [
    { id: '1', title: 'Cosmic Dreamer', artist: 'Starlight Express', youtubeId: 'dQw4w9WgXcQ', thumbnail: 'https://picsum.photos/seed/1/300/300' },
    { id: '2', title: 'Ocean Breath', artist: 'Tidal Waves', youtubeId: '3tmd-ClpJxA', thumbnail: 'https://picsum.photos/seed/2/300/300' },
    { id: '3', title: 'City Lights', artist: 'Urban Groove', youtubeId: 'pA_hC1sNC_I', thumbnail: 'https://picsum.photos/seed/3/300/300' },
    { id: '4', title: 'Forest Whisper', artist: 'Silent Grove', youtubeId: 'o-YBDTqX_ZU', thumbnail: 'https://picsum.photos/seed/4/300/300' },
    { id: '5', title: 'Desert Mirage', artist: 'The Nomads', youtubeId: '9g8SFYR4c9I', thumbnail: 'https://picsum.photos/seed/5/300/300' },
    { id: '6', title: 'Mountain Call', artist: 'Echo Peak', youtubeId: '2Vv-BfVoq44', thumbnail: 'https://picsum.photos/seed/6/300/300' },
];

export async function searchYoutube(query: string): Promise<Track[]> {
  console.log(`Searching for: ${query}`);
  // In a real app, you would fetch from the YouTube API.
  // For now, we filter our mock data.
  if (!query) return mockTracks.slice(0, 3);
  return mockTracks.filter(track => 
    track.title.toLowerCase().includes(query.toLowerCase()) ||
    track.artist.toLowerCase().includes(query.toLowerCase())
  );
}

export async function getTracksForMood(mood: string): Promise<Track[]> {
    try {
        const playlist = await generateMoodPlaylist(mood);
        const trackPromises = playlist.songs.map(songTitle => searchYoutube(songTitle).then(results => results[0]));
        const tracks = await Promise.all(trackPromises);
        return tracks.filter((t): t is Track => t !== undefined);
    } catch (error) {
        console.error(`Error getting tracks for mood ${mood}:`, error);
        return [];
    }
}

export async function getGenreRecommendations(input: GenreBasedRecommendationsInput): Promise<string> {
    try {
        const result = await generateGenreBasedRecommendations(input);
        return result.recommendations;
    } catch (error) {
        console.error("Error getting genre recommendations:", error);
        return "Sorry, I couldn't get recommendations at this time.";
    }
}
