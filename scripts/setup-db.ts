import pool from "../lib/db";
import { query } from "../lib/db";

const CREATE_TABLES = `
  -- Sites table
  CREATE TABLE IF NOT EXISTS sites (
    id VARCHAR(255) PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    domains TEXT[] DEFAULT '{}',
    name VARCHAR(255) NOT NULL,
    theme JSONB NOT NULL,
    seo JSONB,
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

  -- Users table
  CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('siteOwner', 'superAdmin')),
    site_slugs TEXT[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Create indexes for better performance
  CREATE INDEX IF NOT EXISTS idx_pages_site_slug ON pages(site_slug);
  CREATE INDEX IF NOT EXISTS idx_leads_site_slug ON leads(site_slug);
  CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_sites_domains ON sites USING GIN(domains);
`;

async function setupDatabase() {
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.log("⚠️  DATABASE_URL not set. Skipping database setup.");
    console.log("   Using JSON file storage instead.");
    return;
  }

  try {
    console.log("🔧 Setting up database...");

    // Initialize tables
    console.log("📊 Creating tables...");
    await query(CREATE_TABLES);
    console.log("✅ Tables created/verified");

    // Migrate existing tables (add new columns if they don't exist)
    console.log("🔄 Migrating existing tables...");
    
    // Add domains column - try directly, catch "already exists" error
    try {
      console.log("  ➕ Adding 'domains' column to sites table...");
      await query("ALTER TABLE sites ADD COLUMN domains TEXT[] DEFAULT '{}'");
      console.log("  ✅ 'domains' column added successfully");
    } catch (domainsError: any) {
      if (domainsError?.code === '42701') {
        // Column already exists (duplicate_column)
        console.log("  ✓ 'domains' column already exists");
      } else {
        console.error("  ❌ Failed to add 'domains' column:", domainsError?.message || domainsError);
        // Don't throw - continue with migration
      }
    }

    // Add seo column - try directly, catch "already exists" error
    try {
      console.log("  ➕ Adding 'seo' column to sites table...");
      await query("ALTER TABLE sites ADD COLUMN seo JSONB");
      console.log("  ✅ 'seo' column added successfully");
    } catch (seoError: any) {
      if (seoError?.code === '42701') {
        // Column already exists (duplicate_column)
        console.log("  ✓ 'seo' column already exists");
      } else {
        console.error("  ❌ Failed to add 'seo' column:", seoError?.message || seoError);
        // Don't throw - continue with migration
      }
    }

    // Update existing sites to have empty domains array if null
    try {
      await query("UPDATE sites SET domains = '{}' WHERE domains IS NULL");
      console.log("  ✅ Updated existing sites with default domains");
    } catch (updateError: any) {
      // This is OK if the column doesn't exist yet or if there are no rows
      if (updateError?.code === '42703') {
        console.log("  ⚠️  Domains column not available for update (this is OK)");
      } else {
        console.log("  ⚠️  Could not update domains:", updateError?.message || updateError);
      }
    }
    
    console.log("✅ Table migration complete");

    // Migrate JSON files to database (if they exist)
    console.log("📦 Checking for JSON files to migrate...");
    const fs = require("fs/promises");
    const path = require("path");
    const DATA_DIR = path.join(process.cwd(), "data");
    let migrated = false;

    // Migrate Sites
    try {
      const sitesDir = path.join(DATA_DIR, "sites");
      const siteFiles = await fs.readdir(sitesDir);
      const siteJsonFiles = siteFiles.filter((f: string) => f.endsWith(".json"));
      
      if (siteJsonFiles.length > 0) {
        console.log(`  📁 Found ${siteJsonFiles.length} site file(s)`);
        for (const file of siteJsonFiles) {
          const filePath = path.join(sitesDir, file);
          const data = await fs.readFile(filePath, "utf8");
          const site = JSON.parse(data);
          
          // Check if site already exists
          const existing = await query("SELECT id FROM sites WHERE slug = $1", [site.slug]);
          if (existing.rows.length === 0) {
            await query(
              `INSERT INTO sites (id, slug, domains, name, theme, seo) VALUES ($1, $2, $3, $4, $5, $6)`,
              [
                site.id,
                site.slug,
                JSON.stringify(site.domains || []),
                site.name,
                JSON.stringify(site.theme),
                site.seo ? JSON.stringify(site.seo) : null,
              ]
            );
            console.log(`    ✅ Migrated site: ${site.name}`);
            migrated = true;
          }
        }
      }
    } catch (error) {
      // Sites directory doesn't exist, that's fine
    }

    // Migrate Pages
    try {
      const pagesDir = path.join(DATA_DIR, "pages");
      const pageFiles = await fs.readdir(pagesDir);
      const pageJsonFiles = pageFiles.filter((f: string) => f.endsWith(".json"));
      
      if (pageJsonFiles.length > 0) {
        console.log(`  📄 Found ${pageJsonFiles.length} page file(s)`);
        for (const file of pageJsonFiles) {
          const filePath = path.join(pagesDir, file);
          const data = await fs.readFile(filePath, "utf8");
          const page = JSON.parse(data);
          
          // Check if page already exists
          const existing = await query(
            "SELECT id FROM pages WHERE site_slug = $1 AND slug = $2",
            [page.siteSlug, page.slug]
          );
          if (existing.rows.length === 0) {
            await query(
              `INSERT INTO pages (site_slug, slug, sections) VALUES ($1, $2, $3)`,
              [page.siteSlug, page.slug, JSON.stringify(page.sections)]
            );
            console.log(`    ✅ Migrated page: ${page.siteSlug}/${page.slug}`);
            migrated = true;
          }
        }
      }
    } catch (error) {
      // Pages directory doesn't exist, that's fine
    }

    // Migrate Leads
    try {
      const leadsDir = path.join(DATA_DIR, "leads");
      const leadFiles = await fs.readdir(leadsDir);
      const leadJsonFiles = leadFiles.filter((f: string) => f.endsWith(".json"));
      
      if (leadJsonFiles.length > 0) {
        console.log(`  📧 Found ${leadJsonFiles.length} lead file(s)`);
        for (const file of leadJsonFiles) {
          const filePath = path.join(leadsDir, file);
          const data = await fs.readFile(filePath, "utf8");
          const leads: any[] = JSON.parse(data);
          
          let migratedCount = 0;
          for (const lead of leads) {
            // Check if lead already exists
            const existing = await query("SELECT id FROM leads WHERE id = $1", [lead.id]);
            if (existing.rows.length === 0) {
              await query(
                `INSERT INTO leads (id, site_slug, name, email, message, created_at) VALUES ($1, $2, $3, $4, $5, $6)`,
                [lead.id, lead.siteSlug, lead.name, lead.email, lead.message, lead.createdAt]
              );
              migratedCount++;
            }
          }
          if (migratedCount > 0) {
            console.log(`    ✅ Migrated ${migratedCount} lead(s) from ${file}`);
            migrated = true;
          }
        }
      }
    } catch (error) {
      // Leads directory doesn't exist, that's fine
    }

    if (!migrated) {
      console.log("  ℹ️  No JSON files found to migrate (or all data already migrated)");
    }

    console.log("✅ Database setup complete!");
  } catch (error) {
    console.error("❌ Database setup failed:", error);
    // Don't throw - allow app to start even if migration fails
    // The app will fall back to JSON files if database isn't working
  } finally {
    // Don't close the pool - it's used by the app
    // pool.end();
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log("✅ Database setup script completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Fatal error during database setup:", error);
      // Don't exit with error - allow app to start even if migration fails
      // The app will fall back to JSON files if database isn't working
      process.exit(0);
    });
}

// Export for use in other scripts
export default setupDatabase;

