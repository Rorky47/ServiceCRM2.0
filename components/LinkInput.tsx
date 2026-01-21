"use client";

import { useState, useEffect } from "react";
import { Page } from "@/types";

interface LinkInputProps {
  value: string;
  onChange: (url: string) => void;
  siteSlug: string;
  placeholder?: string;
  className?: string;
}

export default function LinkInput({
  value,
  onChange,
  siteSlug,
  placeholder = "Select a page or enter a URL",
  className = "",
}: LinkInputProps) {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [linkType, setLinkType] = useState<"page" | "custom">("custom");
  const [customUrl, setCustomUrl] = useState("");

  useEffect(() => {
    fetchPages();
  }, [siteSlug]);

  useEffect(() => {
    // Determine link type from current value
    if (value && pages.length > 0) {
      // Check if it's an internal page link
      let pageSlug = "";
      
      if (value.startsWith(`/site/${siteSlug}/`)) {
        // Full site path: /site/plumber/about
        pageSlug = value.replace(`/site/${siteSlug}/`, "");
      } else if (value.startsWith("/") && !value.startsWith("//") && !value.startsWith("http")) {
        // Relative path: /about
        pageSlug = value.replace(/^\//, "");
      } else if (!value.startsWith("http") && !value.startsWith("#") && !value.startsWith("mailto:") && !value.startsWith("tel:")) {
        // Just a slug: about
        pageSlug = value;
      }
      
      // Check if this page slug exists in our pages list
      if (pageSlug) {
        const page = pages.find(p => p.slug === pageSlug);
        if (page) {
          setLinkType("page");
          setCustomUrl("");
          return;
        }
      }
      
      // Not an internal page, treat as custom
      setLinkType("custom");
      setCustomUrl(value);
    } else if (value) {
      setLinkType("custom");
      setCustomUrl(value);
    } else {
      setCustomUrl("");
    }
  }, [value, siteSlug, pages]);

  const fetchPages = async () => {
    try {
      const response = await fetch(`/api/pages?siteSlug=${siteSlug}`);
      if (response.ok) {
        const data = await response.json();
        setPages(data);
      }
    } catch (error) {
      console.error("Error fetching pages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkTypeChange = (type: "page" | "custom") => {
    setLinkType(type);
    if (type === "page") {
      // Select first page by default
      if (pages.length > 0) {
        onChange(`/${pages[0].slug}`);
      }
    } else {
      onChange(customUrl || "");
    }
  };

  const handlePageSelect = (pageSlug: string) => {
    onChange(`/${pageSlug}`);
  };

  const handleCustomUrlChange = (url: string) => {
    setCustomUrl(url);
    onChange(url);
  };

  // Get current page slug from value
  const currentPageSlug = value && linkType === "page"
    ? (value.startsWith(`/site/${siteSlug}/`) 
        ? value.replace(`/site/${siteSlug}/`, "")
        : value.replace(/^\//, ""))
    : "";

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Link Type Toggle */}
      <div className="flex space-x-4">
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name={`link-type-${siteSlug}`}
            checked={linkType === "page"}
            onChange={() => handleLinkTypeChange("page")}
            className="rounded"
          />
          <span className="text-sm font-medium text-gray-700">Internal Page</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name={`link-type-${siteSlug}`}
            checked={linkType === "custom"}
            onChange={() => handleLinkTypeChange("custom")}
            className="rounded"
          />
          <span className="text-sm font-medium text-gray-700">Custom URL</span>
        </label>
      </div>

      {/* Page Selector or Custom URL Input */}
      {linkType === "page" ? (
        <select
          value={currentPageSlug}
          onChange={(e) => handlePageSelect(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={loading}
        >
          {loading ? (
            <option>Loading pages...</option>
          ) : pages.length === 0 ? (
            <option value="">No pages available</option>
          ) : (
            <>
              <option value="">Select a page...</option>
              {pages.map((page) => (
                <option key={page.slug} value={page.slug}>
                  {page.slug === "home" ? "Home" : page.slug.charAt(0).toUpperCase() + page.slug.slice(1).replace(/-/g, " ")}
                </option>
              ))}
            </>
          )}
        </select>
      ) : (
        <input
          type="text"
          value={customUrl}
          onChange={(e) => handleCustomUrlChange(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder={placeholder}
        />
      )}

      {/* Help Text */}
      {linkType === "custom" && (
        <p className="text-xs text-gray-500">
          Enter a URL (e.g., https://example.com), a path (e.g., /about), or an anchor (e.g., #section)
        </p>
      )}
    </div>
  );
}

