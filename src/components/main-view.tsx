
"use client";

import type { Dispatch, SetStateAction } from 'react';
import type { View } from '@/lib/types';
import AppHeader from './app-header';
import DiscoverView from './discover-view';
import RecommendationsView from './recommendations-view';
import PlaylistView from './playlist-view';
import SearchView from './search-view';
import LoginPage from '@/app/login/page';
import SignupPage from '@/app/signup/page';
import ForgotPasswordPage from '@/app/forgot-password/page';
import { useApp } from '@/context/app-context';
import { SidebarInset } from './ui/sidebar';


interface MainViewProps {
  view: View;
  setView: Dispatch<SetStateAction<View>>;
}

export default function MainView({ view, setView }: MainViewProps) {
    const { loggedInUser } = useApp();

    if (!loggedInUser) {
        if (view.type === 'signup') {
            return <SignupPage />;
        }
        if (view.type === 'forgot-password') {
            return <ForgotPasswordPage />;
        }
        return <LoginPage />;
    }

    return (
    <SidebarInset className="flex-1 flex flex-col">
      <AppHeader view={view} setView={setView} />
      <div className="flex-1 p-6 overflow-y-auto">
        {view.type === 'discover' && <DiscoverView setView={setView} initialResults={view.results} />}
        {view.type === 'recommendations' && <RecommendationsView />}
        {view.type === 'playlist' && <PlaylistView playlistId={view.playlistId} />}
        {view.type === 'search' && <SearchView query={view.query} setView={setView} initialResults={view.results} />}
      </div>
    </SidebarInset>
  );
}
