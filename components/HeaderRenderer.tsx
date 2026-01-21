"use client";

import { Site } from "@/types";
import Image from "next/image";
import Link from "next/link";

interface HeaderRendererProps {
  site: Site;
}

export default function HeaderRenderer({ site }: HeaderRendererProps) {
  if (!site.header) return null;

  const header = site.header;
  const socialPlatformIcons: Record<string, string> = {
    facebook: "📘",
    twitter: "🐦",
    instagram: "📷",
    linkedin: "💼",
    youtube: "📺",
    custom: "🔗",
  };

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
          {header.showLogo && header.logo && (
            <div className="flex-shrink-0">
              <Link href="/">
                {header.logo.startsWith("data:") ? (
                  <img src={header.logo} alt={site.name} className="h-10 w-auto" />
                ) : (
                  <Image src={header.logo} alt={site.name} width={120} height={40} className="h-10 w-auto" unoptimized />
                )}
              </Link>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-6 flex-1 justify-center">
            {header.navigationLinks?.map((link, index) => (
              <Link
                key={index}
                href={link.url}
                className="hover:opacity-80 transition-opacity"
                style={{ color: header.textColor || "#000000" }}
              >
                {link.label}
              </Link>
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
            {header.socialLinks && header.socialLinks.length > 0 && (
              <div className="hidden md:flex items-center space-x-2">
                {header.socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xl hover:opacity-80 transition-opacity"
                    title={social.label || social.platform}
                  >
                    {socialPlatformIcons[social.platform] || "🔗"}
                  </a>
                ))}
              </div>
            )}

            {/* Get Quote Button */}
            {header.showGetQuoteButton && header.getQuoteButtonLink && (
              <Link
                href={header.getQuoteButtonLink}
                className="px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
                style={{
                  backgroundColor: site.theme.primaryColor || "#0066cc",
                  color: "#ffffff",
                }}
              >
                {header.getQuoteButtonText || "Get Quote"}
              </Link>
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
              <Link
                key={index}
                href={link.url}
                className="hover:opacity-80 transition-opacity py-2"
                style={{ color: header.textColor || "#000000" }}
              >
                {link.label}
              </Link>
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
            {header.socialLinks && header.socialLinks.length > 0 && (
              <div className="flex items-center space-x-3 pt-2">
                {header.socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xl hover:opacity-80 transition-opacity"
                    title={social.label || social.platform}
                  >
                    {socialPlatformIcons[social.platform] || "🔗"}
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

