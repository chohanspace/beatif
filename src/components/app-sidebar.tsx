
"use client";

import type { Dispatch, SetStateAction } from 'react';
import { Home, Music, ListMusic, Plus, Library, LogOut, Settings, MoreHorizontal, Edit, Trash2, Star, Sun, Moon } from 'lucide-react';
import { useApp } from '@/context/app-context';
import type { View, User } from '@/lib/types';
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
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from './ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import { RenamePlaylistDialog } from './rename-playlist-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { signOut, useSession } from 'next-auth/react';


interface AppSidebarProps {
  view: View;
  setView: Dispatch<SetStateAction<View>>;
}

export default function AppSidebar({ view, setView }: AppSidebarProps) {
  const { playlists, dispatch, loggedInUser, setLoggedInUser, defaultPlaylistId, theme, setTheme } = useApp();
  const { data: session } = useSession();
  const { toast } = useToast();

  const handleCreatePlaylist = (name: string) => {
    dispatch({ type: 'CREATE_PLAYLIST', payload: { name, tracks: [] } });
  };
  
  const handleLogout = () => {
    if (session) {
      signOut({ callbackUrl: '/login' });
    }
    setLoggedInUser(null);
    if(typeof window !== 'undefined') {
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('jwt');
    }
  }

  const handleNavigateToSettings = () => {
    setView({ type: 'settings' });
  };
  
  const handleRenamePlaylist = (id: string, newName: string) => {
    if (newName && newName.trim()) {
        dispatch({ type: 'RENAME_PLAYLIST', payload: { id, newName: newName.trim() } });
        toast({ title: "Playlist Renamed", description: `Renamed to "${newName.trim()}".` });
    }
  }

  const handleDeletePlaylist = (id: string) => {
    const playlist = playlists.find(p => p.id === id);
    if (!playlist) return;

    dispatch({ type: 'DELETE_PLAYLIST', payload: { id } });
    toast({ title: "Playlist Deleted", description: `"${playlist.name}" has been deleted.` });
    
    if (view.type === 'playlist' && view.playlistId === id) {
        setView({ type: 'discover' });
    }
  }

  const handleSetDefaultPlaylist = (id: string) => {
    dispatch({ type: 'SET_DEFAULT_PLAYLIST', payload: { id } });
    toast({ title: 'Default Playlist Set' });
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  if (!loggedInUser) return null;

  const userImage = loggedInUser.image || `https://api.dicebear.com/8.x/bottts/svg?seed=${loggedInUser.email}`;
  const userName = loggedInUser.name || loggedInUser.email;


  return (
    <Sidebar collapsible="icon" className="border-r">
        <SidebarHeader>
            <div className="flex items-center justify-between gap-2 px-2">
                <div className="flex items-center gap-2 overflow-hidden">
                    <Music className="text-primary w-8 h-8 flex-shrink-0"/>
                    <h1 className="text-2xl font-bold font-headline truncate">Beatif</h1>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={userImage} alt={userName} />
                                <AvatarFallback>{userName.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{userName}</p>
                                <p className="text-xs leading-none text-muted-foreground truncate">{loggedInUser.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                         <DropdownMenuItem onClick={handleNavigateToSettings}>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </DropdownMenuItem>
                         <DropdownMenuItem onClick={toggleTheme}>
                            {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                            <span>{theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </SidebarHeader>

        <SidebarContent>
            <SidebarMenu>
                 <SidebarMenuItem>
                    <SidebarMenuButton
                        onClick={() => setView({ type: 'discover' })}
                        isActive={view.type === 'discover'}
                        tooltip="Discover"
                    >
                         <Home />
                        <span>Discover</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
            
            <Separator className="my-2" />

             <div className="flex justify-between items-center px-4 mb-2">
                <h2 className="text-lg font-semibold tracking-tight font-headline flex items-center gap-2"><Library className="w-5 h-5" /> My Library</h2>
                <AddToPlaylistDialog onSave={handleCreatePlaylist} triggerButton={<Button variant="ghost" size="icon"><Plus className="w-5 h-5" /></Button>} />
            </div>
            
            <SidebarMenu>
                {playlists.map((playlist) => (
                     <SidebarMenuItem key={playlist.id}>
                        <SidebarMenuButton
                            onClick={() => setView({ type: 'playlist', playlistId: playlist.id })}
                            isActive={view.type === 'playlist' && view.playlistId === playlist.id}
                            tooltip={playlist.name}
                        >
                            <ListMusic />
                            <span className="flex-1">{playlist.name}</span>
                             {playlist.id === defaultPlaylistId && <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />}
                        </SidebarMenuButton>
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                 <Button variant="ghost" size="icon" className="absolute right-1 top-1 h-7 w-7">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <RenamePlaylistDialog 
                                    playlistName={playlist.name}
                                    onRename={(newName) => handleRenamePlaylist(playlist.id, newName)}
                                >
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        <span>Rename</span>
                                    </DropdownMenuItem>
                                </RenamePlaylistDialog>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            <span>Delete</span>
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete the playlist "{playlist.name}".
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeletePlaylist(playlist.id)}>Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>

                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleSetDefaultPlaylist(playlist.id)} disabled={playlist.id === defaultPlaylistId}>
                                    <Star className="mr-2 h-4 w-4" />
                                    <span>Set as Default</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                     </SidebarMenuItem>
                ))}
            </SidebarMenu>

        </SidebarContent>
    </Sidebar>
  );
}
