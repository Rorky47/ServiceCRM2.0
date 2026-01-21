import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getSite, getPage } from "@/lib/data";
import PageRenderer from "@/components/PageRenderer";

interface PageProps {
  params: { slug: string; pageSlug: string };
  searchParams: { admin?: string };
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
  return {
    title: site.seo?.title || site.name,
    description: site.seo?.description || `${site.name} - Professional service business`,
    keywords: site.seo?.keywords,
    icons: site.theme?.favicon ? {
      icon: site.theme.favicon,
      shortcut: site.theme.favicon,
      apple: site.theme.favicon,
    } : undefined,
    other: {
      ...(site.theme?.favicon && { 'apple-touch-icon': site.theme.favicon }),
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

