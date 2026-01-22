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

  return (
    <footer
      className="mt-auto"
      style={{
        backgroundColor: footer.backgroundColor || "#1f2937",
        color: footer.textColor || "#ffffff",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 xl:gap-8 items-start">
          {/* Left Side: Logo and Footer Columns */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 xl:gap-8 min-w-0">
            {/* Logo Column */}
            {footer.showLogo && logo && (
              <div className="min-w-0">
              <OptimizedImage
                src={logo}
                alt={site.name}
                width={120}
                height={48}
                className={`w-auto mb-4 ${
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
                style={footer.logoScale ? { transform: `scale(${footer.logoScale / 100})`, transformOrigin: 'top left' } : undefined}
                unoptimized
              />
              </div>
            )}

            {/* Footer Columns */}
            {footer.columns?.map((column, columnIndex) => (
              <div key={columnIndex} className="min-w-0">
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
          </div>

          {/* Right Side: Contact Information */}
          {(footer.emailAddress || footer.phoneNumber) && (
            <div className="lg:flex-shrink-0 lg:min-w-[200px] xl:min-w-[256px] w-full lg:w-auto">
              <h3 className="font-semibold mb-4" style={{ color: footer.textColor || "#ffffff" }}>
                Contact
              </h3>
              <div className="flex flex-col gap-4" style={{ color: footer.textColor || "#ffffff" }}>
                {footer.emailAddress && (
                  <div className="flex items-center space-x-3">
                    <FaEnvelope className="w-5 h-5 flex-shrink-0" />
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
                  <div className="flex items-center space-x-3">
                    <FaPhone className="w-5 h-5 flex-shrink-0" />
                    <a
                      href={`tel:${footer.phoneNumber.replace(/\s/g, '')}`}
                      className="hover:opacity-80 transition-opacity text-base font-medium"
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
        <div className={`mt-8 ${(footer.emailAddress || footer.phoneNumber) ? '' : 'pt-8 border-t border-gray-600'} flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0`}>
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

