import { NextRequest } from "next/server";
import { User } from "@/types";
import { checkAccess } from "./data";

/**
 * Simple authentication helper
 * In production, replace this with proper authentication (e.g., NextAuth, Clerk, etc.)
 * 
 * For now, we use ?admin=true as a simple check
 * In production, you should:
 * 1. Verify JWT tokens or session cookies
 * 2. Get user from database
 * 3. Check permissions
 */
export async function getCurrentUser(request: NextRequest): Promise<User | null> {
  // TODO: Implement proper authentication
  // For now, check if admin=true is in query params (development only)
  const url = new URL(request.url);
  const isAdmin = url.searchParams.get("admin") === "true";
  
  if (!isAdmin) {
    return null;
  }

  // In production, get user from session/token
  // For now, return a mock superAdmin user
  // TODO: Replace with actual user lookup
  return {
    id: "1",
    email: "admin@example.com",
    role: "superAdmin",
  };
}

/**
 * Check if user has access to a site
 */
export async function requireAccess(
  request: NextRequest,
  siteSlug: string
): Promise<{ user: User | null; hasAccess: boolean }> {
  const user = await getCurrentUser(request);
  
  if (!user) {
    return { user: null, hasAccess: false };
  }

  const hasAccess = checkAccess(user, siteSlug);
  return { user, hasAccess };
}

/**
 * Middleware helper for API routes
 * Returns 403 if user doesn't have access
 */
export async function requireApiAccess(
  request: NextRequest,
  siteSlug: string
): Promise<{ user: User } | { error: Response }> {
  const { user, hasAccess } = await requireAccess(request, siteSlug);
  
  if (!user || !hasAccess) {
    return {
      error: new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      ),
    };
  }

  return { user };
}

