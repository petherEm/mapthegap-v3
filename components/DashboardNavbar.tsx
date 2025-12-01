"use client";

import Link from "next/link";
import { Logo } from "./Logo";
import { UserMenu } from "./auth/UserMenu";
import { useAuth } from "@/context/AuthContext";
import { Button } from "./button";
import { ModeToggle } from "./mode-toggle";

export function DashboardNavbar() {
  const { user, loading } = useAuth();

  return (
    <nav className="w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and nav links */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard">
              <Logo />
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/import"
                className="text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50 transition-colors"
              >
                Import
              </Link>
              <Link
                href="/analytics"
                className="text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50 transition-colors"
              >
                Analytics
              </Link>
              <Link
                href="/settings"
                className="text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50 transition-colors"
              >
                Settings
              </Link>
            </div>
          </div>

          {/* User menu and theme toggle */}
          <div className="flex items-center gap-4">
            <ModeToggle />
            {loading ? (
              <div className="h-8 w-8 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-800" />
            ) : user ? (
              <UserMenu />
            ) : (
              <Button as={Link} href="/login" variant="simple">
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
