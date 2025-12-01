"use client";
import { cn } from "@/lib/utils";
import { Link } from "next-view-transitions";
import { useState } from "react";
import { IoIosMenu } from "react-icons/io";
import { IoIosClose } from "react-icons/io";
import { Button } from "../button";
import { Logo } from "../Logo";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { ModeToggle } from "../mode-toggle";
import type { User } from "@supabase/supabase-js";

type Props = {
  navItems: {
    link: string;
    title: string;
    target?: "_blank";
    children?: { link: string; title: string }[];
  }[];
  user: User | null;
  onSignOut: () => Promise<void>;
};

export const MobileNavbar = ({ navItems, user, onSignOut }: Props) => {
  const [open, setOpen] = useState(false);

  const { scrollY } = useScroll();

  const [showBackground, setShowBackground] = useState(false);

  useMotionValueEvent(scrollY, "change", (value) => {
    if (value > 100) {
      setShowBackground(true);
    } else {
      setShowBackground(false);
    }
  });

  const handleSignOut = async () => {
    await onSignOut();
    setOpen(false);
  };

  return (
    <div
      className={cn(
        "flex justify-between bg-white dark:bg-neutral-900 items-center w-full rounded-full px-2.5 py-1.5 transition duration-200",
        showBackground &&
          "bg-neutral-50 dark:bg-neutral-900 shadow-[0px_-2px_0px_0px_var(--neutral-100),0px_2px_0px_0px_var(--neutral-100)] dark:shadow-[0px_-2px_0px_0px_var(--neutral-800),0px_2px_0px_0px_var(--neutral-800)]"
      )}
    >
      <Logo />
      <IoIosMenu
        className="text-black dark:text-white h-6 w-6 cursor-pointer"
        onClick={() => setOpen(!open)}
      />
      {open && (
        <div className="fixed inset-0 bg-white dark:bg-black z-50 flex flex-col items-start justify-start space-y-10 pt-5 text-xl text-zinc-600 transition duration-200">
          <div className="flex items-center justify-between w-full px-5">
            <Logo />
            <div className="flex items-center space-x-2">
              <ModeToggle />
              <IoIosClose
                className="h-8 w-8 text-black dark:text-white cursor-pointer"
                onClick={() => setOpen(!open)}
              />
            </div>
          </div>
          <div className="flex flex-col items-start justify-start gap-[14px] px-8">
            {navItems.map((navItem, idx: number) => (
              <div key={`nav-${idx}`}>
                {navItem.children && navItem.children.length > 0 ? (
                  <>
                    {navItem.children.map((childNavItem, childIdx: number) => (
                      <Link
                        key={`child-${childIdx}`}
                        href={childNavItem.link}
                        onClick={() => setOpen(false)}
                        className="relative max-w-[15rem] text-left text-2xl"
                      >
                        <span className="block text-black dark:text-white">
                          {childNavItem.title}
                        </span>
                      </Link>
                    ))}
                  </>
                ) : (
                  <Link
                    href={navItem.link}
                    onClick={() => setOpen(false)}
                    className="relative"
                  >
                    <span className="block text-[26px] text-black dark:text-white">
                      {navItem.title}
                    </span>
                  </Link>
                )}
              </div>
            ))}
          </div>
          <div className="flex flex-col w-full items-start gap-4 px-8 py-4">
            {user ? (
              <>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Signed in as{" "}
                  <span className="text-violet-600 dark:text-violet-400">
                    {user.email}
                  </span>
                </p>
                <div className="flex flex-row w-full items-start gap-2.5">
                  <Button as={Link} href="/dashboard" onClick={() => setOpen(false)}>
                    Dashboard
                  </Button>
                  <Button variant="simple" as={Link} href="/settings" onClick={() => setOpen(false)}>
                    Settings
                  </Button>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-50 transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <div className="flex flex-row w-full items-start gap-2.5">
                <Button as={Link} href="/signup" onClick={() => setOpen(false)}>
                  Sign Up
                </Button>
                <Button variant="simple" as={Link} href="/login" onClick={() => setOpen(false)}>
                  Login
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
