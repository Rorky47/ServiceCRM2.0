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

// Preset spacing system - all spacing uses multiples of 40px
const PRESET_SPACING_UNIT = 40; // Base unit in pixels
const getPresetSpacing = (multiplier: number): number => multiplier * PRESET_SPACING_UNIT;

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
          // Use preset spacing: topPadding stored as multiplier (default 1 = 40px)
          paddingTop: `${getPresetSpacing((footer as any)?.topPadding ?? 1)}px`,
          // Use preset spacing: bottomPadding stored as multiplier (default 1 = 40px)
          paddingBottom: `${getPresetSpacing((footer as any)?.bottomPadding ?? 1)}px`,
        }}
      >
        <div 
          className={`grid ${getGridClasses()} items-start w-full justify-items-stretch`}
          style={{
            // Use preset spacing: columnGap stored as multiplier (default 1 = 40px)
            gap: `${getPresetSpacing((footer as any)?.columnGap ?? 1)}px`,
            // On mobile (single column), ensure minimum preset spacing
            rowGap: `${getPresetSpacing((footer as any)?.columnGap ?? 1)}px`,
          }}
        >
          {/* Logo */}
          {hasLogo && (
            <div 
              className="min-w-0 w-full footer-logo-container" 
              style={{ 
                maxWidth: '100%',
                overflow: 'visible', // Allow logo to display fully
              }}
            >
              <OptimizedImage
                src={logo}
                alt={site.name}
                width={120}
                height={48}
                className={`w-auto max-w-full footer-logo-image ${
                  // When logoScale is set, use fixed height to prevent inverse scaling
                  footer.logoScale 
                    ? (footer.logoSize === "small"
                        ? "h-8"
                        : footer.logoSize === "medium"
                        ? "h-12"
                        : footer.logoSize === "large"
                        ? "h-16"
                        : footer.logoSize === "xlarge"
                        ? "h-20"
                        : "h-12") // default medium - fixed height when scaled
                    : (footer.logoSize === "small"
                        ? "h-8 sm:h-10"
                        : footer.logoSize === "medium"
                        ? "h-12 sm:h-14"
                        : footer.logoSize === "large"
                        ? "h-16 sm:h-20"
                        : footer.logoSize === "xlarge"
                        ? "h-20 sm:h-24"
                        : "h-12 sm:h-14") // default medium - responsive when not scaled
                }`}
                style={footer.logoScale ? { 
                  transform: `scale(${footer.logoScale / 100})`, 
                  transformOrigin: 'top left',
                  maxWidth: '100%',
                  // Ensure consistent sizing regardless of viewport
                  height: 'auto',
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
              <h3 
                className="font-semibold" 
                style={{ 
                  color: footer.textColor || "#ffffff",
                  marginBottom: `${getPresetSpacing(0.5)}px`, // 20px = 0.5 unit
                }}
              >
                {column.title}
              </h3>
              <ul style={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: `${getPresetSpacing(0.25)}px`, // 10px = 0.25 unit
              }}>
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
              <h3 
                className="font-semibold" 
                style={{ 
                  color: footer.textColor || "#ffffff",
                  marginBottom: `${getPresetSpacing(0.5)}px`, // 20px = 0.5 unit
                }}
              >
                Contact
              </h3>
              <div 
                className="flex flex-col" 
                style={{ 
                  color: footer.textColor || "#ffffff",
                  gap: `${getPresetSpacing(0.5)}px`, // 20px = 0.5 unit
                }}
              >
                {footer.emailAddress && (
                  <div 
                    className="flex items-start" 
                    style={{ gap: `${getPresetSpacing(0.375)}px` }} // 15px = 0.375 unit
                  >
                    <FaEnvelope className="w-5 h-5 flex-shrink-0" style={{ marginTop: '2px' }} />
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
                  <div 
                    className="flex items-start" 
                    style={{ gap: `${getPresetSpacing(0.375)}px` }} // 15px = 0.375 unit
                  >
                    <FaPhone className="w-5 h-5 flex-shrink-0" style={{ marginTop: '2px' }} />
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
          className={`${(footer.emailAddress || footer.phoneNumber) ? '' : 'border-t border-gray-600'} flex flex-col md:flex-row justify-between items-center`}
          style={{
            marginTop: `${getPresetSpacing((footer as any)?.bottomMargin ?? 0.75)}px`, // 30px = 0.75 units
            paddingTop: (footer.emailAddress || footer.phoneNumber) ? 0 : `${getPresetSpacing(0.75)}px`, // 30px = 0.75 units
            gap: `${getPresetSpacing(0.5)}px`, // 20px = 0.5 unit (for mobile vertical spacing)
          }}
        >
          {footer.copyrightText && (
            <p className="text-sm" style={{ color: footer.textColor || "#ffffff" }}>
              {footer.copyrightText}
            </p>
          )}
          {socialLinks && socialLinks.length > 0 && (
            <div 
              className="flex items-center" 
              style={{ gap: `${getPresetSpacing(0.5)}px` }} // 20px = 0.5 unit
            >
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

