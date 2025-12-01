"use client";
import { Logo } from "../Logo";
import { Button } from "../button";
import { NavBarItem } from "./navbar-item";
import {
  useMotionValueEvent,
  useScroll,
  motion,
  AnimatePresence,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Link } from "next-view-transitions";
import { ModeToggle } from "../mode-toggle";
import type { User } from "@supabase/supabase-js";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

type Props = {
  navItems: {
    link: string;
    title: string;
    target?: "_blank";
  }[];
  user: User | null;
  onSignOut: () => Promise<void>;
};

export const DesktopNavbar = ({ navItems, user, onSignOut }: Props) => {
  const { scrollY } = useScroll();

  const [showBackground, setShowBackground] = useState(false);

  useMotionValueEvent(scrollY, "change", (value) => {
    if (value > 100) {
      setShowBackground(true);
    } else {
      setShowBackground(false);
    }
  });
  return (
    <div
      className={cn(
        "w-full flex relative justify-between px-4 py-2 rounded-full bg-transparent transition duration-200",
        showBackground &&
          "bg-neutral-50 dark:bg-neutral-900 shadow-[0px_-2px_0px_0px_var(--neutral-100),0px_2px_0px_0px_var(--neutral-100)] dark:shadow-[0px_-2px_0px_0px_var(--neutral-800),0px_2px_0px_0px_var(--neutral-800)]"
      )}
    >
      <AnimatePresence>
        {showBackground && (
          <motion.div
            key={String(showBackground)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 1,
            }}
            className="absolute inset-0 h-full w-full bg-neutral-100 dark:bg-neutral-800 pointer-events-none [mask-image:linear-gradient(to_bottom,white,transparent,white)] rounded-full"
          />
        )}
      </AnimatePresence>
      <div className="flex flex-row gap-2 items-center">
        <Logo />
        <div className="flex items-center gap-1.5">
          {navItems.map((item) => (
            <NavBarItem href={item.link} key={item.title} target={item.target}>
              {item.title}
            </NavBarItem>
          ))}
        </div>
      </div>
      <div className="flex space-x-2 items-center">
        <ModeToggle />
        {user ? (
          <>
            <Button variant="simple" as={Link} href="/dashboard">
              Dashboard
            </Button>
            <Menu as="div" className="relative">
              <MenuButton className="flex items-center gap-x-1 text-sm font-medium px-3 py-2 rounded-full text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-50 transition-colors">
                <span className="max-w-[120px] truncate">{user.email}</span>
                <ChevronDownIcon
                  aria-hidden="true"
                  className="size-4 flex-none text-neutral-500"
                />
              </MenuButton>
              <MenuItems
                transition
                className="absolute right-0 z-10 mt-2.5 w-48 origin-top-right rounded-md bg-white dark:bg-neutral-900 shadow-lg ring-1 ring-neutral-200 dark:ring-neutral-800 transition focus:outline-none data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
              >
                <div className="py-1">
                  <MenuItem>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-50 data-focus:bg-neutral-100 dark:data-focus:bg-neutral-800 data-focus:text-neutral-900 dark:data-focus:text-neutral-50"
                    >
                      Settings
                    </Link>
                  </MenuItem>
                  <MenuItem>
                    <button
                      onClick={onSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-50 data-focus:bg-neutral-100 dark:data-focus:bg-neutral-800 data-focus:text-neutral-900 dark:data-focus:text-neutral-50"
                    >
                      Sign out
                    </button>
                  </MenuItem>
                </div>
              </MenuItems>
            </Menu>
          </>
        ) : (
          <>
            <Button variant="simple" as={Link} href="/login">
              Login
            </Button>
            <Button as={Link} href="/signup">
              Sign Up
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
