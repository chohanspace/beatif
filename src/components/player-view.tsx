
"use client";

import { useEffect, useState, useRef, type Dispatch, type SetStateAction } from 'react';
import type { Track, View } from '@/lib/types';
import { useApp } from '@/context/app-context';
import { Button } from './ui/button';
import { ChevronDown, SkipBack, SkipForward, Pause, Play, Rewind, FastForward, ListPlus } from 'lucide-react';
import { Slider } from './ui/slider';
import { AddToPlaylistDialog } from './add-to-playlist-dialog';
import { useToast } from '@/hooks/use-toast';

interface PlayerViewProps {
  track: Track;
  setView: Dispatch<SetStateAction<View>>;
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export default function PlayerView({ track, setView }: PlayerViewProps) {
  const { dispatch, playlists, currentTrack, defaultPlaylistId } = useApp();
  const [isPlaying, setIsPlaying] = useState(true);
  const playerRef = useRef<any>(null);
  const [key, setKey] = useState(Date.now());
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (currentTrack && currentTrack.id !== track.id) {
      setView({ type: 'player', track: currentTrack });
    }
  }, [currentTrack, track.id, setView]);
  
  useEffect(() => {
     setKey(Date.now());
     setIsPlaying(true);
     setProgress(0);
     setDuration(0);
     if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
  }, [track]);

  useEffect(() => {
    if (isPlaying && playerRef.current?.getCurrentTime) {
      progressIntervalRef.current = setInterval(() => {
        const currentTime = playerRef.current.getCurrentTime();
        const videoDuration = playerRef.current.getDuration();
        if (videoDuration > 0) {
            setDuration(videoDuration);
            setProgress(currentTime);
        }
      }, 500);
    } else {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    }

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isPlaying]);


  const findNextTrack = () => {
    let nextTrack: Track | null = null;
    const currentPlaylist = playlists.find(p => p.tracks.some(t => t.id === track.id));

    if (currentPlaylist) {
        const trackIndex = currentPlaylist.tracks.findIndex(t => t.id === track.id);
        if (trackIndex > -1 && trackIndex < currentPlaylist.tracks.length - 1) {
            nextTrack = currentPlaylist.tracks[trackIndex + 1];
        }
    }
    return nextTrack;
  }
  
  const findPrevTrack = () => {
    let prevTrack: Track | null = null;
    const currentPlaylist = playlists.find(p => p.tracks.some(t => t.id === track.id));

    if (currentPlaylist) {
        const trackIndex = currentPlaylist.tracks.findIndex(t => t.id === track.id);
        if (trackIndex > 0) {
            prevTrack = currentPlaylist.tracks[trackIndex - 1];
        }
    }
    return prevTrack;
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
    const prevTrack = findPrevTrack();
    if (prevTrack) {
      dispatch({ type: 'SET_CURRENT_TRACK', payload: prevTrack });
    } else {
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

  const handleSeek = (direction: 'forward' | 'backward') => {
      if (!playerRef.current) return;
      const currentTime = playerRef.current.getCurrentTime();
      const newTime = direction === 'forward' ? currentTime + 10 : currentTime - 10;
      playerRef.current.seekTo(Math.max(0, newTime), true);
  }
  
  const handleSliderChange = (value: number[]) => {
      if (!playerRef.current) return;
      const newTime = value[0];
      setProgress(newTime);
      playerRef.current.seekTo(newTime, true);
  }
  
  const handlePlayerReady = (event: any) => {
    playerRef.current = event.target;
    const videoDuration = playerRef.current.getDuration();
    if (videoDuration > 0) {
        setDuration(videoDuration);
    }
    if(isPlaying) {
        playerRef.current.playVideo();
    }
  }

  const handleAddToPlaylist = (playlistId: string) => {
    dispatch({ type: 'ADD_TRACK_TO_PLAYLIST', payload: { playlistId, track } });
  }
  
  const handleQuickAdd = () => {
    if (defaultPlaylistId) {
      dispatch({ type: 'ADD_TRACK_TO_PLAYLIST', payload: { playlistId: defaultPlaylistId, track } });
      const playlist = playlists.find(p => p.id === defaultPlaylistId);
      toast({ title: 'Track Added', description: `Added to "${playlist?.name || 'your default playlist'}".` });
    }
  }

  const handleCreateAndAddToPlaylist = (name: string) => {
    dispatch({ type: 'CREATE_PLAYLIST', payload: { name, tracks: [track] } });
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
      
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 gap-4 md:gap-8">
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
                                if (event.data === YT.PlayerState.PLAYING) {
                                    setIsPlaying(true);
                                    const videoDuration = event.target.getDuration();
                                    if(videoDuration > 0) setDuration(videoDuration);
                                }
                                if (event.data === YT.PlayerState.PAUSED) setIsPlaying(false);
                                if (event.data === YT.PlayerState.ENDED) onEnded();
                            }
                        }
                    });
                }
            }}
          ></iframe>
        </div>
        
        <div className="w-full max-w-2xl">
            <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                    <h1 className="text-2xl md:text-4xl font-bold font-headline truncate">{track.title}</h1>
                    <p className="text-base md:text-xl text-muted-foreground mt-2">{track.artist}</p>
                </div>
                <AddToPlaylistDialog
                  onSave={handleCreateAndAddToPlaylist}
                  onSelectPlaylist={handleAddToPlaylist}
                  onQuickAdd={defaultPlaylistId ? handleQuickAdd : undefined}
                  triggerButton={
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground -ml-2 flex-shrink-0">
                        <ListPlus className="h-6 w-6" />
                    </Button>
                  }
                />
            </div>
            
            <div className="mt-4">
                 <Slider 
                    value={[progress]}
                    max={duration}
                    onValueChange={handleSliderChange}
                    disabled={!duration}
                 />
                 <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>{formatTime(progress)}</span>
                    <span>{formatTime(duration)}</span>
                 </div>
            </div>
        </div>


        <div className="flex items-center justify-center w-full max-w-md gap-2 md:gap-4">
            <Button variant="ghost" size="icon" className="h-12 w-12 md:h-16 md:w-16" onClick={handlePrev} disabled={!findPrevTrack()}>
                <SkipBack className="h-6 w-6 md:h-8 md:w-8" />
            </Button>
            <Button variant="ghost" size="icon" className="h-12 w-12 md:h-16 md:w-16" onClick={() => handleSeek('backward')} disabled={!duration}>
                <Rewind className="h-6 w-6 md:h-8 md:w-8" />
            </Button>
             <Button variant="default" size="icon" className="h-16 w-16 md:h-20 md:w-20 rounded-full" onClick={togglePlay} disabled={!duration}>
                {isPlaying ? <Pause className="h-8 w-8 md:h-10 md:w-10 fill-current" /> : <Play className="h-8 w-8 md:h-10 md:w-10 fill-current" />}
            </Button>
             <Button variant="ghost" size="icon" className="h-12 w-12 md:h-16 md:w-16" onClick={() => handleSeek('forward')} disabled={!duration}>
                <FastForward className="h-6 w-6 md:h-8 md:w-8" />
            </Button>
            <Button variant="ghost" size="icon" className="h-12 w-12 md:h-16 md:w-16" onClick={handleNext} disabled={!findNextTrack()}>
                <SkipForward className="h-6 w-6 md:h-8 md:w-8" />
            </Button>
        </div>
      </main>
    </div>
  );
}

    