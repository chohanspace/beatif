
"use client";

import { useEffect, useRef } from 'react';
import { useApp } from '@/context/app-context';

export function GlobalPlayer() {
  const { currentTrack, ytPlayer, setYtPlayer, dispatch, playerRef, controls } = useApp();
  const isReady = useRef(false);

  useEffect(() => {
    const onYouTubeIframeAPIReady = () => {
      // Ensure YT and YT.Player are available before creating a new player
      if (typeof window.YT === 'undefined' || typeof window.YT.Player === 'undefined') {
        console.error('YouTube Player API not ready.');
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
              dispatch({ type: 'SET_PLAYER_STATE', payload: { isPlaying: true, duration: ytPlayer?.getDuration() || 0 }});
            } else if (event.data === YT.PlayerState.PAUSED) {
              dispatch({ type: 'SET_PLAYER_STATE', payload: { isPlaying: false }});
            } else if (event.data === YT.PlayerState.ENDED) {
              controls.playNext();
            }
          },
        },
      });
    };

    if (!(window as any).onYouTubeIframeAPIReady) {
      (window as any).onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
    }

    if ((window as any).YT && (window as any).YT.Player && !ytPlayer) {
       onYouTubeIframeAPIReady();
    }
  }, [setYtPlayer, dispatch, controls, ytPlayer]);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    
    if (ytPlayer && currentTrack) {
        if(ytPlayer.getVideoData()?.video_id !== currentTrack.youtubeId) {
            ytPlayer.loadVideoById(currentTrack.youtubeId);
        }
        dispatch({ type: 'SET_PLAYER_STATE', payload: { isPlaying: true } });
    } else if (ytPlayer && !currentTrack) {
        ytPlayer.stopVideo();
        dispatch({ type: 'SET_PLAYER_STATE', payload: { isPlaying: false } });
    }
    
    if (ytPlayer) {
      progressInterval = setInterval(() => {
        const progress = ytPlayer.getCurrentTime ? ytPlayer.getCurrentTime() : 0;
        const duration = ytPlayer.getDuration ? ytPlayer.getDuration() : 0;
        dispatch({ type: 'SET_PLAYER_STATE', payload: { progress, duration } });
      }, 500);
    }
    
    return () => {
        if (progressInterval) clearInterval(progressInterval);
    };

  }, [currentTrack, ytPlayer, dispatch]);


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
