"use client";

import { useState } from "react";
import Image from "next/image";
import { Section } from "@/types";

interface HeroSectionProps {
  section: Extract<Section, { type: "hero" }>;
  isAdmin: boolean;
  onUpdate: (section: Section) => void;
}

export default function HeroSection({ section, isAdmin, onUpdate }: HeroSectionProps) {
  const [editing, setEditing] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState("");

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
      className={`relative min-h-screen flex items-center justify-center ${
        isAdmin ? "border-2 border-dashed border-blue-500 p-4" : ""
      }`}
    >
      <div className="absolute inset-0 z-0">
        {section.content.image && (
          section.content.image.startsWith("data:") ? (
            <img
              src={section.content.image}
              alt="Hero"
              className="w-full h-full object-cover"
              onClick={handleImageClick}
              style={{ cursor: isAdmin ? "pointer" : "default" }}
            />
          ) : (
            <Image
              src={section.content.image}
              alt="Hero"
              fill
              className="object-cover"
              onClick={handleImageClick}
              style={{ cursor: isAdmin ? "pointer" : "default" }}
            />
          )
        )}
        <div className="absolute inset-0 bg-black/40" />
      </div>
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
            className="w-full text-xl md:text-2xl bg-white/90 text-black p-4 rounded"
            autoFocus
          />
        ) : (
          <p
            onClick={() => handleClick("subheadline", section.content.subheadline)}
            className={`text-xl md:text-2xl ${
              isAdmin ? "cursor-pointer hover:bg-white/20 p-2 rounded" : ""
            }`}
          >
            {section.content.subheadline}
          </p>
        )}
      </div>
    </section>
  );
}

