"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-0.5 sm:gap-1 p-0.5 sm:p-1 rounded-lg bg-secondary">
        <div className="w-7 h-7 sm:w-8 sm:h-8" />
        <div className="w-7 h-7 sm:w-8 sm:h-8" />
        <div className="w-7 h-7 sm:w-8 sm:h-8" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0.5 sm:gap-1 p-0.5 sm:p-1 rounded-lg bg-secondary">
      <button
        onClick={() => setTheme("light")}
        className={cn(
          "p-1.5 sm:p-2 rounded-md transition-colors touch-manipulation",
          theme === "light"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-muted active:bg-muted"
        )}
        aria-label="Light mode"
      >
        <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={cn(
          "p-1.5 sm:p-2 rounded-md transition-colors touch-manipulation",
          theme === "dark"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-muted active:bg-muted"
        )}
        aria-label="Dark mode"
      >
        <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>
      <button
        onClick={() => setTheme("system")}
        className={cn(
          "p-1.5 sm:p-2 rounded-md transition-colors touch-manipulation",
          theme === "system"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-muted active:bg-muted"
        )}
        aria-label="System theme"
      >
        <Monitor className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>
    </div>
  );
}
