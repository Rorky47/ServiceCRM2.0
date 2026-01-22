"use client";

import { useSearchParams } from "next/navigation";
import { Site } from "@/types";
import FooterRenderer from "@/components/FooterRenderer";

interface ConditionalFooterProps {
  site: Site;
}

export default function ConditionalFooter({ site }: ConditionalFooterProps) {
  const searchParams = useSearchParams();
  const isAdmin = searchParams.get("admin") === "true";

  // In admin mode, don't render footer here - it's rendered in PageRenderer mobile preview
  if (isAdmin) {
    return null;
  }

  // Normal mode - render footer
  return site.footer ? <FooterRenderer site={site} /> : null;
}
