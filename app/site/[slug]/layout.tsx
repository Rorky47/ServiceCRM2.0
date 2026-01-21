import { getSite } from "@/lib/data";
import { notFound } from "next/navigation";
import CustomHeadCode from "@/components/CustomHeadCode";
import HeaderRenderer from "@/components/HeaderRenderer";
import FooterRenderer from "@/components/FooterRenderer";

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
    <div className="flex flex-col min-h-screen" suppressHydrationWarning>
      <CustomHeadCode headCode={site.customCode?.head} favicon={site.theme?.favicon} />
      {site.header && <HeaderRenderer site={site} />}
      <main className="flex-1">{children}</main>
      {site.footer && <FooterRenderer site={site} />}
      {site.customCode?.footer && (
        <script 
          dangerouslySetInnerHTML={{ __html: site.customCode.footer }} 
          suppressHydrationWarning
        />
      )}
    </div>
  );
}

