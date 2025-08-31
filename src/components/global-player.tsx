
"use client";

import { useEffect } from 'react';
import { useApp } from '@/context/app-context';

export function GlobalPlayer() {
  const { currentTrack, ytPlayer, setYtPlayer, dispatch, playerRef, controls } = useApp();

  useEffect(() => {
    // Function to be called when the YouTube IFrame API is ready
    const onYouTubeIframeAPIReady = () => {
      // Ensure the API is loaded and we don't already have a player
      if (typeof window.YT === 'undefined' || typeof window.YT.Player === 'undefined' || ytPlayer) {
        return;
      }
      
      const player = new (window as any).YT.Player('yt-player-iframe', {
        height: '100%',
        width: '100%',
        playerVars: {
          autoplay: 1,
          controls: 0,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event: any) => {
            // Once the player is ready, store its instance in our context
            setYtPlayer(event.target);
          },
          onStateChange: (event: any) => {
            const YT = (window as any).YT;
            if (event.data === YT.PlayerState.PLAYING) {
              // When video starts playing, update state and get duration
              const duration = event.target.getDuration() || 0;
              dispatch({ type: 'SET_PLAYER_STATE', payload: { isPlaying: true, duration }});
            } else if (event.data === YT.PlayerState.PAUSED) {
              dispatch({ type: 'SET_PLAYER_STATE', payload: { isPlaying: false }});
            } else if (event.data === YT.PlayerState.ENDED) {
              // When video ends, mark as not playing and play the next track
              dispatch({ type: 'SET_PLAYER_STATE', payload: { isPlaying: false }});
              controls.playNext();
            }
          },
        },
      });
    };

    // If the API is not yet attached to the window, attach our ready function
    if (!(window as any).onYouTubeIframeAPIReady) {
      (window as any).onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
    }
    
    // If the API is already loaded but we don't have a player yet, initialize it
    if ((window as any).YT?.Player && !ytPlayer) {
       onYouTubeIframeAPIReady();
    }

  }, [setYtPlayer, dispatch, controls, ytPlayer]);

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
