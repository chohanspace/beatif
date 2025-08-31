
"use client";

import { useEffect, type Dispatch, type SetStateAction } from 'react';
import PlayerView from '@/components/player-view';
import { useApp } from '@/context/app-context';
import type { View } from '@/lib/types';

interface PlayerViewWrapperProps {
  setView: Dispatch<SetStateAction<View>>;
}

export default function PlayerViewWrapper({ setView }: PlayerViewWrapperProps) {
  const { playerRef } = useApp();

  useEffect(() => {
    const playerContainer = document.getElementById('player-container');
    const globalPlayerContainer = document.getElementById('global-player-container');
    const playerIframe = playerRef?.current?.firstChild;

    if (playerIframe) {
      if (playerContainer && playerIframe.parentElement !== playerContainer) {
        playerContainer.appendChild(playerIframe as Node);
      }
    }

    return () => {
      // On unmount, move the player back to the global container
      if (globalPlayerContainer && playerIframe && playerIframe.parentElement !== globalPlayerContainer) {
        globalPlayerContainer.appendChild(playerIframe as Node);
      }
    };
  }, [playerRef]);

  return <PlayerView setView={setView} />;
}
