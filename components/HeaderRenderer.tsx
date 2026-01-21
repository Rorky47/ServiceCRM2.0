"use client";

import { useState } from "react";
import { Site } from "@/types";
import Link from "next/link";
import { normalizeInternalLink } from "@/lib/link-utils";
import SocialIcon from "@/components/SocialIcon";
import OptimizedImage from "@/components/OptimizedImage";
import SmartLink from "@/components/SmartLink";
import { useSearchParams } from "next/navigation";

interface HeaderRendererProps {
  site: Site;
}

export default function HeaderRenderer({ site }: HeaderRendererProps) {
  if (!site.header) return null;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchParams = useSearchParams();
  const isAdmin = searchParams.get("admin") === "true";

  const header = site.header;
  // Use header logo if set, otherwise use theme logo
  const logo = header.logo || site.theme?.logo;
  // Use header social links if set, otherwise use site social links
  const socialLinks = header.socialLinks || site.socialLinks;
  

  return (
    <header
      className={`sticky z-[60] shadow-md ${isAdmin ? "top-[40px]" : "top-0"}`}
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
                  className="h-8 sm:h-10 w-auto"
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
                className="hover:opacity-80 transition-opacity text-sm lg:text-base"
                style={{ color: header.textColor || "#000000" }}
                prefetch={false}
              >
                {link.label}
              </SmartLink>
            ))}
          </nav>

          {/* Right Side: Phone, Social, CTA */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Phone Number */}
            {header.phoneNumber && (
              <a
                href={`tel:${header.phoneNumber.replace(/\D/g, "")}`}
                className="hidden sm:block hover:opacity-80 transition-opacity text-sm lg:text-base"
                style={{ color: header.textColor || "#000000" }}
              >
                {header.phoneNumber}
              </a>
            )}

            {/* Social Links */}
            {socialLinks && socialLinks.length > 0 && (
              <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
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
                className="hidden sm:inline-block px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium hover:opacity-90 transition-opacity text-xs sm:text-sm"
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
            {(header.navigationLinks && header.navigationLinks.length > 0) && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 -mr-2 rounded-md hover:bg-black/10 active:bg-black/20 transition-colors touch-manipulation"
                style={{ color: header.textColor || "#000000" }}
                aria-label="Menu"
                aria-expanded={mobileMenuOpen}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {mobileMenuOpen ? (
                    <path d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div 
            className="md:hidden pb-4 mt-2 pt-4 animate-slide-down"
            style={{ 
              borderTop: `1px solid ${header.textColor ? `${header.textColor}30` : 'rgba(0,0,0,0.1)'}` 
            }}
          >
            <nav className="flex flex-col space-y-2">
              {header.navigationLinks?.map((link, index) => (
                <SmartLink
                  key={index}
                  href={link.url}
                  siteSlug={site.slug}
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:opacity-80 transition-opacity py-2.5 px-2 rounded-md hover:bg-black/5 active:bg-black/10 text-base font-medium touch-manipulation"
                  style={{ color: header.textColor || "#000000" }}
                  prefetch={false}
                >
                  {link.label}
                </SmartLink>
              ))}
              {header.phoneNumber && (
                <a
                  href={`tel:${header.phoneNumber.replace(/\D/g, "")}`}
                  className="hover:opacity-80 transition-opacity py-2.5 px-2 rounded-md hover:bg-black/5 active:bg-black/10 text-base font-medium touch-manipulation"
                  style={{ color: header.textColor || "#000000" }}
                >
                  📞 {header.phoneNumber}
                </a>
              )}
              {header.showGetQuoteButton && header.getQuoteButtonLink && (
                <SmartLink
                  href={header.getQuoteButtonLink}
                  siteSlug={site.slug}
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-block px-4 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity text-sm text-center mt-2 touch-manipulation"
                  style={{
                    backgroundColor: site.theme.primaryColor || "#0066cc",
                    color: "#ffffff",
                  }}
                  prefetch={false}
                >
                  {header.getQuoteButtonText || "Get Quote"}
                </SmartLink>
              )}
              {socialLinks && socialLinks.length > 0 && (
                <div className="flex items-center space-x-4 pt-2 border-t border-opacity-10 mt-2" style={{ borderColor: header.textColor ? `${header.textColor}30` : 'rgba(0,0,0,0.1)' }}>
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:opacity-80 transition-opacity p-2 rounded-md hover:bg-black/5 touch-manipulation"
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
        )}
      </div>
    </header>
  );
}

