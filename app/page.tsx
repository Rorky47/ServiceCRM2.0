import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getSiteByDomain, getAllSites } from "@/lib/data";

export default async function Home() {
  const headersList = await headers();
  const hostname = headersList.get("host") || "";
  
  // Try to find site by domain
  const site = await getSiteByDomain(hostname);
  
  if (site) {
    // Found site by domain, redirect to root page for that site
    redirect(`/site/${site.slug}`);
  }
  
  // No domain match, check if we have any sites
  const sites = await getAllSites();
  if (sites.length > 0) {
    // Redirect to first site as fallback
    redirect(`/site/${sites[0].slug}`);
  }
  
  // No sites found, show 404
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Site not found</h1>
        <p className="text-gray-600">No site configured for this domain.</p>
      </div>
    </div>
  );
}

