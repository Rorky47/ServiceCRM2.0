/**
 * Maps known API/data layer errors to HTTP status and client-safe message.
 */
export function handleApiError(error: unknown): { status: number; message: string } {
  const message = error instanceof Error ? error.message : String(error);

  if (message.startsWith("Site not found")) {
    return { status: 404, message: "Site not found" };
  }
  if (message === "Invalid site slug") {
    return { status: 400, message: "Invalid site slug" };
  }

  return { status: 500, message: "Internal server error" };
}
