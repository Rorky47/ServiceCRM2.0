"use client";

import { useState } from "react";
import Image from "next/image";

interface FooterLink {
  label: string;
  url: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface SocialLink {
  platform: "facebook" | "twitter" | "instagram" | "linkedin" | "youtube" | "custom";
  url: string;
  label?: string;
}

interface FooterData {
  showLogo: boolean;
  logo?: string;
  copyrightText?: string;
  columns?: FooterColumn[];
  socialLinks?: SocialLink[];
  backgroundColor?: string;
  textColor?: string;
}

interface FooterEditorProps {
  footer: FooterData;
  onChange: (footer: FooterData) => void;
  onImageUpload: (file: File, type: "logo") => Promise<string>;
  uploadingLogo: boolean;
}

export default function FooterEditor({
  footer,
  onChange,
  onImageUpload,
  uploadingLogo,
}: FooterEditorProps) {
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [newLinkLabel, setNewLinkLabel] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [selectedColumnIndex, setSelectedColumnIndex] = useState<number | null>(null);
  const [newSocialPlatform, setNewSocialPlatform] = useState<SocialLink["platform"]>("facebook");
  const [newSocialUrl, setNewSocialUrl] = useState("");
  const [newSocialLabel, setNewSocialLabel] = useState("");

  const updateFooter = (updates: Partial<FooterData>) => {
    onChange({ ...footer, ...updates });
  };

  const addColumn = () => {
    if (newColumnTitle.trim()) {
      updateFooter({
        columns: [...(footer.columns || []), { title: newColumnTitle, links: [] }],
      });
      setNewColumnTitle("");
    }
  };

  const removeColumn = (index: number) => {
    const columns = [...(footer.columns || [])];
    columns.splice(index, 1);
    updateFooter({ columns });
  };

  const addLinkToColumn = (columnIndex: number) => {
    if (newLinkLabel.trim() && newLinkUrl.trim()) {
      const columns = [...(footer.columns || [])];
      columns[columnIndex].links.push({ label: newLinkLabel, url: newLinkUrl });
      updateFooter({ columns });
      setNewLinkLabel("");
      setNewLinkUrl("");
      setSelectedColumnIndex(null);
    }
  };

  const removeLinkFromColumn = (columnIndex: number, linkIndex: number) => {
    const columns = [...(footer.columns || [])];
    columns[columnIndex].links.splice(linkIndex, 1);
    updateFooter({ columns });
  };

  const addSocialLink = () => {
    if (newSocialUrl.trim()) {
      updateFooter({
        socialLinks: [
          ...(footer.socialLinks || []),
          { platform: newSocialPlatform, url: newSocialUrl, label: newSocialLabel || undefined },
        ],
      });
      setNewSocialUrl("");
      setNewSocialLabel("");
    }
  };

  const removeSocialLink = (index: number) => {
    const links = [...(footer.socialLinks || [])];
    links.splice(index, 1);
    updateFooter({ socialLinks: links });
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
              checked={footer.showLogo}
              onChange={(e) => updateFooter({ showLogo: e.target.checked })}
              className="rounded"
            />
            <span className="font-medium">Show Logo</span>
          </label>
        </div>
        {footer.showLogo && (
          <div className="space-y-3">
            {footer.logo && (
              <div className="flex items-center space-x-4">
                {footer.logo.startsWith("data:") ? (
                  <img src={footer.logo} alt="Logo preview" className="h-16 w-auto object-contain border border-gray-200 rounded" />
                ) : (
                  <Image src={footer.logo} alt="Logo preview" width={64} height={64} className="h-16 w-auto object-contain border border-gray-200 rounded" unoptimized />
                )}
                <button
                  onClick={() => updateFooter({ logo: undefined })}
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
                      updateFooter({ logo: url });
                    }
                  }}
                  className="hidden"
                  disabled={uploadingLogo}
                />
              </label>
              <span className="text-sm text-gray-500">or</span>
              <input
                type="text"
                value={footer.logo || ""}
                onChange={(e) => updateFooter({ logo: e.target.value })}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                placeholder="https://example.com/logo.png"
              />
            </div>
          </div>
        )}
      </div>

      {/* Copyright Text */}
      <div className="border border-gray-200 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Copyright Text</label>
        <input
          type="text"
          value={footer.copyrightText || ""}
          onChange={(e) => updateFooter({ copyrightText: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          placeholder="© 2024 Your Company. All rights reserved."
        />
      </div>

      {/* Footer Columns */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium mb-4">Footer Columns</h3>
        <div className="space-y-4">
          {footer.columns?.map((column, columnIndex) => (
            <div key={columnIndex} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">{column.title}</h4>
                <button
                  onClick={() => removeColumn(columnIndex)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove Column
                </button>
              </div>
              <div className="space-y-2 mb-3">
                {column.links.map((link, linkIndex) => (
                  <div key={linkIndex} className="flex items-center justify-between bg-white p-2 rounded">
                    <span className="text-sm">{link.label}</span>
                    <span className="text-xs text-gray-500">{link.url}</span>
                    <button
                      onClick={() => removeLinkFromColumn(columnIndex, linkIndex)}
                      className="text-red-600 hover:text-red-800 text-xs ml-2"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              {selectedColumnIndex === columnIndex && (
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={newLinkLabel}
                    onChange={(e) => setNewLinkLabel(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="Link Label"
                    onKeyPress={(e) => e.key === "Enter" && addLinkToColumn(columnIndex)}
                  />
                  <input
                    type="text"
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="/about"
                    onKeyPress={(e) => e.key === "Enter" && addLinkToColumn(columnIndex)}
                  />
                  <button
                    onClick={() => addLinkToColumn(columnIndex)}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Add
                  </button>
                </div>
              )}
              <button
                onClick={() => {
                  setSelectedColumnIndex(columnIndex);
                  setNewLinkLabel("");
                  setNewLinkUrl("");
                }}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                + Add Link
              </button>
            </div>
          ))}
          <div className="flex space-x-2">
            <input
              type="text"
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Column Title (e.g., 'Quick Links')"
              onKeyPress={(e) => e.key === "Enter" && addColumn()}
            />
            <button
              onClick={addColumn}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Column
            </button>
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium mb-4">Social Media Links</h3>
        <div className="space-y-3">
          {footer.socialLinks?.map((link, index) => (
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

      {/* Colors */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium mb-4">Colors</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={footer.backgroundColor || "#1f2937"}
                onChange={(e) => updateFooter({ backgroundColor: e.target.value })}
                className="h-10 w-20 border border-gray-300 rounded"
              />
              <input
                type="text"
                value={footer.backgroundColor || "#1f2937"}
                onChange={(e) => updateFooter({ backgroundColor: e.target.value })}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={footer.textColor || "#ffffff"}
                onChange={(e) => updateFooter({ textColor: e.target.value })}
                className="h-10 w-20 border border-gray-300 rounded"
              />
              <input
                type="text"
                value={footer.textColor || "#ffffff"}
                onChange={(e) => updateFooter({ textColor: e.target.value })}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

