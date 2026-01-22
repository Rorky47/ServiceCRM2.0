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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo Column */}
          {footer.showLogo && logo && (
            <div className="col-span-1">
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
                unoptimized
              />
            </div>
          )}

          {/* Footer Columns */}
          {footer.columns?.map((column, columnIndex) => (
            <div key={columnIndex}>
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

        {/* Contact Information */}
        {(footer.emailAddress || footer.phoneNumber) && (
          <div className="mt-8 pt-8 border-t border-gray-600">
            <div className="flex flex-col sm:flex-row gap-4 text-sm" style={{ color: footer.textColor || "#ffffff" }}>
              {footer.emailAddress && (
                <div className="flex items-center space-x-2">
                  <FaEnvelope className="w-4 h-4" />
                  <a
                    href={`mailto:${footer.emailAddress}`}
                    className="hover:opacity-80 transition-opacity"
                    style={{ color: footer.textColor || "#ffffff" }}
                  >
                    {footer.emailAddress}
                  </a>
                </div>
              )}
              {footer.phoneNumber && (
                <div className="flex items-center space-x-2">
                  <FaPhone className="w-4 h-4" />
                  <a
                    href={`tel:${footer.phoneNumber.replace(/\s/g, '')}`}
                    className="hover:opacity-80 transition-opacity"
                    style={{ color: footer.textColor || "#ffffff" }}
                  >
                    {footer.phoneNumber}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Social Links and Copyright */}
        <div className={`mt-8 ${(footer.emailAddress || footer.phoneNumber) ? '' : 'pt-8 border-t border-gray-600'} flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0`}>
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
                  href={social.platform === "email" ? `mailto:${social.url}` : social.url}
                  target={social.platform === "email" ? undefined : "_blank"}
                  rel={social.platform === "email" ? undefined : "noopener noreferrer"}
                  className="hover:opacity-80 transition-opacity"
                  title={social.label || social.platform}
                  style={{ color: footer.textColor || "#ffffff" }}
                >
                  <SocialIcon platform={social.platform} size="lg" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}

