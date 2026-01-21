"use client";

import { useState } from "react";
import OptimizedImage from "@/components/OptimizedImage";
import LinkInput from "@/components/LinkInput";

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
  logoSize?: "small" | "medium" | "large" | "xlarge";
  copyrightText?: string;
  columns?: FooterColumn[];
  socialLinks?: SocialLink[];
  backgroundColor?: string;
  textColor?: string;
}

interface FooterEditorProps {
  footer: FooterData;
  onChange: (footer: FooterData) => void;
  themeLogo?: string; // Logo from theme settings
  siteSlug: string; // Site slug for fetching pages
}

export default function FooterEditor({
  footer,
  onChange,
  themeLogo,
  siteSlug,
}: FooterEditorProps) {
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [newLinkLabel, setNewLinkLabel] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [selectedColumnIndex, setSelectedColumnIndex] = useState<number | null>(null);

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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> The logo from Theme settings will be used by default. You can override it with a custom URL below.
              </p>
            </div>
            {themeLogo && !footer.logo && (
              <div className="flex items-center space-x-4 bg-gray-50 p-3 rounded">
                <span className="text-sm text-gray-600">Using theme logo:</span>
                <OptimizedImage
                  src={themeLogo}
                  alt="Theme logo"
                  width={48}
                  height={48}
                  className="h-12 w-auto object-contain"
                  unoptimized
                />
              </div>
            )}
            {footer.logo && (
              <div className="flex items-center space-x-4">
                <OptimizedImage
                  src={footer.logo}
                  alt="Custom logo preview"
                  width={64}
                  height={64}
                  className="h-16 w-auto object-contain border border-gray-200 rounded"
                  unoptimized
                />
                <button
                  onClick={() => updateFooter({ logo: undefined })}
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
                value={footer.logo || ""}
                onChange={(e) => updateFooter({ logo: e.target.value || undefined })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="https://example.com/logo.png or leave empty for theme logo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo Size
              </label>
              <select
                value={footer.logoSize || "medium"}
                onChange={(e) => updateFooter({ logoSize: e.target.value as "small" | "medium" | "large" | "xlarge" })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="small">Small (32-40px)</option>
                <option value="medium">Medium (48-56px) - Default</option>
                <option value="large">Large (64-80px)</option>
                <option value="xlarge">Extra Large (80-96px)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Logo height on mobile / desktop
              </p>
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
                <div className="space-y-2 mb-2">
                  <input
                    type="text"
                    value={newLinkLabel}
                    onChange={(e) => setNewLinkLabel(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="Link Label"
                    onKeyPress={(e) => e.key === "Enter" && addLinkToColumn(columnIndex)}
                  />
                  <LinkInput
                    value={newLinkUrl}
                    onChange={setNewLinkUrl}
                    siteSlug={siteSlug}
                    placeholder="/about or https://example.com"
                    className="text-sm"
                  />
                  <button
                    onClick={() => addLinkToColumn(columnIndex)}
                    className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Add Link
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

      {/* Social Links Info */}
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <h3 className="font-medium mb-2">Social Media Links</h3>
        <p className="text-sm text-gray-600">
          Social media links are managed in the <strong>General</strong> tab. They will be shared between the header and footer.
        </p>
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

