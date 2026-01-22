import { Pool } from "pg";

// Railway provides DATABASE_URL environment variable
// Format: postgresql://user:password@host:port/database
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("DATABASE_URL not set. Database features will not work.");
}

// Create a connection pool
// Note: If connectionString is undefined, Pool will use default connection params
// which will fail on actual queries, but that's handled gracefully in query() function
const pool = new Pool({
  connectionString: connectionString || undefined,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  // Add connection timeout to prevent hanging
  connectionTimeoutMillis: 5000,
});

// Test connection
pool.on("connect", () => {
  console.log("Connected to PostgreSQL database");
});

pool.on("error", (err) => {
  console.error("PostgreSQL connection error:", err);
});

export default pool;

// Helper function to execute queries
export async function query(text: string, params?: any[]) {
  if (!connectionString) {
    throw new Error("DATABASE_URL not configured");
  }
  
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    // Only log queries in development to avoid noise and potential serialization issues
    if (process.env.NODE_ENV !== "production" && process.env.DEBUG_QUERIES === "true") {
      const queryPreview = text.replace(/\s+/g, " ").substring(0, 100);
      console.log("Executed query", { text: queryPreview, duration, rows: res.rowCount });
    }
    return res;
  } catch (error) {
    const queryPreview = text.replace(/\s+/g, " ").substring(0, 200);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Query error", { text: queryPreview, error: errorMessage });
    throw error;
  }
}

