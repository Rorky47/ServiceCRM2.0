"use client";

import { Site } from "@/types";
import Link from "next/link";
import { normalizeInternalLink } from "@/lib/link-utils";
import SocialIcon from "@/components/SocialIcon";
import OptimizedImage from "@/components/OptimizedImage";
import SmartLink from "@/components/SmartLink";

interface HeaderRendererProps {
  site: Site;
}

export default function HeaderRenderer({ site }: HeaderRendererProps) {
  if (!site.header) return null;

  const header = site.header;
  // Use header logo if set, otherwise use theme logo
  const logo = header.logo || site.theme?.logo;
  // Use header social links if set, otherwise use site social links
  const socialLinks = header.socialLinks || site.socialLinks;
  

  return (
    <header
      className="sticky top-0 z-50 shadow-md"
      style={{
        backgroundColor: header.backgroundColor || "#ffffff",
        color: header.textColor || "#000000",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          {header.showLogo && logo && (
            <div className="flex-shrink-0">
              <Link href="/">
                <OptimizedImage
                  src={logo}
                  alt={site.name}
                  width={120}
                  height={40}
                  className="h-10 w-auto"
                  unoptimized
                />
              </Link>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-6 flex-1 justify-center">
            {header.navigationLinks?.map((link, index) => (
              <SmartLink
                key={index}
                href={link.url}
                siteSlug={site.slug}
                className="hover:opacity-80 transition-opacity"
                style={{ color: header.textColor || "#000000" }}
                prefetch={false}
              >
                {link.label}
              </SmartLink>
            ))}
          </nav>

          {/* Right Side: Phone, Social, CTA */}
          <div className="flex items-center space-x-4">
            {/* Phone Number */}
            {header.phoneNumber && (
              <a
                href={`tel:${header.phoneNumber.replace(/\D/g, "")}`}
                className="hidden sm:block hover:opacity-80 transition-opacity"
                style={{ color: header.textColor || "#000000" }}
              >
                {header.phoneNumber}
              </a>
            )}

            {/* Social Links */}
            {socialLinks && socialLinks.length > 0 && (
              <div className="hidden md:flex items-center space-x-3">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-80 transition-opacity"
                    title={social.label || social.platform}
                    style={{ color: header.textColor || "#000000" }}
                  >
                    <SocialIcon platform={social.platform} size="md" />
                  </a>
                ))}
              </div>
            )}

            {/* Get Quote Button */}
            {header.showGetQuoteButton && header.getQuoteButtonLink && (
              <SmartLink
                href={header.getQuoteButtonLink}
                siteSlug={site.slug}
                className="px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
                style={{
                  backgroundColor: site.theme.primaryColor || "#0066cc",
                  color: "#ffffff",
                }}
                prefetch={false}
              >
                {header.getQuoteButtonText || "Get Quote"}
              </SmartLink>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              style={{ color: header.textColor || "#000000" }}
              aria-label="Menu"
            >
              ☰
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <nav className="flex flex-col space-y-2">
            {header.navigationLinks?.map((link, index) => (
              <SmartLink
                key={index}
                href={link.url}
                siteSlug={site.slug}
                className="hover:opacity-80 transition-opacity py-2"
                style={{ color: header.textColor || "#000000" }}
                prefetch={false}
              >
                {link.label}
              </SmartLink>
            ))}
            {header.phoneNumber && (
              <a
                href={`tel:${header.phoneNumber.replace(/\D/g, "")}`}
                className="hover:opacity-80 transition-opacity py-2"
                style={{ color: header.textColor || "#000000" }}
              >
                {header.phoneNumber}
              </a>
            )}
            {socialLinks && socialLinks.length > 0 && (
              <div className="flex items-center space-x-3 pt-2">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-80 transition-opacity"
                    title={social.label || social.platform}
                    style={{ color: header.textColor || "#000000" }}
                  >
                    <SocialIcon platform={social.platform} size="md" />
                  </a>
                ))}
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

