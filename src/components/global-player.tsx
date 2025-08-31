
"use client";

import { useEffect } from 'react';
import { useApp } from '@/context/app-context';

export function GlobalPlayer() {
  const { playerRef } = useApp();

  return (
    // The player iframe is kept in a hidden div to play audio in the background
    // It is teleported into the main view when the player page is active.
    <div
      id="global-player-container"
      style={{
        position: 'fixed',
        top: '-9999px',
        left: '-9999px',
        width: '1px',
        height: '1px',
      }}
    >
      <div id="yt-player-iframe" ref={playerRef} />
    </div>
  );
}
