import pool from "../lib/db";
import { query } from "../lib/db";
import { ensureSiteSchema, getPage, getLeads, savePage, saveLead } from "../lib/data";

const CREATE_TABLES = `
  -- Sites table (public)
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

  -- Users table (public). Pages and leads live in per-site schemas.
  CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('siteOwner', 'superAdmin')),
    site_slugs TEXT[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_sites_domains ON sites USING GIN(domains);
`;

// Cache to track if setup has run
let setupComplete = false;

async function setupDatabase() {
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.log("⚠️  DATABASE_URL not set. Skipping database setup.");
    console.log("   Using JSON file storage instead.");
    return;
  }

  // Skip if already completed in this process
  if (setupComplete) {
    console.log("ℹ️  Database setup already completed, skipping...");
    return;
  }

  try {
    console.log("🔧 Setting up database...");

    // Initialize tables (this is fast - IF NOT EXISTS makes it idempotent)
    await query(CREATE_TABLES);
    console.log("✅ Tables created/verified");

    // Migrate existing tables (add new columns if they don't exist)
    // Use a single query to check all columns at once for better performance
    console.log("🔄 Migrating existing tables...");
    try {
      const allColumns = await query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'sites'
      `);
      
      const existingColumns = new Set(allColumns.rows.map((r: any) => r.column_name));
      const columnsToAdd: Array<{ name: string; sql: string }> = [];

      if (!existingColumns.has('domains')) {
        columnsToAdd.push({ name: 'domains', sql: "ALTER TABLE sites ADD COLUMN IF NOT EXISTS domains TEXT[] DEFAULT '{}'" });
      }
      if (!existingColumns.has('seo')) {
        columnsToAdd.push({ name: 'seo', sql: "ALTER TABLE sites ADD COLUMN IF NOT EXISTS seo JSONB" });
      }
      if (!existingColumns.has('header')) {
        columnsToAdd.push({ name: 'header', sql: "ALTER TABLE sites ADD COLUMN IF NOT EXISTS header JSONB" });
      }
      if (!existingColumns.has('footer')) {
        columnsToAdd.push({ name: 'footer', sql: "ALTER TABLE sites ADD COLUMN IF NOT EXISTS footer JSONB" });
      }
      if (!existingColumns.has('analytics')) {
        columnsToAdd.push({ name: 'analytics', sql: "ALTER TABLE sites ADD COLUMN IF NOT EXISTS analytics JSONB" });
      }
      if (!existingColumns.has('notifications')) {
        columnsToAdd.push({ name: 'notifications', sql: "ALTER TABLE sites ADD COLUMN IF NOT EXISTS notifications JSONB" });
      }
      if (!existingColumns.has('sociallinks')) {
        columnsToAdd.push({ name: 'sociallinks', sql: "ALTER TABLE sites ADD COLUMN IF NOT EXISTS sociallinks JSONB" });
      }
      if (!existingColumns.has('services')) {
        columnsToAdd.push({ name: 'services', sql: "ALTER TABLE sites ADD COLUMN IF NOT EXISTS services JSONB" });
      }

      // Add all missing columns in parallel
      if (columnsToAdd.length > 0) {
        await Promise.all(columnsToAdd.map(col => {
          console.log(`  ➕ Adding '${col.name}' column to sites table...`);
          return query(col.sql);
        }));
      }

      // Update existing sites to have empty domains array if null (only if column exists)
      if (existingColumns.has('domains')) {
        try {
          await query("UPDATE sites SET domains = '{}' WHERE domains IS NULL");
        } catch (updateError) {
          // Ignore update errors
        }
      }
      
      console.log("✅ Table migration complete");
    } catch (migrationError) {
      console.log("  ⚠️  Migration check failed (this is OK if tables are new):", migrationError instanceof Error ? migrationError.message : String(migrationError));
    }

    // Ensure per-site schemas exist for every site in sites table
    try {
      const sitesResult = await query("SELECT id FROM sites");
      for (const row of sitesResult.rows) {
        await ensureSiteSchema(row.id);
      }
      if (sitesResult.rows.length > 0) {
        console.log(`  📂 Ensured per-site schemas for ${sitesResult.rows.length} site(s)`);
      }
    } catch (schemaError) {
      console.log("  ⚠️  Per-site schema ensure failed:", schemaError instanceof Error ? schemaError.message : String(schemaError));
    }

    // Migrate JSON files to database (if they exist)
    // Skip migration if SKIP_JSON_MIGRATION env var is set (for faster startup after initial migration)
    if (process.env.SKIP_JSON_MIGRATION === 'true') {
      console.log("ℹ️  Skipping JSON migration (SKIP_JSON_MIGRATION=true)");
    } else {
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
        
        // Check if domains column exists before migrating
        let domainsColumnExists = false;
        try {
          const columns = await query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'sites' AND column_name = 'domains'
          `);
          domainsColumnExists = columns.rows.length > 0;
          if (!domainsColumnExists) {
            await query("ALTER TABLE sites ADD COLUMN domains TEXT[] DEFAULT '{}'");
            console.log("  ➕ Added 'domains' column to sites table");
          }
        } catch (error) {
          console.warn("  ⚠️  Could not check/add domains column:", error);
        }
        
        for (const file of siteJsonFiles) {
          const filePath = path.join(sitesDir, file);
          const data = await fs.readFile(filePath, "utf8");
          const site = JSON.parse(data);
          
          // Check if site already exists by ID (primary key) or slug
          try {
            const existingById = await query("SELECT id FROM sites WHERE id = $1", [site.id]);
            const existingBySlug = await query("SELECT id FROM sites WHERE slug = $1", [site.slug]);
            
            if (existingById.rows.length > 0 || existingBySlug.rows.length > 0) {
              console.log(`    ⏭️  Site already exists: ${site.name} (skipping)`);
              continue;
            }
            
            await query(
              `INSERT INTO sites (id, slug, domains, name, theme, seo) VALUES ($1, $2, $3, $4, $5, $6)`,
              [
                site.id,
                site.slug,
                site.domains || [], // Pass array directly, not stringified - pg library handles conversion
                site.name,
                JSON.stringify(site.theme),
                site.seo ? JSON.stringify(site.seo) : null,
              ]
            );
            console.log(`    ✅ Migrated site: ${site.name}`);
            migrated = true;
          } catch (error) {
            // If it's a duplicate key error, the site already exists - that's fine
            if (error instanceof Error && error.message.includes("duplicate key")) {
              console.log(`    ⏭️  Site already exists: ${site.name} (skipping)`);
            } else {
              console.error(`    ❌ Error migrating site ${site.name}:`, error instanceof Error ? error.message : String(error));
            }
          }
        }
      }
    } catch (error) {
      // Sites directory doesn't exist, that's fine
    }

    // Migrate Pages (uses per-site schemas via savePage)
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
          
          const existing = await getPage(page.siteSlug, page.slug);
          if (!existing) {
            await savePage(page);
            console.log(`    ✅ Migrated page: ${page.siteSlug}/${page.slug}`);
            migrated = true;
          }
        }
      }
    } catch (error) {
      // Pages directory doesn't exist, that's fine
    }

    // Migrate Leads (uses per-site schemas via saveLead)
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
          if (leads.length === 0) continue;
          const siteSlug = leads[0].siteSlug;
          const existingLeads = await getLeads(siteSlug);
          const existingIds = new Set(existingLeads.map((l) => l.id));
          let migratedCount = 0;
          for (const lead of leads) {
            if (!existingIds.has(lead.id)) {
              await saveLead(lead);
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
    }

    setupComplete = true;
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

