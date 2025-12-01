import { createClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase client for use in cached functions.
 * Uses the service role key to bypass RLS, or falls back to anon key.
 *
 * This client is specifically designed for "use cache" functions where
 * we cannot use cookies() or other dynamic data sources.
 *
 * Note: Service role bypasses RLS, so use carefully.
 */
export function createCacheClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || // Service role (bypasses RLS)
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Fallback to anon key

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Missing Supabase environment variables for cache client"
    );
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false, // No session persistence needed
      autoRefreshToken: false, // No token refresh needed
    },
  });
}
