"use client";

import type { Dispatch, SetStateAction } from 'react';
import type { View } from '@/lib/types';
import AppHeader from './app-header';
import DiscoverView from './discover-view';
import RecommendationsView from './recommendations-view';
import PlaylistView from './playlist-view';
import SearchView from './search-view';
import LoginView from './login-view';
import { useApp } from '@/context/app-context';
import { SidebarInset } from './ui/sidebar';


interface MainViewProps {
  view: View;
  setView: Dispatch<SetStateAction<View>>;
}

export default function MainView({ view, setView }: MainViewProps) {
    const { loggedInUser } = useApp();

    return (
    <SidebarInset className="flex-1 flex flex-col">
      <AppHeader view={view} setView={setView} />
      <div className="flex-1 p-6 overflow-y-auto">
        {view.type === 'discover' && <DiscoverView setView={setView} initialResults={view.results} />}
        {view.type === 'recommendations' && (loggedInUser ? <RecommendationsView /> : <p>Please log in to get recommendations.</p>)}
        {view.type === 'playlist' && <PlaylistView playlistId={view.playlistId} />}
        {view.type === 'search' && <SearchView query={view.query} setView={setView} initialResults={view.results} />}
        {view.type === 'login' && <LoginView setView={setView} />}
      </div>
    </SidebarInset>
  );
}
