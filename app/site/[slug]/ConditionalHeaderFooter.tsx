"use client";

import { useSearchParams } from "next/navigation";
import { Site } from "@/types";
import HeaderRenderer from "@/components/HeaderRenderer";

interface ConditionalHeaderFooterProps {
  site: Site;
}

export default function ConditionalHeaderFooter({ site }: ConditionalHeaderFooterProps) {
  const searchParams = useSearchParams();
  const isAdmin = searchParams.get("admin") === "true";

  // In admin mode, don't render header here - it's rendered in PageRenderer mobile preview
  if (isAdmin) {
    return null;
  }

  // Normal mode - render header
  return site.header ? <HeaderRenderer site={site} /> : null;
}

