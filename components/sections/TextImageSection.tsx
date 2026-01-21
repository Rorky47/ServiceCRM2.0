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
}

export default function TextImageSection({ section, isAdmin, onUpdate, siteSlug }: TextImageSectionProps) {
  // siteSlug is available for future use (e.g., link normalization)
  const [editing, setEditing] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState("");

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

  const handleImageClick = () => {
    if (!isAdmin) return;
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

  return (
    <section
      className={`py-12 sm:py-16 md:py-20 px-4 sm:px-6 ${
        isAdmin ? "border-2 border-dashed border-blue-500" : ""
      }`}
    >
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
            >
              <RichTextDisplay content={section.content.text} />
            </div>
          )}
        </div>
        <div className="relative h-64 sm:h-80 md:h-96 order-1 md:order-2">
          {section.content.image && (
            <OptimizedImage
              src={section.content.image}
              alt={section.content.title}
              fill
              className="object-cover rounded-lg"
              onClick={isAdmin ? handleImageClick : undefined}
            />
          )}
        </div>
      </div>
    </section>
  );
}

