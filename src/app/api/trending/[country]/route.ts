
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Track } from '@/lib/types';
import crypto from 'crypto';

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
    { id: '10', title: 'Midnight City', artist: 'M83', youtubeId: 'dX3k_QDnzHE', thumbnail: 'https://picsum.photos/seed/10/300/300' },
    { id: '11', title: 'Walking On A Dream', artist: 'Empire of the Sun', youtubeId: 'eimgRedL-Ps', thumbnail: 'https://picsum.photos/seed/11/300/300' },
    { id: '12', title: 'A-Punk', artist: 'Vampire Weekend', youtubeId: '_XC2_FkI_es', thumbnail: 'https://picsum.photos/seed/12/300/300' },
];

function pseudoRandom(seed: string): number {
  const hash = crypto.createHash('sha256').update(seed).digest();
  return (hash.readUInt32BE(0) / 0xFFFFFFFF);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { country: string } }
) {
  const country = params.country;
  console.log(`Fetching trending tracks for: ${country}`);
  
  // Simulate fetching data and add a delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return a shuffled list of mock tracks based on the country name as a seed
  const shuffledTracks = [...mockTracks].sort(() => 0.5 - pseudoRandom(country + new Date().toDateString()));
  
  return NextResponse.json(shuffledTracks);
}
