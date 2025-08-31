
"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import { Star } from 'lucide-react';

interface AddToPlaylistDialogProps {
  onSave: (name: string) => void;
  onSelectPlaylist?: (playlistId: string) => void;
  onQuickAdd?: () => void; // For adding to default playlist
  triggerButton: React.ReactElement;
}

export function AddToPlaylistDialog({ onSave, onSelectPlaylist, onQuickAdd, triggerButton }: AddToPlaylistDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [view, setView] = useState<'select' | 'create'>('select');
  const { playlists, defaultPlaylistId } = useApp();
  const { toast } = useToast();

  const handleSave = () => {
    if (newPlaylistName.trim()) {
      onSave(newPlaylistName.trim());
      toast({ title: 'Playlist Created', description: `"${newPlaylistName.trim()}" has been created.` });
      setNewPlaylistName('');
      setIsOpen(false);
      setView('select');
    }
  };
  
  const handleSelect = (playlistId: string, playlistName: string) => {
    if(onSelectPlaylist) {
        onSelectPlaylist(playlistId);
        toast({ title: 'Track Added', description: `Added to "${playlistName}".` });
        setIsOpen(false);
    }
  }

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuickAdd) {
      onQuickAdd();
    } else {
      setIsOpen(true);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild onClick={handleTriggerClick}>
        {triggerButton}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
        {view === 'select' ? (
          <>
            <DialogHeader>
              <DialogTitle>Add to playlist</DialogTitle>
              <DialogDescription>Select a playlist or create a new one.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-2 py-4 max-h-64 overflow-y-auto">
              {playlists.map(p => (
                <Button key={p.id} variant="ghost" onClick={() => handleSelect(p.id, p.name)} className="justify-between">
                  {p.name}
                  {p.id === defaultPlaylistId && <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />}
                </Button>
              ))}
            </div>
            <DialogFooter>
              <Button onClick={() => setView('create')}>Create New Playlist</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Create new playlist</DialogTitle>
              <DialogDescription>Give your new playlist a name.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="col-span-3"
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setView('select')}>Back</Button>
              <Button onClick={handleSave}>Save playlist</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
