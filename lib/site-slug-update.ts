import { query } from "./db";

/**
 * Updates a site slug and all related data (pages, leads, users)
 * This is a critical operation that updates foreign key references
 */
export async function updateSiteSlug(oldSlug: string, newSlug: string): Promise<void> {
  // Validate new slug format (alphanumeric, hyphens, underscores only)
  if (!/^[a-zA-Z0-9_-]+$/.test(newSlug)) {
    throw new Error("Slug can only contain letters, numbers, hyphens, and underscores");
  }

  // Check if new slug already exists
  const existingSite = await query("SELECT slug FROM sites WHERE slug = $1", [newSlug]);
  if (existingSite.rows.length > 0) {
    throw new Error(`A site with slug "${newSlug}" already exists`);
  }

  // Start transaction-like operations
  try {
    // Update sites table
    await query("UPDATE sites SET slug = $1 WHERE slug = $2", [newSlug, oldSlug]);

    // Update pages table
    await query("UPDATE pages SET site_slug = $1 WHERE site_slug = $2", [newSlug, oldSlug]);

    // Update leads table
    await query("UPDATE leads SET site_slug = $1 WHERE site_slug = $2", [newSlug, oldSlug]);

    // Update users table - replace old slug with new slug in site_slugs array
    // This is more complex as we need to update array elements
    const users = await query("SELECT id, email, site_slugs FROM users WHERE $1 = ANY(site_slugs)", [oldSlug]);
    
    for (const user of users.rows) {
      const siteSlugs = (user.site_slugs || []) as string[];
      const updatedSlugs = siteSlugs.map(slug => slug === oldSlug ? newSlug : slug);
      await query("UPDATE users SET site_slugs = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [
        updatedSlugs,
        user.id
      ]);
    }

    console.log(`Successfully updated site slug from "${oldSlug}" to "${newSlug}"`);
  } catch (error) {
    console.error("Error updating site slug:", error);
    throw error;
  }
}

