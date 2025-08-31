
"use client";

import Image from 'next/image';
import { useApp } from '@/context/app-context';
import { Button } from './ui/button';
import { Play } from 'lucide-react';
import type { Track, View } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

interface PlaylistViewProps {
  playlistId: string;
  setView: (view: View) => void;
}

export default function PlaylistView({ playlistId, setView }: PlaylistViewProps) {
  const { playlists, dispatch } = useApp();
  const playlist = playlists.find((p) => p.id === playlistId);

  const handlePlay = (track: Track) => {
    dispatch({ type: 'SET_CURRENT_TRACK', payload: track });
    setView({ type: 'player', track });
  };
  
  const handlePlayPlaylist = () => {
    if (playlist && playlist.tracks.length > 0) {
        handlePlay(playlist.tracks[0]);
    }
  }

  if (!playlist) {
    return <div className="p-6 text-center py-10">Playlist not found.</div>;
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-end gap-6">
        <div className="w-48 h-48 bg-secondary rounded-lg flex items-center justify-center shadow-lg">
             <Image
                src={playlist.tracks[0]?.thumbnail || "https://picsum.photos/seed/playlist/200/200"}
                alt={playlist.name}
                width={192}
                height={192}
                className="rounded-lg aspect-square object-cover"
                data-ai-hint="abstract music"
            />
        </div>
        <div>
            <h2 className="text-sm uppercase tracking-widest">Playlist</h2>
            <h1 className="text-5xl md:text-7xl font-black font-headline tracking-tighter">{playlist.name}</h1>
            <p className="text-muted-foreground mt-2">{playlist.tracks.length} songs</p>
            <Button onClick={handlePlayPlaylist} className="mt-4" size="lg" disabled={playlist.tracks.length === 0}>
                <Play className="mr-2 h-5 w-5 fill-current" />
                Play
            </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="hidden md:table-cell">Artist</TableHead>
            <TableHead className="w-20"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {playlist.tracks.map((track, index) => (
            <TableRow key={`${track.id}-${index}`} className="group cursor-pointer" onDoubleClick={() => handlePlay(track)}>
              <TableCell className="text-muted-foreground">{index + 1}</TableCell>
              <TableCell>
                <div className="flex items-center gap-4">
                     <Image
                        src={track.thumbnail}
                        alt={track.title}
                        width={40}
                        height={40}
                        className="rounded-md aspect-square object-cover"
                        data-ai-hint="album cover"
                    />
                    <div>
                        <div className="font-medium">{track.title}</div>
                        <div className="text-muted-foreground md:hidden">{track.artist}</div>
                    </div>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground hidden md:table-cell">{track.artist}</TableCell>
              <TableCell>
                 <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100" onClick={() => handlePlay(track)}>
                    <Play className="h-5 w-5"/>
                 </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
