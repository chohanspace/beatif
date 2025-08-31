
"use client";

import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import type { View } from '@/lib/types';
import { useApp } from '@/context/app-context';
import { Button } from './ui/button';
import { ChevronDown, SkipBack, SkipForward, Pause, Play, Rewind, FastForward, ListPlus } from 'lucide-react';
import { Slider } from './ui/slider';
import { AddToPlaylistDialog } from './add-to-playlist-dialog';
import { useToast } from '@/hooks/use-toast';

interface PlayerViewProps {
  setView: Dispatch<SetStateAction<View>>;
}

function formatTime(seconds: number) {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export default function PlayerView({ setView }: PlayerViewProps) {
  const { 
    currentTrack, 
    dispatch, 
    playlists, 
    defaultPlaylistId,
    playerState,
    controls
  } = useApp();
  const { toast } = useToast();
  
  const [sliderValue, setSliderValue] = useState([0]);
  const [isSeeking, setIsSeeking] = useState(false);

  useEffect(() => {
    if (!currentTrack) {
        setView({ type: 'discover' });
    }
  }, [currentTrack, setView]);
  
  useEffect(() => {
      if (!isSeeking) {
        setSliderValue([playerState.progress]);
      }
  }, [playerState.progress, isSeeking]);

  if (!currentTrack) {
    return null;
  }

  const handleAddToPlaylist = (playlistId: string) => {
    dispatch({ type: 'ADD_TRACK_TO_PLAYLIST', payload: { playlistId, track: currentTrack } });
  }
  
  const handleQuickAdd = () => {
    if (defaultPlaylistId) {
      dispatch({ type: 'ADD_TRACK_TO_PLAYLIST', payload: { playlistId: defaultPlaylistId, track: currentTrack } });
      const playlist = playlists.find(p => p.id === defaultPlaylistId);
      toast({ title: 'Track Added', description: `Added to "${playlist?.name || 'your default playlist'}".` });
    }
  }

  const handleCreateAndAddToPlaylist = (name: string) => {
    dispatch({ type: 'CREATE_PLAYLIST', payload: { name, tracks: [currentTrack] } });
  }
  
  const handleSliderValueChange = (value: number[]) => {
      setSliderValue(value);
      setIsSeeking(true);
  }
  
  const handleSliderCommit = (value: number[]) => {
      controls.seek(value[0]);
      setIsSeeking(false);
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
        <div 
            id="player-container" 
            className="w-full max-w-2xl aspect-video rounded-xl shadow-2xl overflow-hidden bg-black"
        >
            {/* The global player iframe will be teleported here */}
        </div>
        
        <div className="w-full max-w-2xl">
            <div className="flex items-center justify-between">
                <div className="text-center flex-1 min-w-0">
                    <h1 className="text-xl md:text-2xl font-bold font-headline truncate px-2">{currentTrack.title}</h1>
                    <p className="text-base md:text-lg text-muted-foreground mt-1">{currentTrack.artist}</p>
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
                    value={sliderValue}
                    max={playerState.duration}
                    onValueChange={handleSliderValueChange}
                    onValueCommit={handleSliderCommit}
                    disabled={!playerState.duration || playerState.duration === 0}
                 />
                 <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>{formatTime(sliderValue[0])}</span>
                    <span>{formatTime(playerState.duration)}</span>
                 </div>
            </div>
        </div>


        <div className="flex items-center justify-center w-full max-w-md gap-2 md:gap-4">
            <Button variant="ghost" size="icon" className="h-12 w-12 md:h-16 md:w-16" onClick={controls.playPrev} disabled={!controls.canPlayPrev()}>
                <SkipBack className="h-6 w-6 md:h-8 md:w-8" />
            </Button>
            <Button variant="ghost" size="icon" className="h-12 w-12 md:h-16 md:w-16" onClick={() => controls.seek(playerState.progress - 10)} disabled={!playerState.duration}>
                <Rewind className="h-6 w-6 md:h-8 md:w-8" />
            </Button>
             <Button variant="default" size="icon" className="h-16 w-16 md:h-20 md:w-20 rounded-full" onClick={controls.togglePlay} disabled={!playerState.duration}>
                {playerState.isPlaying ? <Pause className="h-8 w-8 md:h-10 md:w-10 fill-current" /> : <Play className="h-8 w-8 md:h-10 md:w-10 fill-current ml-1" />}
            </Button>
             <Button variant="ghost" size="icon" className="h-12 w-12 md:h-16 md:w-16" onClick={() => controls.seek(playerState.progress + 10)} disabled={!playerState.duration}>
                <FastForward className="h-6 w-6 md:h-8 md:w-8" />
            </Button>
            <Button variant="ghost" size="icon" className="h-12 w-12 md:h-16 md:w-16" onClick={controls.playNext} disabled={!controls.canPlayNext()}>
                <SkipForward className="h-6 w-6 md:h-8 md:w-8" />
            </Button>
        </div>
      </main>
    </div>
  );
}
