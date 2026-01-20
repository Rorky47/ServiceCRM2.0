import pool, { query } from "../lib/db";

async function migrateColumns() {
  if (!process.env.DATABASE_URL) {
    console.log("⚠️  DATABASE_URL not set. Cannot run migration.");
    process.exit(1);
  }

  try {
    console.log("🔄 Starting migration to add domains and seo columns...");

    // Check if domains column exists
    const domainsCheck = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'sites' AND column_name = 'domains'
    `);

    if (domainsCheck.rows.length === 0) {
      console.log("  ➕ Adding 'domains' column...");
      await query("ALTER TABLE sites ADD COLUMN domains TEXT[] DEFAULT '{}'");
      console.log("  ✅ 'domains' column added");
    } else {
      console.log("  ✓ 'domains' column already exists");
    }

    // Check if seo column exists
    const seoCheck = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'sites' AND column_name = 'seo'
    `);

    if (seoCheck.rows.length === 0) {
      console.log("  ➕ Adding 'seo' column...");
      await query("ALTER TABLE sites ADD COLUMN seo JSONB");
      console.log("  ✅ 'seo' column added");
    } else {
      console.log("  ✓ 'seo' column already exists");
    }

    // Update existing rows
    try {
      await query("UPDATE sites SET domains = '{}' WHERE domains IS NULL");
      console.log("  ✅ Updated existing sites with default domains");
    } catch (error) {
      console.log("  ⚠️  Could not update existing sites (this is OK)");
    }

    console.log("✅ Migration complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrateColumns();

