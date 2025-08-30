"use client";

import { useState, type Dispatch, type SetStateAction } from 'react';
import { useApp } from '@/context/app-context';
import AppSidebar from '@/components/app-sidebar';
import MainView from '@/components/main-view';
import PlayerBar from '@/components/player-bar';
import type { View } from '@/lib/types';

function BeatifApp() {
  const { currentTrack } = useApp();
  const [view, setView] = useState<View>({ type: 'discover' });

  return (
    <div className="h-screen w-full flex bg-background text-foreground">
      <AppSidebar view={view} setView={setView} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <MainView view={view} setView={setView} />
        </main>
        {currentTrack && <PlayerBar track={currentTrack} />}
      </div>
    </div>
  );
}

export default function Home() {
  return <BeatifApp />;
}
