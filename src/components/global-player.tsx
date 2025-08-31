
"use client";

import { useEffect } from 'react';
import { useApp } from '@/context/app-context';

export function GlobalPlayer() {
  const { currentTrack, ytPlayer, playerRef } = useApp();

  // Effect to control the player when the current track changes
  useEffect(() => {
    if (ytPlayer && currentTrack) {
        // If the player is ready and there's a new track, load and play it
        if(ytPlayer.getVideoData()?.video_id !== currentTrack.youtubeId) {
            ytPlayer.loadVideoById(currentTrack.youtubeId);
        } else {
            // If it's the same track, just ensure it plays
            ytPlayer.playVideo?.();
        }
    } else if (ytPlayer && !currentTrack) {
        // If there's no track, stop the video
        ytPlayer.stopVideo?.();
    }
  }, [currentTrack, ytPlayer]);

  return (
    // The player iframe is kept in a hidden div to play audio in the background
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
      <div id="yt-player-iframe" ref={playerRef as any} />
    </div>
  );
}

    