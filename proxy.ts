import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);

  const pathname = request.nextUrl.pathname;

  // Auth routes - both /login and /signup
  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/signup");

  // Protected routes - dashboard and all country/map pages
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/import") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/analytics") ||
    // Country map pages (e.g., /poland, /lithuania, etc.)
    pathname.match(
      /^\/(poland|lithuania|latvia|estonia|gb|france|honduras|usa)/
    );

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect unauthenticated users to login
  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api).*)",
  ],
};
