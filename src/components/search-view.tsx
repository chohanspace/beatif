
"use client";

import { useState, useEffect, type Dispatch, type SetStateAction } from 'react';
import { searchYoutube } from '@/lib/actions';
import type { Track, View } from '@/lib/types';
import TrackCard from './track-card';
import { GearsLoader } from './ui/gears-loader';

interface SearchViewProps {
  query: string;
  setView: Dispatch<SetStateAction<View>>;
  initialResults?: Track[];
}

export default function SearchView({ query, setView, initialResults }: SearchViewProps) {
  const [results, setResults] = useState<Track[]>(initialResults || []);
  const [isLoading, setIsLoading] = useState(!initialResults);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setResults([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      const tracks = await searchYoutube(query);
      setResults(tracks);
      setIsLoading(false);
      // Update the view in the parent with the results, to preserve them on navigation
      setView({ type: 'search', query, results: tracks });
    };

    // Use a timeout to avoid searching on every keystroke if the user is typing fast
    const debounceTimer = setTimeout(() => {
        fetchResults();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, setView]);

  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-3xl font-bold font-headline mb-1">
          Search results for "{query}"
        </h2>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <GearsLoader size="lg" />
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {results.map((track) => (
            <TrackCard key={track.id} track={track} setView={setView} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-10">
          No results found. Try a different search.
        </p>
      )}
    </div>
  );
}
