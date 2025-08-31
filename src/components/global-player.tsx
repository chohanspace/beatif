
"use client";

import { useEffect, useRef } from 'react';
import { useApp } from '@/context/app-context';

export function GlobalPlayer() {
  const { currentTrack, ytPlayer, setYtPlayer, dispatch, playerRef, controls, playerState } = useApp();
  const isReady = useRef(false);

  useEffect(() => {
    const onYouTubeIframeAPIReady = () => {
      if (typeof window.YT === 'undefined' || typeof window.YT.Player === 'undefined' || isReady.current) {
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
            isReady.current = true;
            setYtPlayer(event.target);
          },
          onStateChange: (event: any) => {
            const YT = (window as any).YT;
            if (event.data === YT.PlayerState.PLAYING) {
              const duration = event.target.getDuration ? event.target.getDuration() : 0;
              dispatch({ type: 'SET_PLAYER_STATE', payload: { isPlaying: true, duration }});
            } else if (event.data === YT.PlayerState.PAUSED) {
              dispatch({ type: 'SET_PLAYER_STATE', payload: { isPlaying: false }});
            } else if (event.data === YT.PlayerState.ENDED) {
              dispatch({ type: 'SET_PLAYER_STATE', payload: { isPlaying: false }});
              controls.playNext();
            }
          },
        },
      });
    };

    if (!(window as any).onYouTubeIframeAPIReady) {
      (window as any).onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
    }

    // If the API is already loaded, and we don't have a player, create it.
    if ((window as any).YT?.Player && !ytPlayer) {
       onYouTubeIframeAPIReady();
    }
  }, [setYtPlayer, dispatch, controls, ytPlayer]);

  useEffect(() => {
    if (ytPlayer && currentTrack) {
        if(ytPlayer.getVideoData()?.video_id !== currentTrack.youtubeId) {
            ytPlayer.loadVideoById(currentTrack.youtubeId);
        } else {
            ytPlayer.playVideo();
        }
    } else if (ytPlayer && !currentTrack) {
        ytPlayer.stopVideo();
    }
  }, [currentTrack, ytPlayer]);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout | null = null;

    if (playerState.isPlaying && ytPlayer) {
      progressInterval = setInterval(() => {
        const progress = ytPlayer.getCurrentTime ? ytPlayer.getCurrentTime() : 0;
        if (progress !== playerState.progress) {
          dispatch({ type: 'SET_PLAYER_STATE', payload: { progress } });
        }
      }, 500);
    }

    return () => {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };
  }, [playerState.isPlaying, ytPlayer, dispatch]); // Removed playerState.progress to avoid re-running interval constantly


  return (
    <div
      ref={playerRef}
      id="global-player-container"
      style={{
        position: 'fixed',
        top: '-9999px',
        left: '-9999px',
        width: '1px',
        height: '1px',
      }}
    >
      <div id="yt-player-iframe" />
    </div>
  );
}
