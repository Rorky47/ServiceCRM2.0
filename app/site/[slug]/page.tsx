import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getSite, getPage } from "@/lib/data";
import PageRenderer from "@/components/PageRenderer";

interface PageProps {
  params: { slug: string };
  searchParams: { admin?: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const site = await getSite(params.slug);
  if (!site) {
    return {};
  }
  return {
    title: site.name,
    description: `${site.name} - Professional service business`,
  };
}

export default async function SitePage({ params, searchParams }: PageProps) {
  const site = await getSite(params.slug);
  if (!site) {
    notFound();
  }

  const page = await getPage(params.slug, "home");
  if (!page) {
    notFound();
  }

  const isAdmin = searchParams.admin === "true";

  return <PageRenderer site={site} page={page} isAdmin={isAdmin} />;
}

