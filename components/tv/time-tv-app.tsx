"use client";

import { useState, useCallback, useMemo } from "react";
import useSWR from "swr";
import { Sidebar, type ExtendedCategoryKey } from "./sidebar";
import { VideoPlayer } from "./video-player";
import { ChannelGrid } from "./channel-grid";
import { Menu, Trash2 } from "lucide-react";
import type { Channel, CategoryKey } from "@/lib/channels";
import { IPTV_CATEGORIES, parseM3U } from "@/lib/channels";
import { useFavorites, useRecentChannels } from "@/hooks/use-tv-storage";

const fetcher = async (category: string): Promise<Channel[]> => {
  try {
    const url = IPTV_CATEGORIES[category as CategoryKey];
    if (!url) throw new Error("Invalid category");
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch");
    const text = await response.text();
    return parseM3U(text);
  } catch {
    return [];
  }
};

const categoryNames: Record<CategoryKey | "favorites" | "recent", string> = {
  all: "All Channels",
  news: "News",
  entertainment: "Entertainment",
  sports: "Sports",
  movies: "Movies",
  music: "Music",
  kids: "Kids",
  documentary: "Documentary",
  education: "Education",
  lifestyle: "Lifestyle",
  cooking: "Cooking",
  travel: "Travel",
  animation: "Animation",
  classic: "Classic",
  comedy: "Comedy",
  culture: "Culture",
  general: "General",
  outdoor: "Outdoor",
  relax: "Relax",
  religious: "Religious",
  science: "Science",
  series: "Series",
  shop: "Shopping",
  weather: "Weather",
  xxx: "Adult",
  favorites: "Favorites",
  recent: "Recently Watched",
};

export function TimeTvApp() {
  const [selectedCategory, setSelectedCategory] =
    useState<ExtendedCategoryKey>("news");
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  // Hooks for favorites and recent channels
  const { favorites, toggleFavorite, isFavorite, isLoaded: favoritesLoaded } = useFavorites();
  const { recentChannels, addToRecent, clearRecent, isLoaded: recentLoaded } = useRecentChannels();

  // Only fetch from API if it's a category (not favorites or recent)
  const isSpecialCategory =
    selectedCategory === "favorites" || selectedCategory === "recent";

  const { data: fetchedChannels = [], isLoading } = useSWR(
    isSpecialCategory ? null : selectedCategory,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
      keepPreviousData: true,
    }
  );

  // Determine which channels to display
  const displayChannels = useMemo(() => {
    if (selectedCategory === "favorites") {
      return favorites;
    }
    if (selectedCategory === "recent") {
      return recentChannels;
    }
    return fetchedChannels;
  }, [selectedCategory, favorites, recentChannels, fetchedChannels]);

  const channelCounts: Record<string, number> = useMemo(() => ({
    [selectedCategory]: displayChannels.length,
  }), [selectedCategory, displayChannels.length]);

  const handleSelectChannel = useCallback(
    (channel: Channel) => {
      setActiveChannel(channel);
      addToRecent(channel);
      // Scroll to top on mobile when selecting a channel
      if (window.innerWidth < 1024) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [addToRecent]
  );

  const handleClosePlayer = useCallback(() => {
    setActiveChannel(null);
  }, []);

  const handleNextChannel = useCallback(() => {
    if (!activeChannel) return;
    const currentIndex = displayChannels.findIndex(
      (ch) => ch.url === activeChannel.url
    );
    if (currentIndex < displayChannels.length - 1) {
      const nextChannel = displayChannels[currentIndex + 1];
      setActiveChannel(nextChannel);
      addToRecent(nextChannel);
    }
  }, [activeChannel, displayChannels, addToRecent]);

  const handleCategoryChange = useCallback((category: ExtendedCategoryKey) => {
    setSelectedCategory(category);
    setActiveChannel(null);
    setSearchQuery("");
    setSelectedLanguage(null);
  }, []);

  const isLoadingState =
    isLoading || (isSpecialCategory && (!favoritesLoaded || !recentLoaded));

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategoryChange}
        channelCounts={channelCounts}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        favoritesCount={favorites.length}
        recentCount={recentChannels.length}
      />

      <main className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between gap-3 px-3 sm:px-4 py-2.5 sm:py-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-1 rounded-lg hover:bg-secondary active:bg-secondary/80 transition-colors touch-manipulation"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
              </button>
              <h1 className="text-base sm:text-lg font-bold text-foreground truncate">
                TimeTv
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {selectedCategory === "recent" && recentChannels.length > 0 && (
                <button
                  onClick={clearRecent}
                  className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-destructive hover:bg-destructive/10 active:bg-destructive/20 rounded-lg transition-colors touch-manipulation"
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Clear History</span>
                </button>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8">
          {activeChannel && (
            <div className="mb-4 sm:mb-6 lg:mb-8">
              <VideoPlayer 
                channel={activeChannel} 
                onClose={handleClosePlayer}
                onNextChannel={displayChannels.length > 1 ? handleNextChannel : undefined}
              />
            </div>
          )}

          <ChannelGrid
            channels={displayChannels}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelectChannel={handleSelectChannel}
            activeChannel={activeChannel}
            isLoading={isLoadingState}
            categoryName={categoryNames[selectedCategory]}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
            selectedLanguage={selectedLanguage}
            onSelectLanguage={setSelectedLanguage}
          />
        </div>
      </main>
    </div>
  );
}
