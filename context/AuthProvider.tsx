"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { AuthContext } from "./AuthContext";
import { createClient } from "@/lib/supabase/client";
import { getUserRole, isSuperAdmin as checkIsSuperAdmin } from "@/lib/auth/roles";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  // Compute role and superadmin status from user metadata
  const role = useMemo(() => getUserRole(user), [user]);
  const isSuperAdmin = useMemo(() => checkIsSuperAdmin(user), [user]);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
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

  return (
    <AuthContext.Provider value={{ user, loading, role, isSuperAdmin, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
