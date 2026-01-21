import { getSite } from "@/lib/data";
import { notFound } from "next/navigation";
import CustomHeadCode from "@/components/CustomHeadCode";

interface SiteLayoutProps {
  children: React.ReactNode;
  params: { slug: string };
}

export default async function SiteLayout({ children, params }: SiteLayoutProps) {
  const site = await getSite(params.slug);
  if (!site) {
    notFound();
  }

  return (
    <>
      <CustomHeadCode headCode={site.customCode?.head} favicon={site.theme?.favicon} />
      {children}
      {site.customCode?.footer && (
        <script dangerouslySetInnerHTML={{ __html: site.customCode.footer }} />
      )}
    </>
  );
}

