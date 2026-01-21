"use client";

import { useState } from "react";
import { Section } from "@/types";
import RichTextEditor from "@/components/RichTextEditor";
import RichTextDisplay from "@/components/RichTextDisplay";
import OptimizedImage from "@/components/OptimizedImage";

interface TextImageSectionProps {
  section: Extract<Section, { type: "textImage" }>;
  isAdmin: boolean;
  onUpdate: (section: Section) => void;
  siteSlug: string;
  themeColor?: string;
}

export default function TextImageSection({ section, isAdmin, onUpdate, siteSlug, themeColor }: TextImageSectionProps) {
  const [editing, setEditing] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState("");
  const [showImageControls, setShowImageControls] = useState(false);
  const [showTitleColorPicker, setShowTitleColorPicker] = useState(false);
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);

  // Use theme color as default, fallback to black
  const defaultThemeColor = themeColor || "#000000";

  const handleClick = (field: string, currentValue: string) => {
    if (!isAdmin) return;
    setEditing(field);
    setTempValue(currentValue);
  };

  const handleSave = () => {
    if (editing === "title") {
      onUpdate({
        ...section,
        content: { ...section.content, title: tempValue },
      });
    } else if (editing === "text") {
      onUpdate({
        ...section,
        content: { ...section.content, text: tempValue },
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

  const handleImageUrl = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      onUpdate({
        ...section,
        content: { ...section.content, image: url },
      });
    }
  };

  const handleImageRemove = () => {
    if (confirm("Remove image?")) {
      onUpdate({
        ...section,
        content: { ...section.content, image: "" },
      });
    }
  };

  const handleTitleColorChange = (color: string) => {
    onUpdate({
      ...section,
      content: { ...section.content, titleColor: color },
    });
  };

  const handleTextColorChange = (color: string) => {
    onUpdate({
      ...section,
      content: { ...section.content, textColor: color },
    });
  };

  const titleColor = section.content.titleColor || defaultThemeColor;
  const textColor = section.content.textColor || defaultThemeColor;

  return (
    <section
      className={`relative py-12 sm:py-16 md:py-20 px-4 sm:px-6 ${
        isAdmin ? "border-2 border-dashed border-blue-500" : ""
      }`}
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
                  {section.content.image && (
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

            {/* Title Color */}
            <div className="bg-white rounded-lg shadow-lg p-1.5 sm:p-2">
              <button
                onClick={() => setShowTitleColorPicker(!showTitleColorPicker)}
                className="text-xs sm:text-sm font-semibold text-gray-700 mb-1"
              >
                🎨 Title Color {showTitleColorPicker ? "▼" : "▶"}
              </button>
              {showTitleColorPicker && (
                <div className="space-y-2">
                  <input
                    type="color"
                    value={titleColor}
                    onChange={(e) => handleTitleColorChange(e.target.value)}
                    className="w-full h-8 sm:h-10 cursor-pointer touch-manipulation"
                  />
                  <input
                    type="text"
                    value={titleColor}
                    onChange={(e) => handleTitleColorChange(e.target.value)}
                    placeholder={defaultThemeColor}
                    className="w-full px-1.5 py-1 sm:px-2 sm:py-1 text-xs border rounded"
                  />
                  <button
                    onClick={() => handleTitleColorChange("")}
                    className="block w-full px-1.5 py-1 sm:px-2 sm:py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 touch-manipulation"
                  >
                    Reset (use theme)
                  </button>
                </div>
              )}
            </div>

            {/* Text Color */}
            <div className="bg-white rounded-lg shadow-lg p-1.5 sm:p-2">
              <button
                onClick={() => setShowTextColorPicker(!showTextColorPicker)}
                className="text-xs sm:text-sm font-semibold text-gray-700 mb-1"
              >
                🎨 Text Color {showTextColorPicker ? "▼" : "▶"}
              </button>
              {showTextColorPicker && (
                <div className="space-y-2">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => handleTextColorChange(e.target.value)}
                    className="w-full h-8 sm:h-10 cursor-pointer touch-manipulation"
                  />
                  <input
                    type="text"
                    value={textColor}
                    onChange={(e) => handleTextColorChange(e.target.value)}
                    placeholder={defaultThemeColor}
                    className="w-full px-1.5 py-1 sm:px-2 sm:py-1 text-xs border rounded"
                  />
                  <button
                    onClick={() => handleTextColorChange("")}
                    className="block w-full px-1.5 py-1 sm:px-2 sm:py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 touch-manipulation"
                  >
                    Reset (use theme)
                  </button>
                </div>
              )}
            </div>
          </div>
      )}

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center">
        <div className="order-2 md:order-1">
          {editing === "title" ? (
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
              className="w-full text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 bg-gray-100 p-3 sm:p-4 rounded"
              autoFocus
            />
          ) : (
            <h2
              onClick={() => handleClick("title", section.content.title)}
              className={`text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 ${
                isAdmin ? "cursor-pointer hover:bg-gray-100 p-2 rounded" : ""
              }`}
              style={{ color: titleColor }}
            >
              {section.content.title}
            </h2>
          )}
          {editing === "text" ? (
            <RichTextEditor
              value={tempValue}
              onChange={setTempValue}
              onBlur={handleSave}
              placeholder="Enter your content here..."
              className="mb-4"
            />
          ) : (
            <div
              onClick={() => handleClick("text", section.content.text)}
              className={`text-base sm:text-lg leading-relaxed ${
                isAdmin ? "cursor-pointer hover:bg-gray-100 p-2 rounded" : ""
              }`}
              style={{ color: textColor }}
            >
              <RichTextDisplay content={section.content.text} />
            </div>
          )}
        </div>
        <div className="relative h-64 sm:h-80 md:h-96 order-1 md:order-2">
          {section.content.image ? (
            <OptimizedImage
              src={section.content.image}
              alt={section.content.title}
              fill
              className="object-cover rounded-lg cursor-pointer"
              onClick={isAdmin ? handleImageUpload : undefined}
            />
          ) : (
            <div
              className={`w-full h-full border-2 border-dashed rounded-lg flex items-center justify-center ${
                isAdmin ? "cursor-pointer hover:border-blue-500 bg-gray-50" : "border-gray-300"
              }`}
              onClick={isAdmin ? handleImageUpload : undefined}
            >
              {isAdmin ? (
                <div className="text-center p-4">
                  <div className="text-4xl mb-2">📷</div>
                  <div className="text-sm text-gray-600">Click to add image</div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
