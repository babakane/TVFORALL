"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Channel } from "@/lib/channels";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Tv2,
  X,
  RefreshCw,
  Radio,
  PictureInPicture2,
  SkipForward,
  Volume1,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type Hls from "hls.js";

interface VideoPlayerProps {
  channel: Channel | null;
  onClose: () => void;
  onNextChannel?: () => void;
}

export function VideoPlayer({ channel, onClose, onNextChannel }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPiP, setIsPiP] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [quality, setQuality] = useState<string>("auto");
  const [availableQualities, setAvailableQualities] = useState<string[]>([]);

  useEffect(() => {
    if (!channel || !videoRef.current) return;

    const video = videoRef.current;
    setError(null);
    setIsLoading(true);
    setIsPlaying(false);
    setAvailableQualities([]);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const loadVideo = async () => {
      // Dynamically import HLS.js only on client side
      const HlsModule = await import("hls.js");
      const Hls = HlsModule.default;

      // Use proxy URL to avoid CORS issues
      const proxyUrl = `/api/stream?url=${encodeURIComponent(channel.url)}`;

      if (channel.url.includes(".m3u8") && Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          maxBufferSize: 30 * 1000 * 1000,
          maxBufferLength: 30,
          startLevel: -1,
          xhrSetup: (xhr, url) => {
            // Don't modify URLs that already go through our proxy
            if (!url.startsWith("/api/stream")) {
              xhr.open("GET", `/api/stream?url=${encodeURIComponent(url)}`, true);
            }
          },
        });

        hls.loadSource(proxyUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
          setIsLoading(false);
          const qualities = data.levels.map((level) => 
            level.height ? `${level.height}p` : "auto"
          );
          setAvailableQualities(["auto", ...new Set(qualities.filter(q => q !== "auto"))]);
          video.play().catch(() => {
            setError("Click play to start streaming");
          });
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            setIsLoading(false);
            setError("Stream unavailable. Try another channel.");
          }
        });

        hlsRef.current = hls;
      } else if (
        video.canPlayType("application/vnd.apple.mpegurl") ||
        !channel.url.includes(".m3u8")
      ) {
        // Use proxy for native HLS (Safari) or non-HLS streams
        video.src = proxyUrl;
        video.load();

        video.onloadeddata = () => {
          setIsLoading(false);
          video.play().catch(() => {
            setError("Click play to start streaming");
          });
        };

        video.onerror = () => {
          setIsLoading(false);
          setError("Stream unavailable. Try another channel.");
        };
      } else {
        setIsLoading(false);
        setError("HLS not supported in this browser");
      }
    };

    loadVideo();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [channel]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handlePiPEnter = () => setIsPiP(true);
    const handlePiPExit = () => setIsPiP(false);

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("enterpictureinpicture", handlePiPEnter);
    video.addEventListener("leavepictureinpicture", handlePiPExit);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("enterpictureinpicture", handlePiPEnter);
      video.removeEventListener("leavepictureinpicture", handlePiPExit);
    };
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };

    const handleTouchStart = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 4000);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("touchstart", handleTouchStart);
    }

    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("touchstart", handleTouchStart);
      }
      clearTimeout(timeout);
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!channel) return;
      
      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "m":
          toggleMute();
          break;
        case "f":
          toggleFullscreen();
          break;
        case "escape":
          if (isFullscreen) {
            document.exitFullscreen();
          } else {
            onClose();
          }
          break;
        case "arrowup":
          e.preventDefault();
          handleVolumeChange(Math.min(1, volume + 0.1));
          break;
        case "arrowdown":
          e.preventDefault();
          handleVolumeChange(Math.max(0, volume - 0.1));
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [channel, isFullscreen, volume]);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  const handleVolumeChange = useCallback((newVolume: number) => {
    if (!videoRef.current) return;
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    if (newVolume === 0) {
      setIsMuted(true);
      videoRef.current.muted = true;
    } else if (isMuted) {
      setIsMuted(false);
      videoRef.current.muted = false;
    }
  }, [isMuted]);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  }, []);

  const togglePiP = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.error("PiP error:", err);
    }
  }, []);

  const retry = useCallback(async () => {
    if (channel && videoRef.current) {
      setError(null);
      setIsLoading(true);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      
      const HlsModule = await import("hls.js");
      const Hls = HlsModule.default;
      
      const proxyUrl = `/api/stream?url=${encodeURIComponent(channel.url)}`;
      
      if (channel.url.includes(".m3u8") && Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          xhrSetup: (xhr, url) => {
            if (!url.startsWith("/api/stream")) {
              xhr.open("GET", `/api/stream?url=${encodeURIComponent(url)}`, true);
            }
          },
        });
        hls.loadSource(proxyUrl);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsLoading(false);
          videoRef.current?.play().catch(() => {});
        });
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            setIsLoading(false);
            setError("Stream unavailable");
          }
        });
        hlsRef.current = hls;
      } else {
        videoRef.current.src = proxyUrl;
        videoRef.current.load();
      }
    }
  }, [channel]);

  const VolumeIcon = volume === 0 || isMuted ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  if (!channel) {
    return (
      <div className="w-full aspect-video bg-card rounded-2xl flex flex-col items-center justify-center gap-4 border border-border">
        <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
          <Tv2 className="w-10 h-10 text-muted-foreground" />
        </div>
        <div className="text-center px-4">
          <h2 className="text-xl font-semibold text-foreground">
            Select a Channel
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Choose a channel from the list to start watching
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full bg-black rounded-2xl overflow-hidden border border-border group",
        isFullscreen ? "fixed inset-0 z-50 rounded-none" : "aspect-video"
      )}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain bg-black"
        playsInline
        autoPlay
      />

      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Loading stream...</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90">
          <div className="flex flex-col items-center gap-4 text-center px-4">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <Tv2 className="w-8 h-8 text-destructive" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{error}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={retry}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
              {onNextChannel && (
                <button
                  onClick={onNextChannel}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
                >
                  <SkipForward className="w-4 h-4" />
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Controls overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 transition-opacity duration-300",
          showControls || !isPlaying ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 p-3 sm:p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-destructive/90 backdrop-blur-sm shrink-0">
              <Radio className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-destructive-foreground animate-pulse" />
              <span className="text-[10px] sm:text-xs font-semibold text-destructive-foreground">
                LIVE
              </span>
            </div>
            <h3 className="text-xs sm:text-sm font-semibold text-white bg-black/50 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full truncate">
              {channel.name}
            </h3>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {document.pictureInPictureEnabled && (
              <button
                onClick={togglePiP}
                className={cn(
                  "w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-colors",
                  isPiP ? "bg-primary text-primary-foreground" : "bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white"
                )}
                aria-label="Picture in Picture"
              >
                <PictureInPicture2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors text-white"
              aria-label="Close player"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center play button */}
        {!isPlaying && !isLoading && !error && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center hover:bg-primary transition-colors hover:scale-110 duration-200">
              <Play className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground ml-1" />
            </div>
          </button>
        )}

        {/* Bottom controls */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={togglePlay}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              ) : (
                <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white ml-0.5" />
              )}
            </button>

            {/* Volume control */}
            <div className="flex items-center gap-2 group/volume">
              <button
                onClick={toggleMute}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                <VolumeIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-0 group-hover/volume:w-20 sm:group-hover/volume:w-24 transition-all duration-200 h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full overflow-hidden"
                aria-label="Volume"
              />
            </div>

            <div className="flex-1" />

            {/* Quality selector */}
            {availableQualities.length > 1 && (
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                className="hidden sm:block bg-white/10 backdrop-blur-sm text-white text-xs px-2 py-1.5 rounded-lg border-none outline-none cursor-pointer hover:bg-white/20 transition-colors"
              >
                {availableQualities.map((q) => (
                  <option key={q} value={q} className="bg-black text-white">
                    {q === "auto" ? "Auto" : q}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={toggleFullscreen}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
              aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              ) : (
                <Maximize className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className={cn(
        "absolute bottom-16 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs text-white/70 transition-opacity duration-300 hidden sm:block",
        showControls && !isPlaying ? "opacity-100" : "opacity-0"
      )}>
        Space to play • M to mute • F for fullscreen
      </div>
    </div>
  );
}
