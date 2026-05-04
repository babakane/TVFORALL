"use client";

import { useState, useEffect, useCallback } from "react";
import type { Channel } from "@/lib/channels";

const FAVORITES_KEY = "timetv-favorites";
const RECENT_KEY = "timetv-recent";
const MAX_RECENT = 20;

interface RecentChannel extends Channel {
  watchedAt: number;
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Channel[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch {
        setFavorites([]);
      }
    }
    setIsLoaded(true);
  }, []);

  const addFavorite = useCallback((channel: Channel) => {
    setFavorites((prev) => {
      if (prev.some((c) => c.id === channel.id && c.url === channel.url)) {
        return prev;
      }
      const updated = [...prev, channel];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeFavorite = useCallback((channel: Channel) => {
    setFavorites((prev) => {
      const updated = prev.filter(
        (c) => !(c.id === channel.id && c.url === channel.url)
      );
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const toggleFavorite = useCallback(
    (channel: Channel) => {
      const isFav = favorites.some(
        (c) => c.id === channel.id && c.url === channel.url
      );
      if (isFav) {
        removeFavorite(channel);
      } else {
        addFavorite(channel);
      }
    },
    [favorites, addFavorite, removeFavorite]
  );

  const isFavorite = useCallback(
    (channel: Channel) => {
      return favorites.some(
        (c) => c.id === channel.id && c.url === channel.url
      );
    },
    [favorites]
  );

  return { favorites, addFavorite, removeFavorite, toggleFavorite, isFavorite, isLoaded };
}

export function useRecentChannels() {
  const [recentChannels, setRecentChannels] = useState<RecentChannel[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(RECENT_KEY);
    if (stored) {
      try {
        setRecentChannels(JSON.parse(stored));
      } catch {
        setRecentChannels([]);
      }
    }
    setIsLoaded(true);
  }, []);

  const addToRecent = useCallback((channel: Channel) => {
    setRecentChannels((prev) => {
      // Remove existing entry if present
      const filtered = prev.filter(
        (c) => !(c.id === channel.id && c.url === channel.url)
      );
      // Add to front with timestamp
      const updated: RecentChannel[] = [
        { ...channel, watchedAt: Date.now() },
        ...filtered,
      ].slice(0, MAX_RECENT);
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearRecent = useCallback(() => {
    setRecentChannels([]);
    localStorage.removeItem(RECENT_KEY);
  }, []);

  return { recentChannels, addToRecent, clearRecent, isLoaded };
}
