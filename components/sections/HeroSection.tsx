"use client";

import { useState } from "react";
import { Section } from "@/types";
import OptimizedImage from "@/components/OptimizedImage";
import SmartLink from "@/components/SmartLink";

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
      className={`relative min-h-[50vh] sm:min-h-screen flex items-center justify-center overflow-hidden ${
        isAdmin ? "border-2 border-dashed border-blue-500" : ""
      }`}
      style={{
        backgroundColor: !hasImage ? backgroundColor : undefined,
      }}
    >
      {/* Admin Controls */}
      {isAdmin && (
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-50 space-y-2 max-w-[calc(100%-1rem)]">
          {/* Image Controls */}
          <div className="bg-white rounded-lg shadow-lg p-1.5 sm:p-2">
            <button
              onClick={() => setShowImageControls(!showImageControls)}
              className="text-xs sm:text-sm font-semibold text-gray-700 mb-1"
            >
              🖼️ Image {showImageControls ? "▼" : "▶"}
            </button>
            {showImageControls && (
              <div className="space-y-1">
                <button
                  onClick={handleImageUpload}
                  className="block w-full text-left px-1.5 py-1 sm:px-2 sm:py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 touch-manipulation"
                >
                  📤 Upload Image
                </button>
                <button
                  onClick={handleImageUrl}
                  className="block w-full text-left px-1.5 py-1 sm:px-2 sm:py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 touch-manipulation"
                >
                  🔗 Use URL
                </button>
                {hasImage && (
                  <button
                    onClick={handleImageRemove}
                    className="block w-full text-left px-1.5 py-1 sm:px-2 sm:py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 touch-manipulation"
                  >
                    🗑️ Remove Image
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Background Color */}
          <div className="bg-white rounded-lg shadow-lg p-1.5 sm:p-2">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="text-xs sm:text-sm font-semibold text-gray-700 mb-1"
            >
              🎨 Background {showColorPicker ? "▼" : "▶"}
            </button>
            {showColorPicker && (
              <div className="space-y-2">
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => handleBackgroundColorChange(e.target.value)}
                  className="w-full h-8 sm:h-10 cursor-pointer touch-manipulation"
                />
                <input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => handleBackgroundColorChange(e.target.value)}
                  placeholder="#000000"
                  className="w-full px-1.5 py-1 sm:px-2 sm:py-1 text-xs border rounded"
                />
                <button
                  onClick={() => handleBackgroundColorChange("")}
                  className="block w-full px-1.5 py-1 sm:px-2 sm:py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 touch-manipulation"
                >
                  Clear (use overlay)
                </button>
              </div>
            )}
          </div>

          {/* CTA Button */}
          <div className="bg-white rounded-lg shadow-lg p-1.5 sm:p-2">
            <button
              onClick={() => setShowCTAEditor(!showCTAEditor)}
              className="text-xs sm:text-sm font-semibold text-gray-700 mb-1"
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
      <div className="absolute inset-0 z-0 overflow-hidden">
        {hasImage && (
          <OptimizedImage
            src={section.content.image}
            alt="Hero"
            fill
            className="object-cover w-full h-full"
            style={{
              objectPosition: 'center',
            }}
          />
        )}
        {/* Overlay - only show if there's an image and no custom background color */}
        {hasImage && !section.content.backgroundColor && (
          <div className="absolute inset-0 bg-black/40" />
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 sm:px-6 max-w-4xl mx-auto w-full py-8 sm:py-12">
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
            className="w-full text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold bg-white/90 text-black p-3 sm:p-4 rounded"
            autoFocus
          />
        ) : (
          <h1
            onClick={() => handleClick("headline", section.content.headline)}
            className={`text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6 px-2 break-words ${
              isAdmin ? "cursor-pointer hover:bg-white/20 p-2 rounded" : ""
            }`}
            style={{
              wordBreak: 'break-word',
              hyphens: 'auto',
            }}
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
            className="w-full text-base sm:text-lg md:text-xl lg:text-2xl bg-white/90 text-black p-3 sm:p-4 rounded mb-4 sm:mb-6"
            autoFocus
          />
        ) : (
          <p
            onClick={() => handleClick("subheadline", section.content.subheadline)}
            className={`text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 px-2 break-words ${
              isAdmin ? "cursor-pointer hover:bg-white/20 p-2 rounded" : ""
            }`}
            style={{
              wordBreak: 'break-word',
              hyphens: 'auto',
            }}
          >
            {section.content.subheadline}
          </p>
        )}

        {/* CTA Button */}
        {section.content.ctaButton && (
          <SmartLink
            href={section.content.ctaButton.link}
            siteSlug={siteSlug}
            className="inline-block px-6 py-3 sm:px-8 sm:py-4 bg-white text-gray-900 font-bold text-base sm:text-lg rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
          >
            {section.content.ctaButton.text}
          </SmartLink>
        )}
      </div>
    </section>
  );
}
