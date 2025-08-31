
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Track } from '@/lib/types';

// In a real app, you would fetch from a music chart API.
// For now, we use our mock data.
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

export async function GET(
  request: NextRequest,
  { params }: { params: { country: string } }
) {
  const country = params.country;
  console.log(`Fetching trending tracks for: ${country}`);
  
  // Simulate fetching data and add a delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return a shuffled list of mock tracks
  const shuffledTracks = [...mockTracks].sort(() => 0.5 - Math.random());
  
  return NextResponse.json(shuffledTracks);
}
