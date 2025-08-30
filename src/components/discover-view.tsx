"use client";

import { useState, useEffect, type Dispatch, type SetStateAction } from 'react';
import { Loader2 } from 'lucide-react';
import { getTracksForMood } from '@/lib/actions';
import type { Track, View } from '@/lib/types';
import TrackCard from './track-card';
import { Button } from './ui/button';

const moods = ['Happy', 'Relaxed', 'Energetic', 'Melancholy', 'Romantic'];

interface DiscoverViewProps {
  setView: Dispatch<SetStateAction<View>>;
  initialResults?: Track[];
}

export default function DiscoverView({ setView, initialResults }: DiscoverViewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [moodResults, setMoodResults] = useState<Track[]>(initialResults || []);

  const handleMoodSelect = async (mood: string) => {
    setIsLoading(true);
    setSelectedMood(mood);
    setMoodResults([]);
    const tracks = await getTracksForMood(mood);
    setMoodResults(tracks);
    setIsLoading(false);
  };
  
  useEffect(() => {
    if(initialResults) {
        setMoodResults(initialResults);
    }
  }, [initialResults])

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold font-headline mb-4">Discover</h2>
        <p className="text-muted-foreground text-lg">
          Select a mood to get a personalized playlist generated just for you.
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        {moods.map((mood) => (
          <Button
            key={mood}
            variant={selectedMood === mood ? 'default' : 'secondary'}
            size="lg"
            onClick={() => handleMoodSelect(mood)}
            disabled={isLoading}
          >
            {mood}
          </Button>
        ))}
      </div>

      <div>
        {isLoading && (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-lg">Brewing your {selectedMood} mix...</p>
          </div>
        )}
        {moodResults.length > 0 && (
          <>
            <h3 className="text-2xl font-bold font-headline mb-4">{selectedMood} Vibes</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {moodResults.map((track) => (
                <TrackCard key={track.id} track={track} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
