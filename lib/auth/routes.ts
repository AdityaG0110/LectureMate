export const authRoutes = ["/login", "/signup", "/forgot-password"] as const;
export const protectedRoutePrefix = "/dashboard";

/**
 * Future Supabase integration point. Replace with a server-side session lookup
 * and return whether the current request has an authenticated user.
 */
export function hasSession(): boolean { return false; }
