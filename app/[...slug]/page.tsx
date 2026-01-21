import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getSiteByDomain, getAllSites } from "@/lib/data";

// Catch-all route for pages that don't start with /site/
// This handles routes like /contact-us and redirects them to /site/[slug]/contact-us
export default async function CatchAllPage({ params }: { params: { slug: string[] } }) {
  const headersList = await headers();
  const hostname = headersList.get("host") || "";
  
  // Get the page slug from the path
  const pageSlug = params.slug.join("/");
  
  // Try to find site by domain
  let site = await getSiteByDomain(hostname);
  
  // If no site found by domain, get the first site as fallback
  if (!site) {
    const sites = await getAllSites();
    if (sites.length > 0) {
      site = sites[0];
    }
  }
  
  if (site) {
    // Redirect to the proper site route
    redirect(`/site/${site.slug}/${pageSlug}`);
  }
  
  // No site found, show 404
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Page not found</h1>
        <p className="text-gray-600">The page you&apos;re looking for doesn&apos;t exist.</p>
      </div>
    </div>
  );
}

