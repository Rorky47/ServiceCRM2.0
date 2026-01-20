import fs from "fs/promises";
import path from "path";
import { Site, Page, Lead } from "../types";
import { saveSite, savePage, saveLead } from "../lib/data";

const DATA_DIR = path.join(process.cwd(), "data");

async function migrateJSONToDatabase() {
  console.log("Starting migration from JSON files to PostgreSQL...");

  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error("ERROR: DATABASE_URL environment variable is not set!");
    console.error("Please set DATABASE_URL before running migration.");
    process.exit(1);
  }

  try {
    // Migrate Sites
    console.log("\n📁 Migrating sites...");
    const sitesDir = path.join(DATA_DIR, "sites");
    try {
      const siteFiles = await fs.readdir(sitesDir);
      const siteJsonFiles = siteFiles.filter((f) => f.endsWith(".json"));
      
      for (const file of siteJsonFiles) {
        const filePath = path.join(sitesDir, file);
        const data = await fs.readFile(filePath, "utf8");
        const site: Site = JSON.parse(data);
        await saveSite(site);
        console.log(`  ✅ Migrated site: ${site.name} (${site.slug})`);
      }
    } catch (error) {
      console.log("  ⚠️  No sites directory found or empty");
    }

    // Migrate Pages
    console.log("\n📄 Migrating pages...");
    const pagesDir = path.join(DATA_DIR, "pages");
    try {
      const pageFiles = await fs.readdir(pagesDir);
      const pageJsonFiles = pageFiles.filter((f) => f.endsWith(".json"));
      
      for (const file of pageJsonFiles) {
        const filePath = path.join(pagesDir, file);
        const data = await fs.readFile(filePath, "utf8");
        const page: Page = JSON.parse(data);
        await savePage(page);
        console.log(`  ✅ Migrated page: ${page.siteSlug}/${page.slug}`);
      }
    } catch (error) {
      console.log("  ⚠️  No pages directory found or empty");
    }

    // Migrate Leads
    console.log("\n📧 Migrating leads...");
    const leadsDir = path.join(DATA_DIR, "leads");
    try {
      const leadFiles = await fs.readdir(leadsDir);
      const leadJsonFiles = leadFiles.filter((f) => f.endsWith(".json"));
      
      for (const file of leadJsonFiles) {
        const filePath = path.join(leadsDir, file);
        const data = await fs.readFile(filePath, "utf8");
        const leads: Lead[] = JSON.parse(data);
        
        for (const lead of leads) {
          await saveLead(lead);
        }
        console.log(`  ✅ Migrated ${leads.length} leads from ${file}`);
      }
    } catch (error) {
      console.log("  ⚠️  No leads directory found or empty");
    }

    console.log("\n✅ Migration completed successfully!");
    console.log("\n💡 You can now delete the data/ folder if you want (backup first!)");
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  } finally {
    // Close database connection
    const pool = require("../lib/db").default;
    await pool.end();
  }
}

migrateJSONToDatabase();

