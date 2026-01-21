import { Site, Page, Lead, User } from "@/types";
import pool, { query } from "./db";

// Check if we should use database or fallback to JSON files
const USE_DATABASE = !!process.env.DATABASE_URL;

// Fallback to JSON files if DATABASE_URL is not set
let fs: typeof import("fs/promises") | null = null;
let pathModule: typeof import("path") | null = null;
let DATA_DIR: string | null = null;

if (!USE_DATABASE) {
  try {
    fs = require("fs/promises");
    pathModule = require("path");
    if (pathModule) {
      DATA_DIR = pathModule.join(process.cwd(), "data");
    }
  } catch {
    // fs not available (edge runtime)
  }
}

// ==================== SITES ====================

export async function getSite(slug: string): Promise<Site | null> {
  if (USE_DATABASE) {
    try {
      const result = await query(
        "SELECT id, slug, domains, name, theme, seo FROM sites WHERE slug = $1",
        [slug]
      );
      if (result.rows.length === 0) return null;
      const row = result.rows[0];
      return {
        id: row.id,
        slug: row.slug,
        domains: row.domains || [],
        name: row.name,
        theme: row.theme || { primaryColor: "#0066cc", font: "system-ui" },
        seo: row.seo || undefined,
      };
    } catch (error) {
      console.error("Error fetching site from database:", error);
      return null;
    }
  } else {
    // Fallback to JSON
    if (!fs || !pathModule || !DATA_DIR) return null;
    try {
      const filePath = pathModule.join(DATA_DIR, "sites", `${slug}.json`);
      const data = await fs.readFile(filePath, "utf8");
      const site = JSON.parse(data);
      // Ensure domains array exists for backward compatibility
      if (!site.domains) site.domains = [];
      return site;
    } catch {
      return null;
    }
  }
}

export async function getSiteByDomain(hostname: string): Promise<Site | null> {
  // Normalize hostname (remove port, www, etc.)
  const normalizedHost = hostname
    .toLowerCase()
    .replace(/^www\./, "")
    .split(":")[0]; // Remove port if present

  if (USE_DATABASE) {
    try {
      // Search for site where domain matches
      const result = await query(
        "SELECT id, slug, domains, name, theme, seo FROM sites WHERE $1 = ANY(domains)",
        [normalizedHost]
      );
      if (result.rows.length === 0) return null;
      const row = result.rows[0];
      return {
        id: row.id,
        slug: row.slug,
        domains: row.domains || [],
        name: row.name,
        theme: row.theme || { primaryColor: "#0066cc", font: "system-ui" },
        seo: row.seo || undefined,
      };
    } catch (error) {
      console.error("Error fetching site by domain from database:", error);
      return null;
    }
  } else {
    // Fallback to JSON - search all sites
    if (!fs || !pathModule || !DATA_DIR) return null;
    try {
      const sitesDir = pathModule.join(DATA_DIR, "sites");
      const files = await fs.readdir(sitesDir);
      for (const file of files.filter((f: string) => f.endsWith(".json"))) {
        const filePath = pathModule.join(sitesDir, file);
        const data = await fs.readFile(filePath, "utf8");
        const site: Site = JSON.parse(data);
        const domains = site.domains || [];
        if (domains.some((d) => d.toLowerCase().replace(/^www\./, "") === normalizedHost)) {
          return site;
        }
      }
      return null;
    } catch {
      return null;
    }
  }
}

export async function getAllSites(): Promise<Site[]> {
  if (USE_DATABASE) {
    try {
      const result = await query("SELECT id, slug, domains, name, theme, seo FROM sites ORDER BY name");
      return result.rows.map((row) => ({
        id: row.id,
        slug: row.slug,
        domains: row.domains || [],
        name: row.name,
        theme: row.theme || { primaryColor: "#0066cc", font: "system-ui" },
        seo: row.seo || undefined,
      }));
    } catch (error) {
      console.error("Error fetching sites from database:", error);
      return [];
    }
  } else {
    // Fallback to JSON
    if (!fs || !pathModule || !DATA_DIR) return [];
    try {
      const sitesDir = pathModule.join(DATA_DIR, "sites");
      const files = await fs.readdir(sitesDir);
      const sites = await Promise.all(
        files
          .filter((f: string) => f.endsWith(".json"))
          .map(async (file: string) => {
            const data = await fs.readFile(pathModule!.join(sitesDir, file), "utf8");
            const site = JSON.parse(data);
            if (!site.domains) site.domains = [];
            return site;
          })
      );
      return sites;
    } catch {
      return [];
    }
  }
}

export async function saveSite(site: Site): Promise<void> {
  if (USE_DATABASE) {
    try {
      await query(
        `INSERT INTO sites (id, slug, domains, name, theme, seo, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
         ON CONFLICT (slug) 
         DO UPDATE SET domains = $3, name = $4, theme = $5, seo = $6, updated_at = CURRENT_TIMESTAMP`,
        [
          site.id,
          site.slug,
          site.domains || [], // Pass array directly, not stringified
          site.name,
          JSON.stringify(site.theme),
          site.seo ? JSON.stringify(site.seo) : null,
        ]
      );
    } catch (error) {
      console.error("Error saving site to database:", error);
      throw error;
    }
  } else {
    // Fallback to JSON
    if (!fs || !pathModule || !DATA_DIR) return;
    const sitesDir = pathModule.join(DATA_DIR, "sites");
    await fs.mkdir(sitesDir, { recursive: true });
    const filePath = pathModule.join(sitesDir, `${site.slug}.json`);
    await fs.writeFile(filePath, JSON.stringify(site, null, 2));
  }
}

// ==================== PAGES ====================

export async function getPage(siteSlug: string, pageSlug: string = "home"): Promise<Page | null> {
  if (USE_DATABASE) {
    try {
      const result = await query(
        "SELECT site_slug, slug, sections FROM pages WHERE site_slug = $1 AND slug = $2",
        [siteSlug, pageSlug]
      );
      if (result.rows.length === 0) return null;
      const row = result.rows[0];
      return {
        siteSlug: row.site_slug,
        slug: row.slug,
        sections: row.sections,
      };
    } catch (error) {
      console.error("Error fetching page from database:", error);
      return null;
    }
  } else {
    // Fallback to JSON
    if (!fs || !pathModule || !DATA_DIR) return null;
    try {
      const filePath = pathModule.join(DATA_DIR, "pages", `${siteSlug}-${pageSlug}.json`);
      const data = await fs.readFile(filePath, "utf8");
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
}

export async function savePage(page: Page): Promise<void> {
  if (USE_DATABASE) {
    try {
      await query(
        `INSERT INTO pages (site_slug, slug, sections, updated_at)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
         ON CONFLICT (site_slug, slug)
         DO UPDATE SET sections = $3, updated_at = CURRENT_TIMESTAMP`,
        [page.siteSlug, page.slug, JSON.stringify(page.sections)]
      );
    } catch (error) {
      console.error("Error saving page to database:", error);
      throw error;
    }
  } else {
    // Fallback to JSON
    if (!fs || !pathModule || !DATA_DIR) return;
    const pagesDir = pathModule.join(DATA_DIR, "pages");
    await fs.mkdir(pagesDir, { recursive: true });
    const filePath = pathModule.join(pagesDir, `${page.siteSlug}-${page.slug}.json`);
    await fs.writeFile(filePath, JSON.stringify(page, null, 2));
  }
}

// ==================== LEADS ====================

export async function getLeads(siteSlug: string): Promise<Lead[]> {
  if (USE_DATABASE) {
    try {
      const result = await query(
        "SELECT id, site_slug, name, email, message, created_at FROM leads WHERE site_slug = $1 ORDER BY created_at DESC",
        [siteSlug]
      );
      return result.rows.map((row) => ({
        id: row.id,
        siteSlug: row.site_slug,
        name: row.name,
        email: row.email,
        message: row.message,
        createdAt: row.created_at.toISOString(),
      }));
    } catch (error) {
      console.error("Error fetching leads from database:", error);
      return [];
    }
  } else {
    // Fallback to JSON
    if (!fs || !pathModule || !DATA_DIR) return [];
    try {
      const filePath = pathModule.join(DATA_DIR, "leads", `${siteSlug}.json`);
      const data = await fs.readFile(filePath, "utf8");
      return JSON.parse(data);
    } catch {
      return [];
    }
  }
}

export async function saveLead(lead: Lead): Promise<void> {
  if (USE_DATABASE) {
    try {
      await query(
        "INSERT INTO leads (id, site_slug, name, email, message, created_at) VALUES ($1, $2, $3, $4, $5, $6)",
        [lead.id, lead.siteSlug, lead.name, lead.email, lead.message, lead.createdAt]
      );
    } catch (error) {
      console.error("Error saving lead to database:", error);
      throw error;
    }
  } else {
    // Fallback to JSON
    if (!fs || !pathModule || !DATA_DIR) return;
    const leadsDir = pathModule.join(DATA_DIR, "leads");
    await fs.mkdir(leadsDir, { recursive: true });
    const filePath = pathModule.join(leadsDir, `${lead.siteSlug}.json`);
    
    let leads: Lead[] = [];
    try {
      const data = await fs.readFile(filePath, "utf8");
      leads = JSON.parse(data);
    } catch {
      // File doesn't exist yet
    }
    
    leads.push(lead);
    await fs.writeFile(filePath, JSON.stringify(leads, null, 2));
  }
}

// ==================== PAGES - Additional Functions ====================

export async function getAllPages(siteSlug: string): Promise<Page[]> {
  if (USE_DATABASE) {
    try {
      const result = await query(
        "SELECT site_slug, slug, sections FROM pages WHERE site_slug = $1 ORDER BY slug",
        [siteSlug]
      );
      return result.rows.map((row) => ({
        siteSlug: row.site_slug,
        slug: row.slug,
        sections: row.sections,
      }));
    } catch (error) {
      console.error("Error fetching pages from database:", error);
      return [];
    }
  } else {
    // Fallback to JSON
    if (!fs || !pathModule || !DATA_DIR) return [];
    try {
      const pagesDir = pathModule.join(DATA_DIR, "pages");
      const files = await fs.readdir(pagesDir);
      const pages = await Promise.all(
        files
          .filter((f: string) => f.startsWith(`${siteSlug}-`) && f.endsWith(".json"))
          .map(async (file: string) => {
            const data = await fs.readFile(pathModule!.join(pagesDir, file), "utf8");
            return JSON.parse(data);
          })
      );
      return pages;
    } catch {
      return [];
    }
  }
}

export async function deletePage(siteSlug: string, pageSlug: string): Promise<void> {
  if (USE_DATABASE) {
    try {
      await query("DELETE FROM pages WHERE site_slug = $1 AND slug = $2", [siteSlug, pageSlug]);
    } catch (error) {
      console.error("Error deleting page from database:", error);
      throw error;
    }
  } else {
    // Fallback to JSON
    if (!fs || !pathModule || !DATA_DIR) return;
    try {
      const filePath = pathModule.join(DATA_DIR, "pages", `${siteSlug}-${pageSlug}.json`);
      await fs.unlink(filePath);
    } catch {
      // File doesn't exist, that's fine
    }
  }
}

// ==================== USERS ====================

export async function getUser(email: string): Promise<User | null> {
  if (USE_DATABASE) {
    try {
      const result = await query("SELECT id, email, role, site_slugs FROM users WHERE email = $1", [email]);
      if (result.rows.length === 0) return null;
      const row = result.rows[0];
      return {
        id: row.id,
        email: row.email,
        role: row.role,
        siteSlugs: row.site_slugs || undefined,
      };
    } catch (error) {
      console.error("Error fetching user from database:", error);
      return null;
    }
  } else {
    // Fallback to JSON
    if (!fs || !pathModule || !DATA_DIR) return null;
    try {
      const filePath = pathModule.join(DATA_DIR, "users", `${email.replace(/[^a-z0-9]/gi, "_")}.json`);
      const data = await fs.readFile(filePath, "utf8");
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
}

export async function saveUser(user: User): Promise<void> {
  if (USE_DATABASE) {
    try {
      await query(
        `INSERT INTO users (id, email, role, site_slugs, updated_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
         ON CONFLICT (email) 
         DO UPDATE SET role = $3, site_slugs = $4, updated_at = CURRENT_TIMESTAMP`,
        [user.id, user.email, user.role, user.siteSlugs || []] // Pass array directly, not stringified
      );
    } catch (error) {
      console.error("Error saving user to database:", error);
      throw error;
    }
  } else {
    // Fallback to JSON
    if (!fs || !pathModule || !DATA_DIR) return;
    const usersDir = pathModule.join(DATA_DIR, "users");
    await fs.mkdir(usersDir, { recursive: true });
    const filePath = pathModule.join(usersDir, `${user.email.replace(/[^a-z0-9]/gi, "_")}.json`);
    await fs.writeFile(filePath, JSON.stringify(user, null, 2));
  }
}

// ==================== ACCESS CONTROL ====================

export function checkAccess(user: User | null, siteSlug: string): boolean {
  if (!user) return false;
  if (user.role === "superAdmin") return true;
  if (user.role === "siteOwner") {
    return user.siteSlugs?.includes(siteSlug) ?? false;
  }
  return false;
}
