"use client";

import { useState } from "react";
import Image from "next/image";

interface NavigationLink {
  label: string;
  url: string;
}

interface SocialLink {
  platform: "facebook" | "twitter" | "instagram" | "linkedin" | "youtube" | "custom";
  url: string;
  label?: string;
}

interface HeaderData {
  showLogo: boolean;
  logo?: string;
  navigationLinks?: NavigationLink[];
  phoneNumber?: string;
  socialLinks?: SocialLink[];
  showGetQuoteButton: boolean;
  getQuoteButtonText?: string;
  getQuoteButtonLink?: string;
  backgroundColor?: string;
  textColor?: string;
}

interface HeaderEditorProps {
  header: HeaderData;
  onChange: (header: HeaderData) => void;
  themeLogo?: string; // Logo from theme settings
}

export default function HeaderEditor({
  header,
  onChange,
  themeLogo,
}: HeaderEditorProps) {
  const [newLinkLabel, setNewLinkLabel] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");

  const updateHeader = (updates: Partial<HeaderData>) => {
    onChange({ ...header, ...updates });
  };

  const addNavigationLink = () => {
    if (newLinkLabel.trim() && newLinkUrl.trim()) {
      updateHeader({
        navigationLinks: [...(header.navigationLinks || []), { label: newLinkLabel, url: newLinkUrl }],
      });
      setNewLinkLabel("");
      setNewLinkUrl("");
    }
  };

  const removeNavigationLink = (index: number) => {
    const links = [...(header.navigationLinks || [])];
    links.splice(index, 1);
    updateHeader({ navigationLinks: links });
  };


  return (
    <div className="space-y-6">
      {/* Logo Settings */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={header.showLogo}
              onChange={(e) => updateHeader({ showLogo: e.target.checked })}
              className="rounded"
            />
            <span className="font-medium">Show Logo</span>
          </label>
        </div>
        {header.showLogo && (
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> The logo from Theme settings will be used by default. You can override it with a custom URL below.
              </p>
            </div>
            {themeLogo && !header.logo && (
              <div className="flex items-center space-x-4 bg-gray-50 p-3 rounded">
                <span className="text-sm text-gray-600">Using theme logo:</span>
                {themeLogo.startsWith("data:") ? (
                  <img src={themeLogo} alt="Theme logo" className="h-12 w-auto object-contain" />
                ) : (
                  <Image src={themeLogo} alt="Theme logo" width={48} height={48} className="h-12 w-auto object-contain" unoptimized />
                )}
              </div>
            )}
            {header.logo && (
              <div className="flex items-center space-x-4">
                {header.logo.startsWith("data:") ? (
                  <img src={header.logo} alt="Custom logo preview" className="h-16 w-auto object-contain border border-gray-200 rounded" />
                ) : (
                  <Image src={header.logo} alt="Custom logo preview" width={64} height={64} className="h-16 w-auto object-contain border border-gray-200 rounded" unoptimized />
                )}
                <button
                  onClick={() => updateHeader({ logo: undefined })}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove Custom Logo (use theme logo)
                </button>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Logo URL (optional - leave empty to use theme logo)
              </label>
              <input
                type="text"
                value={header.logo || ""}
                onChange={(e) => updateHeader({ logo: e.target.value || undefined })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="https://example.com/logo.png or leave empty for theme logo"
              />
            </div>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium mb-4">Navigation Links</h3>
        <div className="space-y-3">
          {header.navigationLinks?.map((link, index) => (
            <div key={index} className="flex items-center space-x-2 bg-gray-50 p-3 rounded">
              <span className="flex-1 font-medium">{link.label}</span>
              <span className="text-sm text-gray-500">{link.url}</span>
              <button
                onClick={() => removeNavigationLink(index)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
          <div className="flex space-x-2">
            <input
              type="text"
              value={newLinkLabel}
              onChange={(e) => setNewLinkLabel(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Link Label"
              onKeyPress={(e) => e.key === "Enter" && addNavigationLink()}
            />
            <input
              type="text"
              value={newLinkUrl}
              onChange={(e) => setNewLinkUrl(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
              placeholder="/about or https://example.com"
              onKeyPress={(e) => e.key === "Enter" && addNavigationLink()}
            />
            <button
              onClick={addNavigationLink}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Phone Number */}
      <div className="border border-gray-200 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
        <input
          type="tel"
          value={header.phoneNumber || ""}
          onChange={(e) => updateHeader({ phoneNumber: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          placeholder="(555) 123-4567"
        />
      </div>

      {/* Social Links Info */}
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <h3 className="font-medium mb-2">Social Media Links</h3>
        <p className="text-sm text-gray-600">
          Social media links are managed in the <strong>General</strong> tab. They will be shared between the header and footer.
        </p>
      </div>

      {/* Get Quote Button */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={header.showGetQuoteButton}
              onChange={(e) => updateHeader({ showGetQuoteButton: e.target.checked })}
              className="rounded"
            />
            <span className="font-medium">Show Get Quote Button</span>
          </label>
        </div>
        {header.showGetQuoteButton && (
          <div className="space-y-3">
            <input
              type="text"
              value={header.getQuoteButtonText || ""}
              onChange={(e) => updateHeader({ getQuoteButtonText: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Get Free Quote"
            />
            <input
              type="text"
              value={header.getQuoteButtonLink || ""}
              onChange={(e) => updateHeader({ getQuoteButtonLink: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="#contact or /contact"
            />
          </div>
        )}
      </div>

      {/* Colors */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium mb-4">Colors</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={header.backgroundColor || "#ffffff"}
                onChange={(e) => updateHeader({ backgroundColor: e.target.value })}
                className="h-10 w-20 border border-gray-300 rounded"
              />
              <input
                type="text"
                value={header.backgroundColor || "#ffffff"}
                onChange={(e) => updateHeader({ backgroundColor: e.target.value })}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={header.textColor || "#000000"}
                onChange={(e) => updateHeader({ textColor: e.target.value })}
                className="h-10 w-20 border border-gray-300 rounded"
              />
              <input
                type="text"
                value={header.textColor || "#000000"}
                onChange={(e) => updateHeader({ textColor: e.target.value })}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

