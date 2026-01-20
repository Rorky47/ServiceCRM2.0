"use client";

import { useState } from "react";
import { Section } from "@/types";

interface ServicesSectionProps {
  section: Extract<Section, { type: "services" }>;
  isAdmin: boolean;
  onUpdate: (section: Section) => void;
}

export default function ServicesSection({ section, isAdmin, onUpdate }: ServicesSectionProps) {
  const [editing, setEditing] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState("");

  const handleTitleClick = () => {
    if (!isAdmin) return;
    setEditing("title");
    setTempValue(section.content.title);
  };

  const handleItemClick = (index: number) => {
    if (!isAdmin) return;
    setEditing(`item-${index}`);
    setTempValue(section.content.items[index]);
  };

  const handleSave = () => {
    if (editing === "title") {
      onUpdate({
        ...section,
        content: { ...section.content, title: tempValue },
      });
    } else if (editing?.startsWith("item-")) {
      const index = parseInt(editing.split("-")[1]);
      const newItems = [...section.content.items];
      newItems[index] = tempValue;
      onUpdate({
        ...section,
        content: { ...section.content, items: newItems },
      });
    }
    setEditing(null);
  };

  const handleAddItem = () => {
    if (!isAdmin) return;
    onUpdate({
      ...section,
      content: {
        ...section.content,
        items: [...section.content.items, "New service"],
      },
    });
  };

  const handleRemoveItem = (index: number) => {
    if (!isAdmin) return;
    const newItems = section.content.items.filter((_, i) => i !== index);
    onUpdate({
      ...section,
      content: { ...section.content, items: newItems },
    });
  };

  return (
    <section
      className={`py-20 px-4 ${
        isAdmin ? "border-2 border-dashed border-blue-500" : ""
      }`}
    >
      <div className="max-w-6xl mx-auto">
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
            className="w-full text-4xl font-bold mb-12 bg-gray-100 p-4 rounded"
            autoFocus
          />
        ) : (
          <h2
            onClick={handleTitleClick}
            className={`text-4xl font-bold mb-12 text-center ${
              isAdmin ? "cursor-pointer hover:bg-gray-100 p-2 rounded" : ""
            }`}
          >
            {section.content.title}
          </h2>
        )}
        <div className="grid md:grid-cols-3 gap-8">
          {section.content.items.map((item, index) => (
            <div key={index} className="bg-gray-50 p-6 rounded-lg">
              {editing === `item-${index}` ? (
                <div>
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
                    className="w-full bg-white p-2 rounded"
                    autoFocus
                  />
                  {isAdmin && (
                    <button
                      onClick={() => handleRemoveItem(index)}
                      className="mt-2 text-red-500 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ) : (
                <p
                  onClick={() => handleItemClick(index)}
                  className={`text-lg ${
                    isAdmin ? "cursor-pointer hover:bg-gray-200 p-2 rounded" : ""
                  }`}
                >
                  {item}
                </p>
              )}
            </div>
          ))}
        </div>
        {isAdmin && (
          <button
            onClick={handleAddItem}
            className="mt-8 mx-auto block px-4 py-2 bg-blue-500 text-white rounded"
          >
            + Add Service
          </button>
        )}
      </div>
    </section>
  );
}

