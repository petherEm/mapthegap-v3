"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DesktopNavbar } from "./desktop-navbar";
import { MobileNavbar } from "./mobile-navbar";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const defaultNavItems = [
  {
    title: "Pricing",
    link: "/pricing",
  },
  {
    title: "Contact",
    link: "/contact",
  },
];

const dashboardNavItems = [
  {
    title: "Dashboard",
    link: "/dashboard",
  },
  {
    title: "Import",
    link: "/import",
  },
  {
    title: "Analytics",
    link: "/analytics",
  },
  {
    title: "Settings",
    link: "/settings",
  },
];

type NavBarProps = {
  variant?: "default" | "dashboard";
};

export function NavBar({ variant = "default" }: NavBarProps) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    getSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const navItems = variant === "dashboard" ? dashboardNavItems : defaultNavItems;

  return (
    <motion.nav
      initial={{
        y: -80,
      }}
      animate={{
        y: 0,
      }}
      transition={{
        ease: [0.6, 0.05, 0.1, 0.9],
        duration: 0.8,
      }}
      className="max-w-7xl fixed top-4 mx-auto inset-x-0 z-50 w-[95%] lg:w-full"
    >
      <div className="hidden lg:block w-full">
        <DesktopNavbar navItems={navItems} user={user} onSignOut={signOut} />
      </div>
      <div className="flex h-full w-full items-center lg:hidden">
        <MobileNavbar navItems={navItems} user={user} onSignOut={signOut} />
      </div>
    </motion.nav>
  );
}
