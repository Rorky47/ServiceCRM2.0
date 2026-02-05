/**
 * One-time migration: copy data from public.pages and public.leads into
 * per-site schemas (site_<sanitized_id>.pages and .leads), then drop the
 * old shared tables. Run this after deploying the schema-per-site code if
 * you have an existing DB that still has public.pages and public.leads.
 *
 * Usage: DATABASE_URL=... npx ts-node scripts/migrate-to-site-schemas.ts
 */

import { query } from "../lib/db";
import { getSchemaName, ensureSiteSchema } from "../lib/data";

async function migrateToSiteSchemas() {
  if (!process.env.DATABASE_URL) {
    console.error("ERROR: DATABASE_URL is required.");
    process.exit(1);
  }

  try {
    // Check if public.pages and public.leads exist
    const tables = await query(`
      SELECT table_schema, table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name IN ('pages', 'leads')
    `);
    const hasPages = tables.rows.some((r: { table_name: string }) => r.table_name === "pages");
    const hasLeads = tables.rows.some((r: { table_name: string }) => r.table_name === "leads");

    if (!hasPages && !hasLeads) {
      console.log("No public.pages or public.leads found. Nothing to migrate.");
      return;
    }

    // Collect distinct site_slugs from pages and leads
    const siteSlugs = new Set<string>();
    if (hasPages) {
      const pageSlugs = await query('SELECT DISTINCT site_slug FROM public.pages');
      pageSlugs.rows.forEach((r: { site_slug: string }) => siteSlugs.add(r.site_slug));
    }
    if (hasLeads) {
      const leadSlugs = await query('SELECT DISTINCT site_slug FROM public.leads');
      leadSlugs.rows.forEach((r: { site_slug: string }) => siteSlugs.add(r.site_slug));
    }

    if (siteSlugs.size === 0) {
      console.log("No site-specific data in public.pages or public.leads. Dropping tables if present.");
      if (hasPages) await query("DROP TABLE IF EXISTS public.pages");
      if (hasLeads) await query("DROP TABLE IF EXISTS public.leads");
      console.log("Done.");
      return;
    }

    // Resolve site_slug -> site id
    const siteIdBySlug = new Map<string, string>();
    for (const slug of siteSlugs) {
      const res = await query("SELECT id FROM sites WHERE slug = $1", [slug]);
      if (res.rows.length === 0) {
        console.warn(`  ⚠️  No site found for slug "${slug}", skipping data for this slug.`);
        continue;
      }
      siteIdBySlug.set(slug, res.rows[0].id);
    }

    for (const siteSlug of siteSlugs) {
      const siteId = siteIdBySlug.get(siteSlug);
      if (!siteId) continue;

      const schemaName = getSchemaName(siteId);
      await ensureSiteSchema(siteId);

      if (hasPages) {
        const count = await query(
          `INSERT INTO "${schemaName}".pages (slug, sections, created_at, updated_at)
           SELECT slug, sections, created_at, updated_at FROM public.pages WHERE site_slug = $1
           ON CONFLICT (slug) DO UPDATE SET sections = EXCLUDED.sections, updated_at = EXCLUDED.updated_at`,
          [siteSlug]
        );
        console.log(`  ✅ Migrated pages for site ${siteSlug} -> ${schemaName} (${count.rowCount ?? 0} rows)`);
      }

      if (hasLeads) {
        const count = await query(
          `INSERT INTO "${schemaName}".leads (id, name, email, message, created_at)
           SELECT id, name, email, message, created_at FROM public.leads WHERE site_slug = $1
           ON CONFLICT (id) DO NOTHING`,
          [siteSlug]
        );
        console.log(`  ✅ Migrated leads for site ${siteSlug} -> ${schemaName} (${count.rowCount ?? 0} rows)`);
      }
    }

    if (hasPages) {
      await query("DROP TABLE IF EXISTS public.pages");
      console.log("  🗑️  Dropped public.pages");
    }
    if (hasLeads) {
      await query("DROP TABLE IF EXISTS public.leads");
      console.log("  🗑️  Dropped public.leads");
    }

    console.log("Migration completed successfully.");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    const pool = require("../lib/db").default;
    await pool.end();
  }
}

migrateToSiteSchemas();
