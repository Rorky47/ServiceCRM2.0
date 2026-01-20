import { Pool } from "pg";

// Railway provides DATABASE_URL environment variable
// Format: postgresql://user:password@host:port/database
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("DATABASE_URL not set. Database features will not work.");
}

// Create a connection pool
const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
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
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log("Executed query", { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error("Query error", { text, error });
    throw error;
  }
}

