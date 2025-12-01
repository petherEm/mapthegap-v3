"use client";

import { Fragment } from "react";
import Link from "next/link";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { useAuth } from "@/context/AuthContext";

export function UserMenu() {
  const { user, signOut } = useAuth();

  if (!user) return null;

  return (
    <Menu as="div" className="relative">
      <MenuButton className="flex items-center gap-x-1 text-sm/6 font-semibold text-neutral-900 dark:text-neutral-50">
        <span className="text-violet-600 dark:text-violet-400">{user.email}</span>
        <ChevronDownIcon
          aria-hidden="true"
          className="size-5 flex-none text-neutral-500"
        />
      </MenuButton>

      <MenuItems
        transition
        className="absolute right-0 z-10 mt-2.5 w-48 origin-top-right rounded-md bg-white dark:bg-neutral-900 shadow-lg ring-1 ring-neutral-200 dark:ring-neutral-800 transition focus:outline-none data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
      >
        <div className="py-1">
          <MenuItem>
            <Link
              href="/dashboard"
              className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-50 data-focus:bg-neutral-100 dark:data-focus:bg-neutral-800 data-focus:text-neutral-900 dark:data-focus:text-neutral-50"
            >
              Dashboard
            </Link>
          </MenuItem>
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
              onClick={signOut}
              className="block w-full text-left px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-50 data-focus:bg-neutral-100 dark:data-focus:bg-neutral-800 data-focus:text-neutral-900 dark:data-focus:text-neutral-50"
            >
              Sign out
            </button>
          </MenuItem>
        </div>
      </MenuItems>
    </Menu>
  );
}
