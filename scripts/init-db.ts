import pool from "../lib/db";

const CREATE_TABLES = `
  -- Sites table
  CREATE TABLE IF NOT EXISTS sites (
    id VARCHAR(255) PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    theme JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Pages table
  CREATE TABLE IF NOT EXISTS pages (
    id SERIAL PRIMARY KEY,
    site_slug VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    sections JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(site_slug, slug)
  );

  -- Leads table
  CREATE TABLE IF NOT EXISTS leads (
    id VARCHAR(255) PRIMARY KEY,
    site_slug VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Create indexes for better performance
  CREATE INDEX IF NOT EXISTS idx_pages_site_slug ON pages(site_slug);
  CREATE INDEX IF NOT EXISTS idx_leads_site_slug ON leads(site_slug);
  CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
`;

async function initDatabase() {
  try {
    console.log("Initializing database...");
    await pool.query(CREATE_TABLES);
    console.log("Database tables created successfully!");
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("Error initializing database:", error);
    await pool.end();
    process.exit(1);
  }
}

initDatabase();

