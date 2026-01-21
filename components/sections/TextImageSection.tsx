"use client";

import { useState } from "react";
import Image from "next/image";
import { Section } from "@/types";
import RichTextEditor from "@/components/RichTextEditor";
import RichTextDisplay from "@/components/RichTextDisplay";

interface TextImageSectionProps {
  section: Extract<Section, { type: "textImage" }>;
  isAdmin: boolean;
  onUpdate: (section: Section) => void;
  siteSlug: string;
}

export default function TextImageSection({ section, isAdmin, onUpdate, siteSlug }: TextImageSectionProps) {
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
      className={`py-20 px-4 ${
        isAdmin ? "border-2 border-dashed border-blue-500" : ""
      }`}
    >
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div>
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
              className="w-full text-3xl font-bold mb-6 bg-gray-100 p-4 rounded"
              autoFocus
            />
          ) : (
            <h2
              onClick={() => handleClick("title", section.content.title)}
              className={`text-3xl font-bold mb-6 ${
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
              className={`text-lg leading-relaxed ${
                isAdmin ? "cursor-pointer hover:bg-gray-100 p-2 rounded" : ""
              }`}
            >
              <RichTextDisplay content={section.content.text} />
            </div>
          )}
        </div>
        <div className="relative h-96">
          {section.content.image && (
            section.content.image.startsWith("data:") ? (
              <img
                src={section.content.image}
                alt={section.content.title}
                className="w-full h-full object-cover rounded-lg"
                onClick={handleImageClick}
                style={{ cursor: isAdmin ? "pointer" : "default" }}
              />
            ) : (
              <Image
                src={section.content.image}
                alt={section.content.title}
                fill
                className="object-cover rounded-lg"
                onClick={handleImageClick}
                style={{ cursor: isAdmin ? "pointer" : "default" }}
              />
            )
          )}
        </div>
      </div>
    </section>
  );
}

