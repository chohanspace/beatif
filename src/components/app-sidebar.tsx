
"use client";

import type { Dispatch, SetStateAction } from 'react';
import { Home, Music, ListMusic, Plus, Bot, Library, LogOut, TrendingUp } from 'lucide-react';
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
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from './ui/sidebar';

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
        localStorage.removeItem('jwt');
    }
  }
  
  if (!loggedInUser) return null;

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
                 <SidebarMenuItem>
                    <SidebarMenuButton
                        onClick={() => setView({ type: 'trending' })}
                        isActive={view.type === 'trending'}
                        tooltip="Trending"
                    >
                         <TrendingUp />
                        <span>Trending</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        onClick={() => setView({ type: 'recommendations' })}
                        isActive={view.type === 'recommendations'}
                        tooltip="For You"
                    >
                        <Bot />
                        <span>For You</span>
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
                            <span>{playlist.name}</span>
                        </SidebarMenuButton>
                     </SidebarMenuItem>
                ))}
            </SidebarMenu>

        </SidebarContent>
    </Sidebar>
  );
}
