import type { User } from "@supabase/supabase-js";

/**
 * User roles in the application
 * - user: Regular authenticated user (default)
 * - superadmin: Has access to administrative features like import
 */
export type UserRole = "user" | "superadmin";

/**
 * Get the role of a user from their metadata
 * Role is stored in user_metadata.role (set via Supabase dashboard or SQL)
 */
export function getUserRole(user: User | null): UserRole {
  if (!user) return "user";
  return (user.user_metadata?.role as UserRole) || "user";
}

/**
 * Check if a user has superadmin privileges
 */
export function isSuperAdmin(user: User | null): boolean {
  return getUserRole(user) === "superadmin";
}

/**
 * SQL to set a user as superadmin (run in Supabase SQL Editor):
 *
 * UPDATE auth.users
 * SET raw_user_meta_data = jsonb_set(
 *   COALESCE(raw_user_meta_data, '{}'),
 *   '{role}',
 *   '"superadmin"'
 * )
 * WHERE email = 'your-email@example.com';
 *
 * To remove superadmin role:
 *
 * UPDATE auth.users
 * SET raw_user_meta_data = raw_user_meta_data - 'role'
 * WHERE email = 'your-email@example.com';
 */
