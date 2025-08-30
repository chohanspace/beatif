"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { Track } from '@/lib/types';

interface PlayerBarProps {
  track: Track;
}

export default function PlayerBar({ track }: PlayerBarProps) {
  const [showPlayer, setShowPlayer] = useState(false);

  useEffect(() => {
    // Use a timeout to allow CSS transitions to happen smoothly
    const timer = setTimeout(() => setShowPlayer(true), 100);
    return () => clearTimeout(timer);
  }, [track]);

  if (!track) return null;

  return (
    <footer className="w-full h-24 bg-card border-t p-4 flex items-center justify-between gap-6 transition-transform duration-500 ease-in-out">
      <div className="flex items-center gap-4 min-w-0">
        <Image
          src={track.thumbnail}
          alt={track.title}
          width={56}
          height={56}
          className="rounded-md aspect-square object-cover"
          data-ai-hint="album cover"
        />
        <div className="min-w-0">
          <h3 className="font-semibold truncate">{track.title}</h3>
          <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
        </div>
      </div>
      <div className="w-full max-w-lg">
        {showPlayer && (
          <iframe
            width="100%"
            height="80"
            src={`https://www.youtube.com/embed/${track.youtubeId}?autoplay=1&controls=1`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="rounded-lg"
          ></iframe>
        )}
      </div>
      <div className="w-64"></div>
    </footer>
  );
}
