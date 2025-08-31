
"use client";

import { useState, useEffect, type Dispatch, type SetStateAction } from 'react';
import { searchYoutube } from '@/lib/actions';
import type { Track, View } from '@/lib/types';
import TrackCard from './track-card';
import { MusicalNotesLoader } from './ui/gears-loader';
import { useDebounce } from '@/hooks/use-debounce';

interface SearchViewProps {
  query: string;
  setView: Dispatch<SetStateAction<View>>;
  initialResults?: Track[];
}

export default function SearchView({ query, setView, initialResults }: SearchViewProps) {
  const [results, setResults] = useState<Track[]>(initialResults || []);
  const [isLoading, setIsLoading] = useState(!initialResults);
  const debouncedQuery = useDebounce(query, 500); // 500ms debounce

  useEffect(() => {
    // Only search if the debounced query is not empty.
    const fetchResults = async () => {
      if (!debouncedQuery) {
        setResults([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      const tracks = await searchYoutube(debouncedQuery);
      setResults(tracks);
      setIsLoading(false);
      // Update the view in the parent with the results, to preserve them on navigation
      setView({ type: 'search', query: debouncedQuery, results: tracks });
    };

    fetchResults();
  // We only want to re-run this effect when the *debounced* query changes.
  }, [debouncedQuery, setView]);

  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-3xl font-bold font-headline mb-1">
          Search results for "{query}"
        </h2>
      </div>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-10 gap-4">
          <MusicalNotesLoader size="lg" />
          <p className="text-lg text-muted-foreground">Searching...</p>
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
