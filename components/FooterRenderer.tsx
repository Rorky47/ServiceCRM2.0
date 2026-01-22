"use client";

import { Site } from "@/types";
import { normalizeInternalLink } from "@/lib/link-utils";
import SocialIcon from "@/components/SocialIcon";
import OptimizedImage from "@/components/OptimizedImage";
import SmartLink from "@/components/SmartLink";
import { FaEnvelope, FaPhone } from "react-icons/fa";

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

  const hasLogo = footer.showLogo && logo;
  const columnCount = footer.columns?.length || 0;
  const hasContact = footer.emailAddress || footer.phoneNumber;
  
  // Calculate total items for grid
  const totalItems = (hasLogo ? 1 : 0) + columnCount + (hasContact ? 1 : 0);
  
  // Dynamic grid classes that adapt to content
  // Uses a flexible grid that distributes items evenly across available space
  const getGridClasses = () => {
    if (totalItems === 0) return "grid-cols-1";
    if (totalItems === 1) return "grid-cols-1";
    if (totalItems === 2) return "grid-cols-1 sm:grid-cols-2";
    if (totalItems === 3) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    if (totalItems === 4) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
    if (totalItems === 5) return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5";
    // For 6+ items, use responsive grid that adapts
    return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
  };

  return (
    <footer
      className="mt-auto"
      style={{
        backgroundColor: footer.backgroundColor || "#1f2937",
        color: footer.textColor || "#ffffff",
      }}
    >
      <div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        style={{
          paddingTop: `${((footer as any)?.topPadding ?? 12) * 4}px`,
          paddingBottom: `${((footer as any)?.bottomPadding ?? 8) * 4}px`,
        }}
      >
        <div 
          className={`grid ${getGridClasses()} items-start w-full justify-items-stretch`}
          style={{
            gap: `${((footer as any)?.columnGap ?? 6) * 4}px`,
            // On mobile (single column), ensure sufficient vertical spacing
            rowGap: `clamp(24px, ${((footer as any)?.columnGap ?? 6) * 4}px, 48px)`,
          }}
        >
          {/* Logo */}
          {hasLogo && (
            <div 
              className="min-w-0 w-full footer-logo-container" 
              style={{ 
                maxWidth: '100%',
                overflow: 'hidden',
                // Add bottom margin to ensure spacing before next grid item
                marginBottom: '0',
                paddingBottom: '1rem', // Padding instead of margin for better grid behavior
              }}
            >
              <OptimizedImage
                src={logo}
                alt={site.name}
                width={120}
                height={48}
                className={`w-auto max-w-full footer-logo-image ${
                  footer.logoSize === "small"
                    ? "h-8 sm:h-10"
                    : footer.logoSize === "medium"
                    ? "h-12 sm:h-14"
                    : footer.logoSize === "large"
                    ? "h-16 sm:h-20"
                    : footer.logoSize === "xlarge"
                    ? "h-20 sm:h-24"
                    : "h-12 sm:h-14" // default medium
                }`}
                style={footer.logoScale ? { 
                  transform: `scale(${footer.logoScale / 100})`, 
                  transformOrigin: 'top left',
                  maxWidth: '100%',
                } : {
                  maxWidth: '100%',
                }}
                unoptimized
              />
            </div>
          )}

          {/* Footer Columns */}
          {footer.columns?.map((column, columnIndex) => (
            <div key={columnIndex} className="min-w-0 w-full">
              <h3 className="font-semibold mb-4" style={{ color: footer.textColor || "#ffffff" }}>
                {column.title}
              </h3>
              <ul className="space-y-2">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <SmartLink
                      href={link.url}
                      siteSlug={site.slug}
                      className="hover:opacity-80 transition-opacity text-sm"
                      style={{ color: footer.textColor || "#ffffff" }}
                    >
                      {link.label}
                    </SmartLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Information */}
          {hasContact && (
            <div className="min-w-0 w-full">
              <h3 className="font-semibold mb-4" style={{ color: footer.textColor || "#ffffff" }}>
                Contact
              </h3>
              <div className="flex flex-col gap-4" style={{ color: footer.textColor || "#ffffff" }}>
                {footer.emailAddress && (
                  <div className="flex items-start space-x-3">
                    <FaEnvelope className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <a
                      href={`mailto:${footer.emailAddress}`}
                      className="hover:opacity-80 transition-opacity text-base font-medium break-words"
                      style={{ color: footer.textColor || "#ffffff" }}
                    >
                      {footer.emailAddress}
                    </a>
                  </div>
                )}
                {footer.phoneNumber && (
                  <div className="flex items-start space-x-3">
                    <FaPhone className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <a
                      href={`tel:${footer.phoneNumber.replace(/\s/g, '')}`}
                      className="hover:opacity-80 transition-opacity text-base font-medium break-words"
                      style={{ color: footer.textColor || "#ffffff" }}
                    >
                      {footer.phoneNumber}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Social Links and Copyright */}
        <div 
          className={`${(footer.emailAddress || footer.phoneNumber) ? '' : 'pt-6 border-t border-gray-600'} flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0`}
          style={{
            marginTop: `${((footer as any)?.bottomMargin ?? 6) * 4}px`,
          }}
        >
          {footer.copyrightText && (
            <p className="text-sm" style={{ color: footer.textColor || "#ffffff" }}>
              {footer.copyrightText}
            </p>
          )}
          {socialLinks && socialLinks.length > 0 && (
            <div className="flex items-center space-x-4">
              {socialLinks.map((social, index) => {
                // For email platform, ensure mailto: prefix is present
                let href = social.url;
                if (social.platform === "email") {
                  // Remove any existing mailto: prefix to avoid duplication
                  href = social.url.replace(/^mailto:/i, "");
                  href = `mailto:${href}`;
                }
                return (
                  <a
                    key={index}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-80 transition-opacity"
                    title={social.label || social.platform}
                    style={{ color: footer.textColor || "#ffffff" }}
                  >
                    <SocialIcon platform={social.platform} size="lg" />
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}

