
"use client";

import { useState, useEffect, type Dispatch, type SetStateAction } from 'react';
import type { Track, View } from '@/lib/types';
import TrackCard from './track-card';
import { MusicalNotesLoader } from './ui/gears-loader';
import { useApp } from '@/context/app-context';

interface DiscoverViewProps {
  setView: Dispatch<SetStateAction<View>>;
}

export default function DiscoverView({ setView }: DiscoverViewProps) {
  const [trendingTracks, setTrendingTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { loggedInUser } = useApp();

  useEffect(() => {
    if (!loggedInUser?.country) {
      setIsLoading(false);
      return;
    }

    const fetchTrendingTracks = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/trending/${encodeURIComponent(loggedInUser.country!)}`);
        const data: Track[] = await response.json();
        setTrendingTracks(data);
      } catch (error) {
        console.error("Failed to fetch trending tracks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingTracks();
  }, [loggedInUser?.country]);

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold font-headline mb-1">
          Trending in {loggedInUser?.country || 'your area'}
        </h2>
        <p className="text-muted-foreground text-lg">
          Popular tracks and artists based on your location.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-10 gap-4">
          <MusicalNotesLoader size="lg" />
          <p className="text-lg text-muted-foreground">Finding the hottest tracks...</p>
        </div>
      ) : trendingTracks.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {trendingTracks.map((track) => (
            <TrackCard key={track.id} track={track} setView={setView} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-10">
          Could not load trending tracks for {loggedInUser?.country}. Please try again later.
        </p>
      )}
    </div>
  );
}
