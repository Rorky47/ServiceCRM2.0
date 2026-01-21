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
  onImageUpload: (file: File, type: "logo") => Promise<string>;
  uploadingLogo: boolean;
}

export default function HeaderEditor({
  header,
  onChange,
  onImageUpload,
  uploadingLogo,
}: HeaderEditorProps) {
  const [newLinkLabel, setNewLinkLabel] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newSocialPlatform, setNewSocialPlatform] = useState<SocialLink["platform"]>("facebook");
  const [newSocialUrl, setNewSocialUrl] = useState("");
  const [newSocialLabel, setNewSocialLabel] = useState("");

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

  const addSocialLink = () => {
    if (newSocialUrl.trim()) {
      updateHeader({
        socialLinks: [
          ...(header.socialLinks || []),
          { platform: newSocialPlatform, url: newSocialUrl, label: newSocialLabel || undefined },
        ],
      });
      setNewSocialUrl("");
      setNewSocialLabel("");
    }
  };

  const removeSocialLink = (index: number) => {
    const links = [...(header.socialLinks || [])];
    links.splice(index, 1);
    updateHeader({ socialLinks: links });
  };

  const socialPlatformIcons: Record<SocialLink["platform"], string> = {
    facebook: "📘",
    twitter: "🐦",
    instagram: "📷",
    linkedin: "💼",
    youtube: "📺",
    custom: "🔗",
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
            {header.logo && (
              <div className="flex items-center space-x-4">
                {header.logo.startsWith("data:") ? (
                  <img src={header.logo} alt="Logo preview" className="h-16 w-auto object-contain border border-gray-200 rounded" />
                ) : (
                  <Image src={header.logo} alt="Logo preview" width={64} height={64} className="h-16 w-auto object-contain border border-gray-200 rounded" unoptimized />
                )}
                <button
                  onClick={() => updateHeader({ logo: undefined })}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>
            )}
            <div className="flex items-center space-x-3">
              <label className="cursor-pointer">
                <span className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-block">
                  {uploadingLogo ? "Uploading..." : "Upload Logo"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = await onImageUpload(file, "logo");
                      updateHeader({ logo: url });
                    }
                  }}
                  className="hidden"
                  disabled={uploadingLogo}
                />
              </label>
              <span className="text-sm text-gray-500">or</span>
              <input
                type="text"
                value={header.logo || ""}
                onChange={(e) => updateHeader({ logo: e.target.value })}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                placeholder="https://example.com/logo.png"
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

      {/* Social Links */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium mb-4">Social Media Links</h3>
        <div className="space-y-3">
          {header.socialLinks?.map((link, index) => (
            <div key={index} className="flex items-center space-x-2 bg-gray-50 p-3 rounded">
              <span className="text-xl">{socialPlatformIcons[link.platform]}</span>
              <span className="flex-1 font-medium capitalize">{link.platform}</span>
              {link.label && <span className="text-sm text-gray-500">({link.label})</span>}
              <span className="text-sm text-gray-500 truncate max-w-xs">{link.url}</span>
              <button
                onClick={() => removeSocialLink(index)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
          <div className="space-y-2">
            <div className="flex space-x-2">
              <select
                value={newSocialPlatform}
                onChange={(e) => setNewSocialPlatform(e.target.value as SocialLink["platform"])}
                className="border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="facebook">Facebook</option>
                <option value="twitter">Twitter</option>
                <option value="instagram">Instagram</option>
                <option value="linkedin">LinkedIn</option>
                <option value="youtube">YouTube</option>
                <option value="custom">Custom</option>
              </select>
              <input
                type="text"
                value={newSocialUrl}
                onChange={(e) => setNewSocialUrl(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                placeholder="https://facebook.com/yourpage"
                onKeyPress={(e) => e.key === "Enter" && addSocialLink()}
              />
              <button
                onClick={addSocialLink}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            {newSocialPlatform === "custom" && (
              <input
                type="text"
                value={newSocialLabel}
                onChange={(e) => setNewSocialLabel(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Custom label (optional)"
              />
            )}
          </div>
        </div>
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

