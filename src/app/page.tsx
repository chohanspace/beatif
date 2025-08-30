"use client";

import { useState, type Dispatch, type SetStateAction } from 'react';
import { useApp } from '@/context/app-context';
import AppSidebar from '@/components/app-sidebar';
import MainView from '@/components/main-view';
import PlayerBar from '@/components/player-bar';
import type { View } from '@/lib/types';
import LoginView from '@/components/login-view';
import { SidebarProvider } from '@/components/ui/sidebar';

function BeatifApp() {
  const { currentTrack, loggedInUser } = useApp();
  const [view, setView] = useState<View>({ type: 'discover' });

  if (!loggedInUser) {
    return <LoginView setView={setView} />;
  }

  return (
    <SidebarProvider>
      <div className="h-screen w-full flex flex-col bg-background text-foreground">
        <div className="flex flex-1 overflow-hidden">
          <AppSidebar view={view} setView={setView} />
          <MainView view={view} setView={setView} />
        </div>
        {currentTrack && <PlayerBar track={currentTrack} />}
      </div>
    </SidebarProvider>
  );
}

export default function Home() {
  return <BeatifApp />;
}
