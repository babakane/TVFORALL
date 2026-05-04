"use client";

import React, { useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  Tv2,
  Newspaper,
  Film,
  Music,
  Trophy,
  Baby,
  BookOpen,
  Heart,
  ChefHat,
  Plane,
  Sparkles,
  Clock,
  Laugh,
  GalleryVerticalEnd,
  Grid3X3,
  Mountain,
  Wind,
  Church,
  Atom,
  Clapperboard,
  ShoppingBag,
  CloudSun,
  X,
  Star,
  History,
} from "lucide-react";
import type { CategoryKey } from "@/lib/channels";
import { ThemeToggle } from "./theme-toggle";

type ExtendedCategoryKey = CategoryKey | "favorites" | "recent";

interface SidebarProps {
  selectedCategory: ExtendedCategoryKey;
  onSelectCategory: (category: ExtendedCategoryKey) => void;
  channelCounts: Record<string, number>;
  isOpen: boolean;
  onClose: () => void;
  favoritesCount: number;
  recentCount: number;
}

const categoryConfig: {
  id: CategoryKey;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "all", name: "All Channels", icon: Grid3X3 },
  { id: "news", name: "News", icon: Newspaper },
  { id: "entertainment", name: "Entertainment", icon: Tv2 },
  { id: "sports", name: "Sports", icon: Trophy },
  { id: "movies", name: "Movies", icon: Film },
  { id: "music", name: "Music", icon: Music },
  { id: "kids", name: "Kids", icon: Baby },
  { id: "documentary", name: "Documentary", icon: BookOpen },
  { id: "education", name: "Education", icon: GalleryVerticalEnd },
  { id: "lifestyle", name: "Lifestyle", icon: Heart },
  { id: "cooking", name: "Cooking", icon: ChefHat },
  { id: "travel", name: "Travel", icon: Plane },
  { id: "animation", name: "Animation", icon: Sparkles },
  { id: "classic", name: "Classic", icon: Clock },
  { id: "comedy", name: "Comedy", icon: Laugh },
  { id: "culture", name: "Culture", icon: GalleryVerticalEnd },
  { id: "general", name: "General", icon: Tv2 },
  { id: "outdoor", name: "Outdoor", icon: Mountain },
  { id: "relax", name: "Relax", icon: Wind },
  { id: "religious", name: "Religious", icon: Church },
  { id: "science", name: "Science", icon: Atom },
  { id: "series", name: "Series", icon: Clapperboard },
  { id: "shop", name: "Shopping", icon: ShoppingBag },
  { id: "weather", name: "Weather", icon: CloudSun },
];

export function Sidebar({
  selectedCategory,
  onSelectCategory,
  channelCounts,
  isOpen,
  onClose,
  favoritesCount,
  recentCount,
}: SidebarProps) {
  const handleSelectCategory = useCallback((category: ExtendedCategoryKey) => {
    onSelectCategory(category);
    onClose();
  }, [onSelectCategory, onClose]);

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden touch-manipulation"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 h-screen w-[280px] sm:w-64 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300 ease-out lg:translate-x-0 will-change-transform",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-sidebar-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary flex items-center justify-center">
              <Tv2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-sidebar-foreground">
                TimeTv
              </h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Live Streaming</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-sidebar-accent rounded-lg transition-colors touch-manipulation"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-sidebar-foreground" />
          </button>
        </div>

        {/* Your Library Section */}
        <nav className="py-3 sm:py-4 border-b border-sidebar-border shrink-0">
          <div className="px-4 mb-2">
            <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Your Library
            </span>
          </div>
          <ul className="space-y-0.5 sm:space-y-1 px-2">
            <li>
              <button
                onClick={() => handleSelectCategory("favorites")}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 sm:py-2.5 rounded-lg transition-all duration-200 group touch-manipulation",
                  selectedCategory === "favorites"
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent active:bg-sidebar-accent"
                )}
              >
                <Star
                  className={cn(
                    "w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:scale-110",
                    selectedCategory === "favorites"
                      ? "text-sidebar-primary-foreground fill-current"
                      : ""
                  )}
                />
                <span className="flex-1 text-left text-xs sm:text-sm font-medium">
                  Favorites
                </span>
                {favoritesCount > 0 && (
                  <span
                    className={cn(
                      "text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full tabular-nums",
                      selectedCategory === "favorites"
                        ? "bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground"
                        : "bg-sidebar-accent text-muted-foreground"
                    )}
                  >
                    {favoritesCount}
                  </span>
                )}
              </button>
            </li>
            <li>
              <button
                onClick={() => handleSelectCategory("recent")}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 sm:py-2.5 rounded-lg transition-all duration-200 group touch-manipulation",
                  selectedCategory === "recent"
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent active:bg-sidebar-accent"
                )}
              >
                <History
                  className={cn(
                    "w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:scale-110",
                    selectedCategory === "recent"
                      ? "text-sidebar-primary-foreground"
                      : ""
                  )}
                />
                <span className="flex-1 text-left text-xs sm:text-sm font-medium">
                  Recently Watched
                </span>
                {recentCount > 0 && (
                  <span
                    className={cn(
                      "text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full tabular-nums",
                      selectedCategory === "recent"
                        ? "bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground"
                        : "bg-sidebar-accent text-muted-foreground"
                    )}
                  >
                    {recentCount}
                  </span>
                )}
              </button>
            </li>
          </ul>
        </nav>

        {/* Categories */}
        <nav className="flex-1 overflow-y-auto py-3 sm:py-4 overscroll-contain">
          <div className="px-4 mb-2">
            <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Categories
            </span>
          </div>
          <ul className="space-y-0.5 sm:space-y-1 px-2">
            {categoryConfig.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.id;
              const count = channelCounts[category.id] || 0;

              return (
                <li key={category.id}>
                  <button
                    onClick={() => handleSelectCategory(category.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 sm:py-2.5 rounded-lg transition-all duration-200 group touch-manipulation",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent active:bg-sidebar-accent"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:scale-110 shrink-0",
                        isActive ? "text-sidebar-primary-foreground" : ""
                      )}
                    />
                    <span className="flex-1 text-left text-xs sm:text-sm font-medium truncate">
                      {category.name}
                    </span>
                    {count > 0 && (
                      <span
                        className={cn(
                          "text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full tabular-nums shrink-0",
                          isActive
                            ? "bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground"
                            : "bg-sidebar-accent text-muted-foreground"
                        )}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer with Theme Toggle */}
        <div className="p-3 sm:p-4 border-t border-sidebar-border space-y-3 sm:space-y-4 shrink-0">
          <div className="flex items-center justify-center">
            <ThemeToggle />
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground text-center">
            Powered by IPTV-org
          </p>
        </div>
      </aside>
    </>
  );
}

export type { ExtendedCategoryKey };
