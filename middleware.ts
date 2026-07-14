import { NextResponse, type NextRequest } from "next/server";
import { protectedRoutePrefix } from "./lib/auth/routes";

/**
 * Authentication boundary placeholder.
 *
 * This intentionally allows all requests until a session provider is connected,
 * preserving the current frontend-only dashboard. When Supabase is introduced,
 * read the server session here and redirect unauthenticated dashboard requests
 * to /login with a validated `next` query parameter.
 */
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith(protectedRoutePrefix)) return NextResponse.next();
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*"] };
