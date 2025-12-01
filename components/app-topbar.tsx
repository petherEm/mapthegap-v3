"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Bell, Search } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface AppTopBarProps {
  title?: string;
}

export function AppTopBar({ title }: AppTopBarProps) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
      {/* Left side - Sidebar trigger and breadcrumb */}
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        {title && (
          <h1 className="text-sm font-medium text-foreground">{title}</h1>
        )}
      </div>

      {/* Right side - Actions */}
      <div className="ml-auto flex items-center gap-2">
        {/* Search button (placeholder for future) */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <Search className="h-4 w-4" />
          <span className="sr-only">Search</span>
        </Button>

        {/* Notifications (placeholder for future) */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
          <span className="sr-only">Notifications</span>
        </Button>

        <Separator orientation="vertical" className="mx-1 h-4" />

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
    </header>
  );
}
