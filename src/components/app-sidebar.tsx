"use client";

import type { Dispatch, SetStateAction } from 'react';
import { Home, Music, ListMusic, Plus, Bot, Library } from 'lucide-react';
import { useApp } from '@/context/app-context';
import type { View } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AddToPlaylistDialog } from '@/components/add-to-playlist-dialog';

interface AppSidebarProps {
  view: View;
  setView: Dispatch<SetStateAction<View>>;
}

export default function AppSidebar({ view, setView }: AppSidebarProps) {
  const { playlists, dispatch } = useApp();

  const handleCreatePlaylist = (name: string) => {
    dispatch({ type: 'CREATE_PLAYLIST', payload: { name, tracks: [] } });
  };
  
  const NavButton = ({
    label,
    icon,
    isActive,
    onClick,
  }: {
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
  }) => (
    <Button
      variant="ghost"
      onClick={onClick}
      className={cn(
        'w-full justify-start text-base',
        isActive && 'bg-primary/20 text-primary-foreground hover:bg-primary/30'
      )}
    >
      {icon}
      <span>{label}</span>
    </Button>
  );

  return (
    <aside className="w-64 flex-shrink-0 p-4 pr-0 flex flex-col bg-background border-r">
      <div className="flex items-center gap-2 px-2 pb-4">
        <Music className="text-primary w-8 h-8"/>
        <h1 className="text-2xl font-bold font-headline">Beatif</h1>
      </div>
      <nav className="flex flex-col gap-1 px-2">
        <NavButton
          label="Discover"
          icon={<Home className="w-5 h-5 mr-3" />}
          isActive={view.type === 'discover'}
          onClick={() => setView({ type: 'discover' })}
        />
        <NavButton
          label="For You"
          icon={<Bot className="w-5 h-5 mr-3" />}
          isActive={view.type === 'recommendations'}
          onClick={() => setView({ type: 'recommendations' })}
        />
      </nav>
      <Separator className="my-4" />
      <div className="flex-1 overflow-y-auto pr-2">
        <div className="flex justify-between items-center px-2 mb-2">
          <h2 className="text-lg font-semibold tracking-tight font-headline flex items-center gap-2"><Library className="w-5 h-5" /> My Library</h2>
          <AddToPlaylistDialog onSave={handleCreatePlaylist} triggerButton={<Button variant="ghost" size="icon"><Plus className="w-5 h-5" /></Button>} />
        </div>
        <div className="flex flex-col gap-1 px-2">
          {playlists.map((playlist) => (
            <Button
              key={playlist.id}
              variant="ghost"
              onClick={() => setView({ type: 'playlist', playlistId: playlist.id })}
              className={cn(
                'w-full justify-start truncate',
                view.type === 'playlist' && view.playlistId === playlist.id && 'bg-accent/50 text-accent-foreground'
              )}
            >
              <ListMusic className="w-4 h-4 mr-3 flex-shrink-0" />
              <span className="truncate">{playlist.name}</span>
            </Button>
          ))}
        </div>
      </div>
    </aside>
  );
}
