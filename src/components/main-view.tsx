
"use client";

import type { Dispatch, SetStateAction } from 'react';
import type { View } from '@/lib/types';
import AppHeader from './app-header';
import DiscoverView from './discover-view';
import PlaylistView from './playlist-view';
import SearchView from './search-view';
import SettingsPage from '@/app/settings/page';
import { useApp } from '@/context/app-context';
import { SidebarInset } from './ui/sidebar';


interface MainViewProps {
  view: View;
  setView: Dispatch<SetStateAction<View>>;
}

export default function MainView({ view, setView }: MainViewProps) {
    const { loggedInUser } = useApp();

    const renderContent = () => {
        if (!loggedInUser) {
           return null; // Should be handled by page.tsx redirect
        }
    
        switch (view.type) {
            case 'discover': return <DiscoverView setView={setView} />;
            case 'playlist': return <PlaylistView playlistId={view.playlistId} setView={setView} />;
            case 'search': return <SearchView query={view.query} setView={setView} initialResults={view.results} />;
            case 'settings': return <SettingsPage />;
            // PlayerView is now rendered at the top level in page.tsx
            default: return <DiscoverView setView={setView} />;
        }
    }

    const showHeader = view.type !== 'player';


    return (
    <SidebarInset className="flex-1 flex flex-col bg-background">
      {showHeader && <AppHeader view={view} setView={setView} />}
      <div className="flex-1 overflow-y-auto">
        {renderContent()}
      </div>
    </SidebarInset>
  );
}
