"use client";

import { Site } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { normalizeInternalLink } from "@/lib/link-utils";

interface FooterRendererProps {
  site: Site;
}

export default function FooterRenderer({ site }: FooterRendererProps) {
  if (!site.footer) return null;

  const footer = site.footer;
  // Use footer logo if set, otherwise use theme logo
  const logo = footer.logo || site.theme?.logo;
  // Use footer social links if set, otherwise use site social links
  const socialLinks = footer.socialLinks || site.socialLinks;
  const socialPlatformIcons: Record<string, string> = {
    facebook: "📘",
    twitter: "🐦",
    instagram: "📷",
    linkedin: "💼",
    youtube: "📺",
    custom: "🔗",
  };

  return (
    <footer
      className="mt-auto"
      style={{
        backgroundColor: footer.backgroundColor || "#1f2937",
        color: footer.textColor || "#ffffff",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo Column */}
          {footer.showLogo && logo && (
            <div className="col-span-1">
              {logo.startsWith("data:") ? (
                <img src={logo} alt={site.name} className="h-12 w-auto mb-4" />
              ) : (
                <Image src={logo} alt={site.name} width={120} height={48} className="h-12 w-auto mb-4" unoptimized />
              )}
            </div>
          )}

          {/* Footer Columns */}
          {footer.columns?.map((column, columnIndex) => (
            <div key={columnIndex}>
              <h3 className="font-semibold mb-4" style={{ color: footer.textColor || "#ffffff" }}>
                {column.title}
              </h3>
              <ul className="space-y-2">
                {column.links.map((link, linkIndex) => {
                  const normalizedUrl = normalizeInternalLink(link.url, site.slug);
                  const isAnchor = normalizedUrl.startsWith("#");
                  const isExternal = normalizedUrl.startsWith("http://") || normalizedUrl.startsWith("https://");
                  
                  if (isAnchor || isExternal) {
                    return (
                      <li key={linkIndex}>
                        <a
                          href={normalizedUrl}
                          className="hover:opacity-80 transition-opacity text-sm"
                          style={{ color: footer.textColor || "#ffffff" }}
                          {...(isExternal && { target: "_blank", rel: "noopener noreferrer" })}
                        >
                          {link.label}
                        </a>
                      </li>
                    );
                  }
                  
                  return (
                    <li key={linkIndex}>
                      <Link
                        href={normalizedUrl}
                        className="hover:opacity-80 transition-opacity text-sm"
                        style={{ color: footer.textColor || "#ffffff" }}
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Social Links and Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-600 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {footer.copyrightText && (
            <p className="text-sm" style={{ color: footer.textColor || "#ffffff" }}>
              {footer.copyrightText}
            </p>
          )}
          {socialLinks && socialLinks.length > 0 && (
            <div className="flex items-center space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-2xl hover:opacity-80 transition-opacity"
                  title={social.label || social.platform}
                >
                  {socialPlatformIcons[social.platform] || "🔗"}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}

