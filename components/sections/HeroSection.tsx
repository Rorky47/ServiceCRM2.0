"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Section } from "@/types";
import { normalizeInternalLink } from "@/lib/link-utils";

interface HeroSectionProps {
  section: Extract<Section, { type: "hero" }>;
  isAdmin: boolean;
  onUpdate: (section: Section) => void;
  siteSlug: string;
}

export default function HeroSection({ section, isAdmin, onUpdate, siteSlug }: HeroSectionProps) {
  const [editing, setEditing] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState("");
  const [showImageControls, setShowImageControls] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showCTAEditor, setShowCTAEditor] = useState(false);

  const handleClick = (field: string, currentValue: string) => {
    if (!isAdmin) return;
    setEditing(field);
    setTempValue(currentValue);
  };

  const handleSave = () => {
    if (editing === "headline") {
      onUpdate({
        ...section,
        content: { ...section.content, headline: tempValue },
      });
    } else if (editing === "subheadline") {
      onUpdate({
        ...section,
        content: { ...section.content, subheadline: tempValue },
      });
    } else if (editing === "cta-text") {
      onUpdate({
        ...section,
        content: {
          ...section.content,
          ctaButton: {
            text: tempValue,
            link: section.content.ctaButton?.link || "#",
          },
        },
      });
    } else if (editing === "cta-link") {
      onUpdate({
        ...section,
        content: {
          ...section.content,
          ctaButton: {
            text: section.content.ctaButton?.text || "Get Started",
            link: tempValue,
          },
        },
      });
    }
    setEditing(null);
  };

  const handleImageUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const formData = new FormData();
      formData.append("file", file);
      
      try {
        const response = await fetch("/api/cloudinary", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();
        if (data.url) {
          onUpdate({
            ...section,
            content: { ...section.content, image: data.url },
          });
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        alert("Failed to upload image");
      }
    };
    input.click();
  };

  const handleImageRemove = () => {
    if (confirm("Remove background image?")) {
      onUpdate({
        ...section,
        content: { ...section.content, image: "" },
      });
    }
  };

  const handleImageUrl = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      onUpdate({
        ...section,
        content: { ...section.content, image: url },
      });
    }
  };

  const handleBackgroundColorChange = (color: string) => {
    onUpdate({
      ...section,
      content: { ...section.content, backgroundColor: color },
    });
  };

  const handleCTARemove = () => {
    onUpdate({
      ...section,
      content: { ...section.content, ctaButton: undefined },
    });
  };

  const backgroundColor = section.content.backgroundColor || "#000000";
  const hasImage = !!section.content.image;

  return (
    <section
      className={`relative min-h-screen flex items-center justify-center ${
        isAdmin ? "border-2 border-dashed border-blue-500" : ""
      }`}
      style={{
        backgroundColor: !hasImage ? backgroundColor : undefined,
      }}
    >
      {/* Admin Controls */}
      {isAdmin && (
        <div className="absolute top-4 left-4 z-50 space-y-2">
          {/* Image Controls */}
          <div className="bg-white rounded-lg shadow-lg p-2">
            <button
              onClick={() => setShowImageControls(!showImageControls)}
              className="text-sm font-semibold text-gray-700 mb-1"
            >
              🖼️ Image {showImageControls ? "▼" : "▶"}
            </button>
            {showImageControls && (
              <div className="space-y-1">
                <button
                  onClick={handleImageUpload}
                  className="block w-full text-left px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  📤 Upload Image
                </button>
                <button
                  onClick={handleImageUrl}
                  className="block w-full text-left px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  🔗 Use URL
                </button>
                {hasImage && (
                  <button
                    onClick={handleImageRemove}
                    className="block w-full text-left px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    🗑️ Remove Image
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Background Color */}
          <div className="bg-white rounded-lg shadow-lg p-2">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="text-sm font-semibold text-gray-700 mb-1"
            >
              🎨 Background {showColorPicker ? "▼" : "▶"}
            </button>
            {showColorPicker && (
              <div className="space-y-2">
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => handleBackgroundColorChange(e.target.value)}
                  className="w-full h-10 cursor-pointer"
                />
                <input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => handleBackgroundColorChange(e.target.value)}
                  placeholder="#000000"
                  className="w-full px-2 py-1 text-xs border rounded"
                />
                <button
                  onClick={() => handleBackgroundColorChange("")}
                  className="block w-full px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                >
                  Clear (use overlay)
                </button>
              </div>
            )}
          </div>

          {/* CTA Button */}
          <div className="bg-white rounded-lg shadow-lg p-2">
            <button
              onClick={() => setShowCTAEditor(!showCTAEditor)}
              className="text-sm font-semibold text-gray-700 mb-1"
            >
              🔘 CTA Button {showCTAEditor ? "▼" : "▶"}
            </button>
            {showCTAEditor && (
              <div className="space-y-2">
                {section.content.ctaButton ? (
                  <>
                    {editing === "cta-text" ? (
                      <input
                        type="text"
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        onBlur={handleSave}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleSave();
                          }
                        }}
                        placeholder="Button Text"
                        className="w-full px-2 py-1 text-xs border rounded"
                        autoFocus
                      />
                    ) : (
                      <div
                        onClick={() => handleClick("cta-text", section.content.ctaButton?.text || "")}
                        className="px-2 py-1 text-xs bg-gray-100 rounded cursor-pointer hover:bg-gray-200"
                      >
                        Text: {section.content.ctaButton.text}
                      </div>
                    )}
                    {editing === "cta-link" ? (
                      <input
                        type="text"
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        onBlur={handleSave}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleSave();
                          }
                        }}
                        placeholder="Button Link (e.g., /contact or https://...)"
                        className="w-full px-2 py-1 text-xs border rounded"
                        autoFocus
                      />
                    ) : (
                      <div
                        onClick={() => handleClick("cta-link", section.content.ctaButton?.link || "")}
                        className="px-2 py-1 text-xs bg-gray-100 rounded cursor-pointer hover:bg-gray-200"
                      >
                        Link: {section.content.ctaButton.link}
                      </div>
                    )}
                    <button
                      onClick={handleCTARemove}
                      className="block w-full px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Remove CTA
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      onUpdate({
                        ...section,
                        content: {
                          ...section.content,
                          ctaButton: { text: "Get Started", link: "#contact" },
                        },
                      });
                    }}
                    className="block w-full px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    ➕ Add CTA Button
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        {hasImage && (
          section.content.image.startsWith("data:") ? (
            <img
              src={section.content.image}
              alt="Hero"
              className="w-full h-full object-cover"
            />
          ) : (
            <Image
              src={section.content.image}
              alt="Hero"
              fill
              className="object-cover"
            />
          )
        )}
        {/* Overlay - only show if there's an image and no custom background color */}
        {hasImage && !section.content.backgroundColor && (
          <div className="absolute inset-0 bg-black/40" />
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-4xl">
        {editing === "headline" ? (
          <textarea
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSave();
              }
            }}
            className="w-full text-5xl md:text-7xl font-bold bg-white/90 text-black p-4 rounded"
            autoFocus
          />
        ) : (
          <h1
            onClick={() => handleClick("headline", section.content.headline)}
            className={`text-5xl md:text-7xl font-bold mb-6 ${
              isAdmin ? "cursor-pointer hover:bg-white/20 p-2 rounded" : ""
            }`}
          >
            {section.content.headline}
          </h1>
        )}
        {editing === "subheadline" ? (
          <textarea
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSave();
              }
            }}
            className="w-full text-xl md:text-2xl bg-white/90 text-black p-4 rounded mb-6"
            autoFocus
          />
        ) : (
          <p
            onClick={() => handleClick("subheadline", section.content.subheadline)}
            className={`text-xl md:text-2xl mb-8 ${
              isAdmin ? "cursor-pointer hover:bg-white/20 p-2 rounded" : ""
            }`}
          >
            {section.content.subheadline}
          </p>
        )}

        {/* CTA Button */}
        {section.content.ctaButton && (() => {
          const normalizedLink = normalizeInternalLink(section.content.ctaButton.link, siteSlug);
          const isAnchor = normalizedLink.startsWith("#");
          const isExternal = normalizedLink.startsWith("http://") || normalizedLink.startsWith("https://");
          
          if (isAnchor || isExternal) {
            return (
              <a
                href={normalizedLink}
                className="inline-block px-8 py-4 bg-white text-gray-900 font-bold text-lg rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
                {...(isExternal && { target: "_blank", rel: "noopener noreferrer" })}
              >
                {section.content.ctaButton.text}
              </a>
            );
          }
          
          return (
            <Link
              href={normalizedLink}
              className="inline-block px-8 py-4 bg-white text-gray-900 font-bold text-lg rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              {section.content.ctaButton.text}
            </Link>
          );
        })()}
      </div>
    </section>
  );
}
