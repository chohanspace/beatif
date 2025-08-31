
"use client";

import { useEffect, useState, useRef, type Dispatch, type SetStateAction } from 'react';
import type { Track, View, Playlist } from '@/lib/types';
import { useApp } from '@/context/app-context';
import { Button } from './ui/button';
import { ChevronDown, SkipBack, SkipForward, Pause, Play } from 'lucide-react';

interface PlayerViewProps {
  track: Track;
  setView: Dispatch<SetStateAction<View>>;
}

export default function PlayerView({ track, setView }: PlayerViewProps) {
  const { dispatch, playlists, currentTrack } = useApp();
  const [isPlaying, setIsPlaying] = useState(true);
  const playerRef = useRef<any>(null);
  const [key, setKey] = useState(Date.now());

  useEffect(() => {
    // This effect ensures the view updates if the currentTrack changes from another component
    if (currentTrack && currentTrack.id !== track.id) {
      setView({ type: 'player', track: currentTrack });
    }
  }, [currentTrack, track.id, setView]);
  
  useEffect(() => {
     // Force re-render of iframe when track changes
     setKey(Date.now());
     setIsPlaying(true);
  }, [track]);


  const findNextTrack = () => {
    let nextTrack: Track | null = null;
    // A bit of a hacky way to find the "current playlist"
    // A better implementation would have a dedicated queue management system
    const currentPlaylist = playlists.find(p => p.tracks.some(t => t.id === track.id));

    if (currentPlaylist) {
        const trackIndex = currentPlaylist.tracks.findIndex(t => t.id === track.id);
        if (trackIndex > -1 && trackIndex < currentPlaylist.tracks.length - 1) {
            nextTrack = currentPlaylist.tracks[trackIndex + 1];
        }
    }
    return nextTrack;
  }

  const onEnded = () => {
    const nextTrack = findNextTrack();
    if (nextTrack) {
        dispatch({ type: 'SET_CURRENT_TRACK', payload: nextTrack });
    } else {
        setIsPlaying(false);
    }
  };
  
  const handleNext = () => {
    const nextTrack = findNextTrack();
    if (nextTrack) {
      dispatch({ type: 'SET_CURRENT_TRACK', payload: nextTrack });
    }
  };

  const handlePrev = () => {
    let prevTrack: Track | null = null;
    const currentPlaylist = playlists.find(p => p.tracks.some(t => t.id === track.id));

    if (currentPlaylist) {
        const trackIndex = currentPlaylist.tracks.findIndex(t => t.id === track.id);
        if (trackIndex > 0) {
            prevTrack = currentPlaylist.tracks[trackIndex - 1];
        }
    }
    
    if (prevTrack) {
      dispatch({ type: 'SET_CURRENT_TRACK', payload: prevTrack });
    } else {
        // If it's the first track, just replay it
        playerRef.current?.seekTo(0);
        playerRef.current?.playVideo();
        setIsPlaying(true);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      playerRef.current?.pauseVideo();
    } else {
      playerRef.current?.playVideo();
    }
    setIsPlaying(!isPlaying);
  };
  
  const handlePlayerReady = (event: any) => {
    playerRef.current = event.target;
    if(isPlaying) {
        playerRef.current.playVideo();
    }
  }

  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-b from-secondary to-background text-foreground">
      <header className="p-4 flex justify-between items-center">
        <Button variant="ghost" size="icon" onClick={() => setView({ type: 'discover' })}>
          <ChevronDown className="h-6 w-6" />
        </Button>
        <div className="text-center">
            <p className="text-sm uppercase text-muted-foreground">Now Playing</p>
        </div>
        <div className="w-10"></div>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 gap-8">
        <div className="w-full max-w-2xl aspect-video rounded-xl shadow-2xl overflow-hidden bg-black">
          <iframe
            key={key}
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${track.youtubeId}?autoplay=1&controls=0&enablejsapi=1&rel=0&showinfo=0&iv_load_policy=3&modestbranding=1`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={(e) => {
                const YT = (window as any).YT;
                if(YT && YT.Player) {
                    new YT.Player(e.target, {
                        events: {
                            'onReady': handlePlayerReady,
                            'onStateChange': (event: any) => {
                                if (event.data === YT.PlayerState.ENDED) {
                                    onEnded();
                                }
                            }
                        }
                    });
                }
            }}
          ></iframe>
        </div>
        
        <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold font-headline">{track.title}</h1>
            <p className="text-lg md:text-xl text-muted-foreground mt-2">{track.artist}</p>
        </div>

        <div className="flex items-center justify-center gap-6">
            <Button variant="ghost" size="icon" className="h-16 w-16" onClick={handlePrev}>
                <SkipBack className="h-8 w-8" />
            </Button>
             <Button variant="default" size="icon" className="h-20 w-20 rounded-full" onClick={togglePlay}>
                {isPlaying ? <Pause className="h-10 w-10" /> : <Play className="h-10 w-10 fill-current" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-16 w-16" onClick={handleNext}>
                <SkipForward className="h-8 w-8" />
            </Button>
        </div>
      </main>
    </div>
  );
}
