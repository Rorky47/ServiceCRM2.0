import { notFound } from "next/navigation";
import { Metadata } from "next";
import { headers } from "next/headers";
import { getSite, getPage } from "@/lib/data";
import PageRenderer from "@/components/PageRenderer";

interface PageProps {
  params: { slug: string; pageSlug: string };
  searchParams: { admin?: string };
}

function buildBaseUrl(site: { domains?: string[] }, hostFromHeaders: string, protocol: string): string {
  const primaryDomain = site.domains?.[0];
  if (primaryDomain) {
    const domain = primaryDomain.replace(/^https?:\/\//, "").replace(/\/$/, "");
    return `https://${domain}`;
  }
  return `${protocol}://${hostFromHeaders}`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const site = await getSite(params.slug);
  if (!site) {
    return {};
  }
  const page = await getPage(params.slug, params.pageSlug);
  if (!page) {
    return {};
  }
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const protocol = headersList.get("x-forwarded-proto") || "https";
  const baseUrl = buildBaseUrl(site, host, protocol);
  const pathSegment = params.pageSlug ? `/${params.pageSlug}` : "";
  const pageUrl = `${baseUrl.replace(/\/$/, "")}${pathSegment}`;
  const title = page.title || site.seo?.title || site.name;
  const description = site.seo?.description || `${site.name} - Professional service business`;
  const ogImage = site.seo?.image || site.theme?.logo;
  const images = ogImage
    ? [{ url: ogImage.startsWith("http") ? ogImage : `${baseUrl}/${ogImage.replace(/^\//, "")}` }]
    : undefined;

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    keywords: site.seo?.keywords,
    alternates: { canonical: pageUrl },
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: site.name,
      ...(images && { images }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(images && { images: images.map((i) => i.url) }),
    },
    icons: site.theme?.favicon
      ? {
          icon: site.theme.favicon,
          shortcut: site.theme.favicon,
          apple: site.theme.favicon,
        }
      : undefined,
    other: {
      ...(site.theme?.favicon && { "apple-touch-icon": site.theme.favicon }),
      ...(site.seo?.googleVerification && { "google-site-verification": site.seo.googleVerification }),
      ...(site.seo?.facebookAppId && { "fb:app_id": site.seo.facebookAppId }),
    },
  };
}

export default async function DynamicPage({ params, searchParams }: PageProps) {
  try {
    const site = await getSite(params.slug);
    if (!site) {
      notFound();
    }

    const page = await getPage(params.slug, params.pageSlug);
    if (!page) {
      notFound();
    }

    const isAdmin = searchParams.admin === "true";

    return <PageRenderer site={site} page={page} isAdmin={isAdmin} />;
  } catch (error) {
    console.error("Error rendering page:", error);
    notFound();
  }
}

