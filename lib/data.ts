import { Site, Page, Lead } from "@/types";
import fs from "fs/promises";
import path from "path";

// Using JSON files for data storage (fastest for MVP)
const DATA_DIR = path.join(process.cwd(), "data");

export async function getSite(slug: string): Promise<Site | null> {
  try {
    const filePath = path.join(DATA_DIR, "sites", `${slug}.json`);
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function getAllSites(): Promise<Site[]> {
  try {
    const sitesDir = path.join(DATA_DIR, "sites");
    const files = await fs.readdir(sitesDir);
    const sites = await Promise.all(
      files
        .filter((f: string) => f.endsWith(".json"))
        .map(async (file: string) => {
          const data = await fs.readFile(path.join(sitesDir, file), "utf8");
          return JSON.parse(data);
        })
    );
    return sites;
  } catch {
    return [];
  }
}

export async function saveSite(site: Site): Promise<void> {
  const sitesDir = path.join(DATA_DIR, "sites");
  await fs.mkdir(sitesDir, { recursive: true });
  const filePath = path.join(sitesDir, `${site.slug}.json`);
  await fs.writeFile(filePath, JSON.stringify(site, null, 2));
}

export async function getPage(siteSlug: string, pageSlug: string = "home"): Promise<Page | null> {
  try {
    const filePath = path.join(DATA_DIR, "pages", `${siteSlug}-${pageSlug}.json`);
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function savePage(page: Page): Promise<void> {
  const pagesDir = path.join(DATA_DIR, "pages");
  await fs.mkdir(pagesDir, { recursive: true });
  const filePath = path.join(pagesDir, `${page.siteSlug}-${page.slug}.json`);
  await fs.writeFile(filePath, JSON.stringify(page, null, 2));
}

export async function getLeads(siteSlug: string): Promise<Lead[]> {
  try {
    const filePath = path.join(DATA_DIR, "leads", `${siteSlug}.json`);
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function saveLead(lead: Lead): Promise<void> {
  const leadsDir = path.join(DATA_DIR, "leads");
  await fs.mkdir(leadsDir, { recursive: true });
  const filePath = path.join(leadsDir, `${lead.siteSlug}.json`);
  
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

