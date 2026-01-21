import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const health: {
    status: "healthy" | "degraded" | "unhealthy";
    timestamp: string;
    checks: {
      database: "ok" | "error" | "not_configured";
      databaseError?: string;
    };
  } = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    checks: {
      database: "not_configured",
    },
  };

  // Check database connectivity if DATABASE_URL is set
  if (process.env.DATABASE_URL) {
    try {
      const client = await pool.connect();
      await client.query("SELECT 1");
      client.release();
      health.checks.database = "ok";
    } catch (error) {
      health.checks.database = "error";
      health.checks.databaseError =
        error instanceof Error ? error.message : String(error);
      // Database error doesn't make app unhealthy if we can fall back to JSON
      health.status = "degraded";
    }
  }

  // Return appropriate status code
  const statusCode = health.status === "healthy" ? 200 : health.status === "degraded" ? 200 : 503;

  return NextResponse.json(health, { status: statusCode });
}
