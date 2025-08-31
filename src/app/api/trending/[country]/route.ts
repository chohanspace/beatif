
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Track } from '@/lib/types';
import { countries } from '@/lib/countries';

export async function GET(
  request: NextRequest,
  { params }: { params: { country: string } }
) {
  const countryName = params.country;
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey || apiKey === 'YOUR_YOUTUBE_API_KEY_HERE') {
    return NextResponse.json({ error: 'YouTube API key not configured' }, { status: 500 });
  }

  const country = countries.find(c => c.name === countryName);
  if (!country) {
    return NextResponse.json({ error: 'Invalid country specified' }, { status: 400 });
  }

  const regionCode = country.code;
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&chart=mostPopular&regionCode=${regionCode}&maxResults=20&videoCategoryId=10&key=${apiKey}`;

  try {
    const response = await fetch(url, {
        headers: {
            'Accept': 'application/json',
        }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("YouTube API Error:", errorData);
      return NextResponse.json({ error: `YouTube API request failed: ${response.statusText}` }, { status: response.status });
    }

    const data = await response.json();

    const tracks: Track[] = data.items.map((item: any): Track => ({
      id: item.id,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.high.url,
      youtubeId: item.id,
    }));
    
    return NextResponse.json(tracks);
  } catch (error) {
    console.error("Failed to fetch from YouTube API:", error);
    return NextResponse.json({ error: 'Failed to fetch trending tracks from YouTube.' }, { status: 500 });
  }
}
