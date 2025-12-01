"use client";

import { createContext, useContext } from "react";
import type { User } from "@supabase/supabase-js";
import type { UserRole } from "@/lib/auth/roles";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  role: UserRole;
  isSuperAdmin: boolean;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  role: "user",
  isSuperAdmin: false,
  signOut: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
