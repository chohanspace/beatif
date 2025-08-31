
"use client";

import type { Dispatch, SetStateAction } from 'react';
import type { View } from '@/lib/types';
import AppHeader from './app-header';
import DiscoverView from './discover-view';
import PlaylistView from './playlist-view';
import SearchView from './search-view';
import SettingsPage from '@/app/settings/page';
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

    const renderContent = () => {
        if (!loggedInUser) {
            switch (view.type) {
                case 'signup': return <SignupPage />;
                case 'forgot-password': return <ForgotPasswordPage />;
                default: return <LoginPage />;
            }
        }
    
        switch (view.type) {
            case 'discover': return <DiscoverView setView={setView} />;
            case 'playlist': return <PlaylistView playlistId={view.playlistId} />;
            case 'search': return <SearchView query={view.query} setView={setView} initialResults={view.results} />;
            case 'settings': return <SettingsPage />;
            default: return <DiscoverView setView={setView} />;
        }
    }


    return (
    <SidebarInset className="flex-1 flex flex-col">
      <AppHeader view={view} setView={setView} />
      <div className="flex-1 p-6 overflow-y-auto">
        {renderContent()}
      </div>
    </SidebarInset>
  );
}
