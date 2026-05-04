"use client";

import { useState, memo } from "react";
import Image from "next/image";
import { Tv2, Play, Radio, Heart } from "lucide-react";
import type { Channel } from "@/lib/channels";
import { cn } from "@/lib/utils";

interface ChannelCardProps {
  channel: Channel;
  onSelect: (channel: Channel) => void;
  isActive: boolean;
  isFavorite: boolean;
  onToggleFavorite: (channel: Channel) => void;
}

export const ChannelCard = memo(function ChannelCard({
  channel,
  onSelect,
  isActive,
  isFavorite,
  onToggleFavorite,
}: ChannelCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  return (
    <div
      className={cn(
        "group relative w-full aspect-video rounded-xl overflow-hidden transition-all duration-300",
        "hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10",
        "active:scale-[0.98]",
        isActive
          ? "ring-2 ring-primary shadow-lg shadow-primary/20"
          : "bg-card hover:ring-1 hover:ring-border",
        isPressed && "scale-[0.98]"
      )}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
    >
      {/* Background */}
      <button
        onClick={() => onSelect(channel)}
        className="absolute inset-0 bg-gradient-to-br from-secondary to-muted w-full h-full touch-manipulation"
        aria-label={`Watch ${channel.name}`}
      >
        {channel.logo && !imageError ? (
          <Image
            src={channel.logo || "/placeholder.svg"}
            alt={channel.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-contain p-4 opacity-80 group-hover:opacity-100 transition-opacity"
            onError={() => setImageError(true)}
            unoptimized
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Tv2 className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground/50" />
          </div>
        )}
      </button>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent pointer-events-none" />

      {/* Live indicator */}
      <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-destructive/90 backdrop-blur-sm">
        <Radio className="w-2 h-2 sm:w-3 sm:h-3 text-destructive-foreground animate-pulse" />
        <span className="text-[10px] sm:text-xs font-semibold text-destructive-foreground">
          LIVE
        </span>
      </div>

      {/* Favorite button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(channel);
        }}
        className={cn(
          "absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 rounded-full transition-all duration-200 z-10 touch-manipulation",
          isFavorite
            ? "bg-destructive text-destructive-foreground scale-100"
            : "bg-background/60 backdrop-blur-sm text-foreground opacity-0 group-hover:opacity-100 sm:hover:bg-background/80",
          // Always show on touch devices
          "max-sm:opacity-100"
        )}
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart
          className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4", isFavorite && "fill-current")}
        />
      </button>

      {/* Play button */}
      <button
        onClick={() => onSelect(channel)}
        className={cn(
          "absolute inset-0 flex items-center justify-center transition-opacity duration-200 touch-manipulation",
          "opacity-0 group-hover:opacity-100",
          isActive && "opacity-100"
        )}
        aria-hidden="true"
        tabIndex={-1}
      >
        <div
          className={cn(
            "w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-200",
            "group-hover:scale-110 group-active:scale-95",
            isActive ? "bg-primary" : "bg-primary/90 backdrop-blur-sm"
          )}
        >
          <Play className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground ml-0.5" />
        </div>
      </button>

      {/* Channel info */}
      <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-3 pointer-events-none">
        <h3 className="text-xs sm:text-sm font-semibold text-foreground truncate leading-tight">
          {channel.name}
        </h3>
        {(channel.country || channel.language) && (
          <p className="text-[10px] sm:text-xs text-muted-foreground truncate mt-0.5">
            {channel.country}
            {channel.country && channel.language && " • "}
            {channel.language}
          </p>
        )}
      </div>
    </div>
  );
});
