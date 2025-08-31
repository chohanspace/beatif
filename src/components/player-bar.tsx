
"use client";

import Image from 'next/image';
import { Music, Maximize2 } from 'lucide-react';
import type { Track } from '@/lib/types';
import { useApp } from '@/context/app-context';
import { Button } from './ui/button';

interface PlayerBarProps {
  track: Track;
  setView: (view: any) => void;
}

export default function PlayerBar({ track, setView }: PlayerBarProps) {
  if (!track) return null;

  return (
    <footer className="w-full h-20 bg-card border-t p-2 md:p-4 flex items-center justify-between gap-4 md:gap-6">
      <div className="flex items-center gap-2 md:gap-4 min-w-0">
        <Image
          src={track.thumbnail}
          alt={track.title}
          width={56}
          height={56}
          className="rounded-md aspect-square object-cover"
          data-ai-hint="album cover"
        />
        <div className="min-w-0">
          <h3 className="font-semibold truncate text-sm md:text-base">{track.title}</h3>
          <p className="text-xs md:text-sm text-muted-foreground truncate">{track.artist}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Music className="w-5 h-5 md:w-6 md:h-6 animate-pulse text-primary" />
        <span className="text-sm text-muted-foreground hidden lg:inline">Now Playing</span>
      </div>

      <div className="flex items-center justify-end min-w-fit">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setView({ type: 'player', track })}
          aria-label="Expand player"
          className="w-12 h-12"
        >
          <Maximize2 className="w-6 h-6" />
        </Button>
      </div>
    </footer>
  );
}
