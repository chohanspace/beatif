
"use client";

import Image from 'next/image';
import { Music, Maximize2 } from 'lucide-react';
import { useApp } from '@/context/app-context';
import { Button } from './ui/button';

interface PlayerBarProps {
  setView: (view: any) => void;
}

export default function PlayerBar({ setView }: PlayerBarProps) {
  const { currentTrack } = useApp();
  
  if (!currentTrack) return null;

  return (
    <footer className="w-full h-20 bg-card border-t p-2 md:p-4 flex items-center justify-between gap-4 md:gap-6">
      <div className="flex items-center gap-2 md:gap-4 min-w-0">
        <Image
          src={currentTrack.thumbnail}
          alt={currentTrack.title}
          width={56}
          height={56}
          className="rounded-md aspect-square object-cover"
          data-ai-hint="album cover"
        />
        <div className="min-w-0">
          <h3 className="font-semibold truncate text-sm md:text-base">{currentTrack.title}</h3>
          <p className="text-xs md:text-sm text-muted-foreground truncate">{currentTrack.artist}</p>
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
          onClick={() => setView({ type: 'player' })}
          aria-label="Expand player"
          className="w-12 h-12"
        >
          <Maximize2 className="w-6 h-6" />
        </Button>
      </div>
    </footer>
  );
}
