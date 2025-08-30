
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
    { id: '7', title: 'Tokyo Drift', artist: 'Teriyaki Boyz', youtubeId: 'ua_tsa1h1vI', thumbnail: 'https://picsum.photos/seed/7/300/300' },
    { id: '8', title: 'Indian Summer', artist: 'Jai Wolf', youtubeId: 'cKx92QPROaM', thumbnail: 'https://picsum.photos/seed/8/300/300' },
    { id: '9', title: 'Paris', artist: 'The Chainsmokers', youtubeId: 'f2JuxM-snGc', thumbnail: 'https://picsum.photos/seed/9/300/300' },
];

export async function searchYoutube(query: string): Promise<Track[]> {
  console.log(`Searching for: ${query}`);
  // In a real app, you would fetch from the YouTube API.
  // For now, we filter our mock data.
  const filteredTracks = mockTracks.filter(track => 
    track.title.toLowerCase().includes(query.toLowerCase()) ||
    track.artist.toLowerCase().includes(query.toLowerCase())
  );

  if (filteredTracks.length > 0) {
    return filteredTracks;
  }
  
  // If no results, return a random selection to make search feel more responsive
  return [...mockTracks].sort(() => 0.5 - Math.random()).slice(0, 5);
}

export async function getTracksForMood(mood: string, country?: string): Promise<Track[]> {
    console.log(`Getting tracks for mood: ${mood} in country: ${country}`);
    // Simulate an API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Return a shuffled and sliced list of mock tracks
    return [...mockTracks].sort(() => 0.5 - Math.random()).slice(0, 4);
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
