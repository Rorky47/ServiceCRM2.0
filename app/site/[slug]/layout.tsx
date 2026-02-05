import { getSite } from "@/lib/data";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import CustomHeadCode from "@/components/CustomHeadCode";
import AnalyticsScripts from "@/components/AnalyticsScripts";
import ConditionalHeaderFooter from "./ConditionalHeaderFooter";
import ConditionalFooter from "./ConditionalFooter";

interface SiteLayoutProps {
  children: React.ReactNode;
  params: { slug: string };
}

function buildBaseUrl(site: { domains?: string[] }, hostFromHeaders: string, protocol: string): string {
  const primaryDomain = site.domains?.[0];
  if (primaryDomain) {
    const domain = primaryDomain.replace(/^https?:\/\//, "").replace(/\/$/, "");
    return `https://${domain}`;
  }
  return `${protocol}://${hostFromHeaders}`;
}

export default async function SiteLayout({ children, params }: SiteLayoutProps) {
  const site = await getSite(params.slug);
  if (!site) {
    notFound();
  }

  const headersList = await headers();
  const host = headersList.get("host") || "";
  const protocol = headersList.get("x-forwarded-proto") || "https";
  const baseUrl = buildBaseUrl(site, host, protocol);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: baseUrl.replace(/\/$/, ""),
  };

  return (
    <div className="flex flex-col min-h-screen" suppressHydrationWarning>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CustomHeadCode headCode={site.customCode?.head} favicon={site.theme?.favicon} />
      <AnalyticsScripts analytics={site.analytics} />
      <ConditionalHeaderFooter site={site} />
      <main className="flex-1">{children}</main>
      <ConditionalFooter site={site} />
      {site.customCode?.footer && (
        <script
          dangerouslySetInnerHTML={{ __html: site.customCode.footer }}
          suppressHydrationWarning
        />
      )}
    </div>
  );
}

