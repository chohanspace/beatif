"use client";

import type { Dispatch, SetStateAction } from 'react';
import { Home, Music, ListMusic, Plus, Bot, Library, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { useApp } from '@/context/app-context';
import type { View } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AddToPlaylistDialog } from '@/components/add-to-playlist-dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AppSidebarProps {
  view: View;
  setView: Dispatch<SetStateAction<View>>;
}

export default function AppSidebar({ view, setView }: AppSidebarProps) {
  const { playlists, dispatch, loggedInUser, setLoggedInUser } = useApp();

  const handleCreatePlaylist = (name: string) => {
    dispatch({ type: 'CREATE_PLAYLIST', payload: { name, tracks: [] } });
  };
  
  const handleLogout = () => {
    setLoggedInUser(null);
    if(typeof window !== 'undefined') {
        localStorage.removeItem('loggedInUser');
    }
    setView({type: 'discover'});
  }
  
  const NavButton = ({
    label,
    icon,
    isActive,
    onClick,
    disabled = false,
  }: {
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
    disabled?: boolean;
  }) => (
    <Button
      variant="ghost"
      onClick={onClick}
      disabled={disabled}
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
      <div className="flex items-center justify-between gap-2 px-2 pb-4">
        <div className="flex items-center gap-2">
            <Music className="text-primary w-8 h-8"/>
            <h1 className="text-2xl font-bold font-headline">Beatif</h1>
        </div>
        {loggedInUser ? (
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={`https://api.dicebear.com/8.x/bottts/svg?seed=${loggedInUser.email}`} alt={loggedInUser.email} />
                            <AvatarFallback>{loggedInUser.email.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">Logged in as</p>
                            <p className="text-xs leading-none text-muted-foreground truncate">{loggedInUser.email}</p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ) : (
            <Button variant="outline" onClick={() => setView({type: 'login'})}>
                <LogIn className="mr-2 h-4 w-4" /> Login
            </Button>
        )}
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
          disabled={!loggedInUser}
        />
      </nav>
      <Separator className="my-4" />
      <div className="flex-1 overflow-y-auto pr-2">
        <div className="flex justify-between items-center px-2 mb-2">
          <h2 className="text-lg font-semibold tracking-tight font-headline flex items-center gap-2"><Library className="w-5 h-5" /> My Library</h2>
          <AddToPlaylistDialog onSave={handleCreatePlaylist} triggerButton={<Button variant="ghost" size="icon" disabled={!loggedInUser}><Plus className="w-5 h-5" /></Button>} />
        </div>
        {loggedInUser ? (
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
        ) : (
            <div className="px-4 text-center text-muted-foreground text-sm">
                Log in to see your playlists.
            </div>
        )}
      </div>
    </aside>
  );
}
