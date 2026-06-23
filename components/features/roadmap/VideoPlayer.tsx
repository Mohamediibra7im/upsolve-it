"use client";

import {useEffect, useState, useRef} from "react";
import {Loader2} from "lucide-react";
import {FaLock} from "react-icons/fa6";

type ProgressPayload = {
  currentTime: number;
  duration: number;
  percent: number;
};

type VideoPlayerProps = {
  youtubeUrl: string;
  initialSeekSeconds?: number;
  onProgress?: (payload: ProgressPayload) => void;
  url?: string;
  isLocked?: boolean;
  completeOnEnd?: boolean;
};

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: any;
  }
}

// Function to extract video ID from various YouTube URL formats
function getYouTubeId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

const VideoPlayer = ({
  youtubeUrl,
  initialSeekSeconds = 0,
  onProgress,
  url,
  isLocked = false,
}: VideoPlayerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const intervalRef = useRef<any>(null);

  const videoUrl = youtubeUrl || url || "";

  // Keep references to onProgress and initialSeekSeconds to prevent resetting player on updates
  const onProgressRef = useRef(onProgress);
  useEffect(() => {
    onProgressRef.current = onProgress;
  }, [onProgress]);

  const initialSeekRef = useRef(initialSeekSeconds);
  useEffect(() => {
    initialSeekRef.current = initialSeekSeconds;
  }, [initialSeekSeconds]);

  useEffect(() => {
    if (isLocked || !videoUrl) return;
    const videoId = getYouTubeId(videoUrl);
    if (!videoId) return;

    let player: any = null;

    const initializePlayer = () => {
      if (!containerRef.current || !window.YT || !window.YT.Player) return;

      // Ensure container is empty before initializing
      containerRef.current.innerHTML = '<div class="absolute inset-0 w-full h-full"></div>';
      const playerDiv = containerRef.current.firstElementChild;

      player = new window.YT.Player(playerDiv, {
        videoId: videoId,
        playerVars: {
          start: Math.floor(initialSeekRef.current),
          rel: 0,
          modestbranding: 1,
          showinfo: 0,
          fs: 1,
          playsinline: 1,
          controls: 1,
        },
        events: {
          onReady: (event: any) => {
            playerRef.current = event.target;
            setIsReady(true);
            if (initialSeekRef.current > 0) {
              event.target.seekTo(initialSeekRef.current, true);
            }
          },
          onStateChange: (event: any) => {
            // YT.PlayerState.PLAYING is 1
            if (event.data === 1) {
              startTracking();
            } else {
              stopTracking();
            }
          },
        },
      });
    };

    const startTracking = () => {
      stopTracking();
      intervalRef.current = setInterval(() => {
        if (playerRef.current && playerRef.current.getCurrentTime) {
          const currentTime = playerRef.current.getCurrentTime() || 0;
          const duration = playerRef.current.getDuration() || 0;
          if (duration > 0) {
            const percent = Math.min(
              100,
              Math.max(0, (currentTime / duration) * 100),
            );
            onProgressRef.current?.({
              currentTime,
              duration,
              percent,
            });
          }
        }
      }, 1000);
    };

    const stopTracking = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    // Load API script if not loaded
    if (!window.YT) {
      // Check if script is already present in document
      const existingScript = document.querySelector(
        'script[src="https://www.youtube.com/iframe_api"]',
      );
      if (!existingScript) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }

      const previousCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (previousCallback) previousCallback();
        initializePlayer();
      };
    } else {
      initializePlayer();
    }

    return () => {
      stopTracking();
      if (player) {
        try {
          player.destroy();
        } catch (e) {
          console.error("Error destroying YT player", e);
        }
      }
    };
  }, [videoUrl, isLocked]);

  return (
    <div className="relative w-full aspect-video flex items-center justify-center bg-zinc-950 overflow-hidden border border-border/40 shadow-2xl">
      {/* Loading State Overlay */}
      {!isReady && !isLocked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 w-full gap-3 aspect-video z-10 pointer-events-none">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground animate-pulse">
            Loading session player...
          </p>
        </div>
      )}

      {/* Locked State Overlay */}
      {isLocked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 w-full gap-3 aspect-video z-10">
          <FaLock className="size-8 text-primary animate-bounce" />
          <p className="text-sm font-semibold text-zinc-300">
            This topic is locked
          </p>
        </div>
      )}

      {/* Div where YT Player will mount */}
      {!isLocked && videoUrl && (
        <div ref={containerRef} className="absolute inset-0 size-full" />
      )}
    </div>
  );
};

export default VideoPlayer;
