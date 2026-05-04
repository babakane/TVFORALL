"use client";

import { useMemo, useCallback, useState, useRef, useEffect } from "react";
import { ChannelCard } from "./channel-card";
import type { Channel } from "@/lib/channels";
import { Search, Loader2, X, Filter, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChannelGridProps {
  channels: Channel[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectChannel: (channel: Channel) => void;
  activeChannel: Channel | null;
  isLoading: boolean;
  categoryName: string;
  isFavorite: (channel: Channel) => boolean;
  onToggleFavorite: (channel: Channel) => void;
  selectedLanguage: string | null;
  onSelectLanguage: (language: string | null) => void;
}

const ITEMS_PER_PAGE = 20;

export function ChannelGrid({
  channels,
  searchQuery,
  onSearchChange,
  onSelectChannel,
  activeChannel,
  isLoading,
  categoryName,
  isFavorite,
  onToggleFavorite,
  selectedLanguage,
  onSelectLanguage,
}: ChannelGridProps) {
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get unique languages from channels
  const languages = useMemo(() => {
    const uniqueLangs = new Set(
      channels
        .map((c) => c.language)
        .filter((lang): lang is string => Boolean(lang))
    );
    return Array.from(uniqueLangs).sort();
  }, [channels]);

  const filteredChannels = useMemo(() => {
    return channels.filter((channel) => {
      const matchesSearch = channel.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesLanguage =
        !selectedLanguage || channel.language === selectedLanguage;
      return matchesSearch && matchesLanguage;
    });
  }, [channels, searchQuery, selectedLanguage]);

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE);
  }, [searchQuery, selectedLanguage, categoryName]);

  // Infinite scroll with IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayCount < filteredChannels.length) {
          setDisplayCount((prev) => Math.min(prev + ITEMS_PER_PAGE, filteredChannels.length));
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [displayCount, filteredChannels.length]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowLanguageDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayedChannels = useMemo(() => {
    return filteredChannels.slice(0, displayCount);
  }, [filteredChannels, displayCount]);

  const handleClearSearch = useCallback(() => {
    onSearchChange("");
  }, [onSearchChange]);

  const handleSelectLanguage = useCallback((lang: string | null) => {
    onSelectLanguage(lang);
    setShowLanguageDropdown(false);
  }, [onSelectLanguage]);

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {/* Search and filters bar */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search channels..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 sm:pl-12 pr-10 py-2.5 sm:py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm sm:text-base"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-secondary transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
        
        {/* Language filter dropdown */}
        {languages.length > 1 && (
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              className={cn(
                "flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border transition-all text-sm sm:text-base whitespace-nowrap",
                selectedLanguage
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-foreground hover:border-primary/50"
              )}
            >
              <Filter className="w-4 h-4" />
              <span className="max-w-[100px] truncate">
                {selectedLanguage || "All Languages"}
              </span>
              <ChevronDown className={cn(
                "w-4 h-4 transition-transform",
                showLanguageDropdown && "rotate-180"
              )} />
            </button>

            {showLanguageDropdown && (
              <div className="absolute right-0 sm:left-0 mt-2 w-56 max-h-64 overflow-y-auto bg-card border border-border rounded-xl shadow-xl z-50">
                <button
                  onClick={() => handleSelectLanguage(null)}
                  className={cn(
                    "w-full text-left px-4 py-2.5 text-sm transition-colors",
                    !selectedLanguage
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground hover:bg-secondary"
                  )}
                >
                  All Languages
                </button>
                {languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleSelectLanguage(lang)}
                    className={cn(
                      "w-full text-left px-4 py-2.5 text-sm transition-colors",
                      selectedLanguage === lang
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-foreground hover:bg-secondary"
                    )}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground text-balance">{categoryName}</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
            {filteredChannels.length}{" "}
            {filteredChannels.length === 1 ? "channel" : "channels"} available
            {selectedLanguage && ` in ${selectedLanguage}`}
          </p>
        </div>
        {filteredChannels.length > 0 && displayCount < filteredChannels.length && (
          <p className="text-xs text-muted-foreground">
            Showing {displayCount} of {filteredChannels.length}
          </p>
        )}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 sm:py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Loading channels...</p>
          </div>
        </div>
      ) : filteredChannels.length === 0 ? (
        <div className="flex items-center justify-center py-16 sm:py-20">
          <div className="text-center px-4">
            <p className="text-base sm:text-lg font-medium text-foreground">
              No channels found
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery || selectedLanguage
                ? "Try different filters"
                : "No channels available in this category"}
            </p>
            {(searchQuery || selectedLanguage) && (
              <button
                onClick={() => {
                  onSearchChange("");
                  onSelectLanguage(null);
                }}
                className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
            {displayedChannels.map((channel) => (
              <ChannelCard
                key={channel.id + channel.url}
                channel={channel}
                onSelect={onSelectChannel}
                isActive={activeChannel?.url === channel.url}
                isFavorite={isFavorite(channel)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
          
          {/* Infinite scroll loader */}
          {displayCount < filteredChannels.length && (
            <div ref={loaderRef} className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          )}
        </>
      )}
    </div>
  );
}
