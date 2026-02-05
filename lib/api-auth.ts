import { NextRequest } from "next/server";

/**
 * Verifies the request has a valid API key (x-api-key header).
 * Use for mutation routes (POST/DELETE) that should be protected.
 * API_KEY must be set in the environment; requests must include x-api-key.
 */
export function verifyApiKey(request: NextRequest): void {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    const error = new Error("API key not configured");
    (error as Error & { status?: number }).status = 503;
    throw error;
  }
  const provided = request.headers.get("x-api-key");
  if (provided !== apiKey) {
    const error = new Error("Unauthorized");
    (error as Error & { status?: number }).status = 401;
    throw error;
  }
}
