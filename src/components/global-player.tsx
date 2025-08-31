
"use client";

import { useEffect, useRef } from 'react';
import { useApp } from '@/context/app-context';

export function GlobalPlayer() {
  const { currentTrack, setYtPlayer, dispatch, playerRef, controls } = useApp();
  const isReady = useRef(false);

  useEffect(() => {
    const onYouTubeIframeAPIReady = () => {
      const player = new (window as any).YT.Player('yt-player-iframe', {
        height: '100%',
        width: '100%',
        // videoId is removed from initialization to prevent crash
        playerVars: {
          autoplay: 1,
          controls: 0,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          modestbranding: 1
        },
        events: {
          onReady: (event: any) => {
            isReady.current = true;
            setYtPlayer(event.target);
          },
          onStateChange: (event: any) => {
            const YT = (window as any).YT;
            if (event.data === YT.PlayerState.PLAYING) {
              dispatch({ type: 'SET_PLAYER_STATE', payload: { isPlaying: true, duration: event.target.getDuration() }});
            } else if (event.data === YT.PlayerState.PAUSED) {
              dispatch({ type: 'SET_PLAYER_STATE', payload: { isPlaying: false }});
            } else if (event.data === YT.PlayerState.ENDED) {
              controls.playNext();
            }
          },
        },
      });
    };

    if (!(window as any).YT) {
      (window as any).onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
    } else {
       onYouTubeIframeAPIReady();
    }
  }, [setYtPlayer, dispatch, controls]);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    const player = (playerRef?.current?.firstChild as any)?.contentWindow?.player;
    if (player && isReady.current) {
        if (currentTrack) {
            player.loadVideoById(currentTrack.youtubeId);
            dispatch({ type: 'SET_PLAYER_STATE', payload: { isPlaying: true } });
        } else {
            player.stopVideo();
            dispatch({ type: 'SET_PLAYER_STATE', payload: { isPlaying: false } });
        }
    }
    
    if (player) {
      progressInterval = setInterval(() => {
        const progress = player.getCurrentTime ? player.getCurrentTime() : 0;
        const duration = player.getDuration ? player.getDuration() : 0;
        dispatch({ type: 'SET_PLAYER_STATE', payload: { progress, duration } });
      }, 500);
    }
    
    return () => {
        if (progressInterval) clearInterval(progressInterval);
    };

  }, [currentTrack, playerRef, dispatch]);


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
