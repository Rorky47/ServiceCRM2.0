import Link from "next/link";
import { normalizeInternalLink } from "@/lib/link-utils";
import { ReactNode } from "react";

interface SmartLinkProps {
  href: string;
  siteSlug: string;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  prefetch?: boolean;
  onClick?: () => void;
}

/**
 * SmartLink component that automatically handles internal vs external links.
 * - Uses Next.js Link for internal routes
 * - Uses regular <a> tag for external URLs, anchors, mailto, tel, etc.
 * - Automatically normalizes internal links to include site slug
 */
export default function SmartLink({
  href,
  siteSlug,
  children,
  className = "",
  style,
  prefetch = false,
  onClick,
}: SmartLinkProps) {
  const normalizedUrl = normalizeInternalLink(href, siteSlug);
  const isAnchor = normalizedUrl.startsWith("#");
  const isExternal = normalizedUrl.startsWith("http://") || normalizedUrl.startsWith("https://");
  const isMailto = normalizedUrl.startsWith("mailto:");
  const isTel = normalizedUrl.startsWith("tel:");

  // Use anchor tags for special protocols and anchor links
  if (isAnchor || isExternal || isMailto || isTel) {
    return (
      <a
        href={normalizedUrl}
        className={className}
        style={style}
        onClick={onClick}
        {...(isExternal && { target: "_blank", rel: "noopener noreferrer" })}
      >
        {children}
      </a>
    );
  }

  // For internal routes, use Next.js Link
  return (
    <Link
      href={normalizedUrl}
      className={className}
      style={style}
      prefetch={prefetch}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}

