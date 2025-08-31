
"use client";

import Image from 'next/image';
import { Plus, Play } from 'lucide-react';
import type { Track, View } from '@/lib/types';
import { useApp } from '@/context/app-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AddToPlaylistDialog } from './add-to-playlist-dialog';
import { useToast } from '@/hooks/use-toast';

interface TrackCardProps {
  track: Track;
  setView: (view: View) => void;
}

export default function TrackCard({ track, setView }: TrackCardProps) {
  const { dispatch, defaultPlaylistId, playlists } = useApp();
  const { toast } = useToast();

  const handlePlay = () => {
    dispatch({ type: 'SET_CURRENT_TRACK', payload: track });
    setView({ type: 'player', track });
  };
  
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
    <Card className="group overflow-hidden relative border-0 bg-secondary/50 hover:bg-secondary transition-colors duration-300">
      <CardContent className="p-4">
        <div className="overflow-hidden rounded-md mb-4 relative">
          <Image
            src={track.thumbnail}
            alt={track.title}
            width={300}
            height={300}
            className="aspect-square object-cover w-full transition-transform duration-500 ease-in-out group-hover:scale-110"
            data-ai-hint="album cover"
          />
           <Button
            size="icon"
            className="absolute bottom-2 right-2 z-10 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg transition-all scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100"
            onClick={handlePlay}
            aria-label={`Play ${track.title}`}
          >
            <Play className="h-6 w-6 fill-current" />
          </Button>
        </div>
        <div className="flex items-start justify-between">
            <div>
                <h3 className="font-semibold text-lg truncate">{track.title}</h3>
                <p className="text-sm text-muted-foreground">{track.artist}</p>
            </div>
            <AddToPlaylistDialog 
              onSave={(name) => handleCreateAndAddToPlaylist(name)} 
              onSelectPlaylist={(id) => handleAddToPlaylist(id)}
              onQuickAdd={defaultPlaylistId ? handleQuickAdd : undefined}
              triggerButton={
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground -mr-2">
                    <Plus className="h-5 w-5" />
                </Button>
            }/>
        </div>
      </CardContent>
    </Card>
  );
}
