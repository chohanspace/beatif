
"use client";

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import type { Track } from '@/lib/types';
import { useApp } from '@/context/app-context';

interface PlayerBarProps {
  track: Track;
}

export default function PlayerBar({ track }: PlayerBarProps) {
  const [showPlayer, setShowPlayer] = useState(false);
  const { playlists, currentTrack, dispatch } = useApp();
  const [key, setKey] = useState(Date.now());

  useEffect(() => {
    setShowPlayer(false);
    const timer = setTimeout(() => {
        setKey(Date.now()); // Force re-render of iframe
        setShowPlayer(true)
    }, 100);
    return () => clearTimeout(timer);
  }, [track]);

  const onEnded = () => {
    // Find the currently playing track in any playlist or discover view to find the next track
    // This is a simplified approach. A more robust solution might involve a dedicated queue.
    let nextTrack: Track | null = null;
    
    // Check playlists first
    for (const playlist of playlists) {
        const trackIndex = playlist.tracks.findIndex(t => t.id === currentTrack?.id);
        if (trackIndex > -1 && trackIndex < playlist.tracks.length - 1) {
            nextTrack = playlist.tracks[trackIndex + 1];
            break;
        }
    }
    
    // In a real app, you might also check the context of the 'discover' or 'search' view.
    // For now, we just handle playlists.
    
    if (nextTrack) {
        dispatch({ type: 'SET_CURRENT_TRACK', payload: nextTrack });
    }
  };


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
            key={key}
            width="100%"
            height="80"
            src={`https://www.youtube.com/embed/${track.youtubeId}?autoplay=1&controls=1&enablejsapi=1`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="rounded-lg"
            onLoad={(e) => {
                const player = new (window as any).YT.Player(e.target, {
                    events: {
                        'onStateChange': (event: any) => {
                            if (event.data === (window as any).YT.PlayerState.ENDED) {
                                onEnded();
                            }
                        }
                    }
                });
            }}
          ></iframe>
        )}
      </div>
      <div className="w-64"></div>
    </footer>
  );
}
