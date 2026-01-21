"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Section } from "@/types";
import RichTextEditor from "@/components/RichTextEditor";
import RichTextDisplay from "@/components/RichTextDisplay";
import { normalizeInternalLink } from "@/lib/link-utils";

interface ServicesSectionProps {
  section: Extract<Section, { type: "services" }>;
  isAdmin: boolean;
  onUpdate: (section: Section) => void;
  siteSlug: string;
}

export default function ServicesSection({ section, isAdmin, onUpdate, siteSlug }: ServicesSectionProps) {
  const [editing, setEditing] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState("");
  const [editingServiceIndex, setEditingServiceIndex] = useState<number | null>(null);
  const [showSectionControls, setShowSectionControls] = useState(false);
  const [showServiceControls, setShowServiceControls] = useState<number | null>(null);

  // Ensure items are in the new format (migrate old string[] to new format)
  const items = section.content.items.map((item) => {
    if (typeof item === "string") {
      return { title: item, description: "", image: "", color: "" };
    }
    return item;
  });

  const handleTitleClick = () => {
    if (!isAdmin) return;
    setEditing("title");
    setTempValue(section.content.title);
  };

  const handleSave = () => {
    if (editing === "title") {
      onUpdate({
        ...section,
        content: { ...section.content, title: tempValue },
      });
    } else if (editing?.startsWith("service-title-")) {
      const index = parseInt(editing.split("-")[2]);
      const newItems = [...items];
      newItems[index] = { ...newItems[index], title: tempValue };
      onUpdate({
        ...section,
        content: { ...section.content, items: newItems },
      });
    } else if (editing?.startsWith("service-desc-")) {
      const index = parseInt(editing.split("-")[2]);
      const newItems = [...items];
      newItems[index] = { ...newItems[index], description: tempValue };
      onUpdate({
        ...section,
        content: { ...section.content, items: newItems },
      });
    } else if (editing?.startsWith("service-button-text-")) {
      const index = parseInt(editing.split("-")[3]);
      const newItems = [...items];
      newItems[index] = {
        ...newItems[index],
        button: {
          text: tempValue,
          link: newItems[index].button?.link || "#",
        },
      };
      onUpdate({
        ...section,
        content: { ...section.content, items: newItems },
      });
    } else if (editing?.startsWith("service-button-link-")) {
      const index = parseInt(editing.split("-")[3]);
      const newItems = [...items];
      newItems[index] = {
        ...newItems[index],
        button: {
          text: newItems[index].button?.text || "Learn More",
          link: tempValue,
        },
      };
      onUpdate({
        ...section,
        content: { ...section.content, items: newItems },
      });
    }
    setEditing(null);
  };

  const handleServiceImageUpload = (index: number) => {
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
          const newItems = [...items];
          newItems[index] = { ...newItems[index], image: data.url };
          onUpdate({
            ...section,
            content: { ...section.content, items: newItems },
          });
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        alert("Failed to upload image");
      }
    };
    input.click();
  };

  const handleServiceImageUrl = (index: number) => {
    const url = prompt("Enter image URL:");
    if (url) {
      const newItems = [...items];
      newItems[index] = { ...newItems[index], image: url };
      onUpdate({
        ...section,
        content: { ...section.content, items: newItems },
      });
    }
  };

  const handleServiceImageRemove = (index: number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], image: "" };
    onUpdate({
      ...section,
      content: { ...section.content, items: newItems },
    });
  };

  const handleServiceColorChange = (index: number, color: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], color: color };
    onUpdate({
      ...section,
      content: { ...section.content, items: newItems },
    });
  };

  const handleBackgroundColorChange = (color: string) => {
    onUpdate({
      ...section,
      content: { ...section.content, backgroundColor: color },
    });
  };

  const handleAddService = () => {
    const newItems = [...items, { title: "New Service", description: "", image: "", color: "" }];
    onUpdate({
      ...section,
      content: { ...section.content, items: newItems },
    });
  };

  const handleButtonAdd = (index: number) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      button: { text: "Learn More", link: "#" },
    };
    onUpdate({
      ...section,
      content: { ...section.content, items: newItems },
    });
  };

  const handleButtonRemove = (index: number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], button: undefined };
    onUpdate({
      ...section,
      content: { ...section.content, items: newItems },
    });
  };

  const handleRemoveService = (index: number) => {
    if (confirm("Remove this service?")) {
      const newItems = items.filter((_, i) => i !== index);
      onUpdate({
        ...section,
        content: { ...section.content, items: newItems },
      });
    }
  };

  const backgroundColor = section.content.backgroundColor || "#ffffff";

  return (
    <section
      className={`py-20 px-4 ${
        isAdmin ? "border-2 border-dashed border-blue-500" : ""
      }`}
      style={{
        backgroundColor: backgroundColor,
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Admin Section Controls */}
        {isAdmin && (
          <div className="mb-4 bg-white rounded-lg shadow-lg p-4">
            <button
              onClick={() => setShowSectionControls(!showSectionControls)}
              className="text-sm font-semibold text-gray-700"
            >
              ⚙️ Section Settings {showSectionControls ? "▼" : "▶"}
            </button>
            {showSectionControls && (
              <div className="mt-2 space-y-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Background Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => handleBackgroundColorChange(e.target.value)}
                      className="h-8 w-16 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={backgroundColor}
                      onChange={(e) => handleBackgroundColorChange(e.target.value)}
                      placeholder="#ffffff"
                      className="flex-1 px-2 py-1 text-xs border rounded"
                    />
                    <button
                      onClick={() => handleBackgroundColorChange("#ffffff")}
                      className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Title */}
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

        {/* Services Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {items.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md overflow-hidden"
              style={{
                backgroundColor: item.color || undefined,
              }}
            >
              {/* Service Image */}
              {item.image && (
                <div className="relative h-48 w-full">
                  {item.image.startsWith("data:") ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  )}
                  {isAdmin && (
                    <button
                      onClick={() => handleServiceImageRemove(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
              )}

              {/* Service Content */}
              <div className="p-6">
                {/* Admin Controls for Service */}
                {isAdmin && (
                  <div className="mb-2 pb-2 border-b">
                    <button
                      onClick={() => setShowServiceControls(showServiceControls === index ? null : index)}
                      className="text-xs text-gray-600 hover:text-gray-800"
                    >
                      ⚙️ Edit Service {showServiceControls === index ? "▼" : "▶"}
                    </button>
                    {showServiceControls === index && (
                      <div className="mt-2 space-y-2">
                        {/* Image Controls */}
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Image</label>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleServiceImageUpload(index)}
                              className="flex-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                              📤 Upload
                            </button>
                            <button
                              onClick={() => handleServiceImageUrl(index)}
                              className="flex-1 px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                            >
                              🔗 URL
                            </button>
                            {item.image && (
                              <button
                                onClick={() => handleServiceImageRemove(index)}
                                className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Color Control */}
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Card Color</label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={item.color || "#ffffff"}
                              onChange={(e) => handleServiceColorChange(index, e.target.value)}
                              className="h-6 w-12 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={item.color || ""}
                              onChange={(e) => handleServiceColorChange(index, e.target.value)}
                              placeholder="#ffffff"
                              className="flex-1 px-2 py-1 text-xs border rounded"
                            />
                            <button
                              onClick={() => handleServiceColorChange(index, "")}
                              className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                            >
                              Clear
                            </button>
                          </div>
                        </div>

                        {/* Button Controls */}
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Button</label>
                          {item.button ? (
                            <div className="space-y-1">
                              {editing === `service-button-text-${index}` ? (
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
                                  onClick={() => {
                                    setEditing(`service-button-text-${index}`);
                                    setTempValue(item.button?.text || "");
                                  }}
                                  className="px-2 py-1 text-xs bg-gray-100 rounded cursor-pointer hover:bg-gray-200"
                                >
                                  Text: {item.button.text}
                                </div>
                              )}
                              {editing === `service-button-link-${index}` ? (
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
                                  placeholder="Button Link (e.g., /service/plumbing or https://...)"
                                  className="w-full px-2 py-1 text-xs border rounded"
                                  autoFocus
                                />
                              ) : (
                                <div
                                  onClick={() => {
                                    setEditing(`service-button-link-${index}`);
                                    setTempValue(item.button?.link || "");
                                  }}
                                  className="px-2 py-1 text-xs bg-gray-100 rounded cursor-pointer hover:bg-gray-200"
                                >
                                  Link: {item.button.link}
                                </div>
                              )}
                              <button
                                onClick={() => handleButtonRemove(index)}
                                className="w-full px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                              >
                                Remove Button
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleButtonAdd(index)}
                              className="w-full px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                            >
                              ➕ Add Button
                            </button>
                          )}
                        </div>

                        {/* Remove Service */}
                        <button
                          onClick={() => handleRemoveService(index)}
                          className="w-full px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          🗑️ Remove Service
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Service Title */}
                {editing === `service-title-${index}` ? (
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
                    className="w-full bg-white p-2 rounded mb-2"
                    autoFocus
                  />
                ) : (
                  <h3
                    onClick={() => {
                      if (isAdmin) {
                        setEditing(`service-title-${index}`);
                        setTempValue(item.title);
                      }
                    }}
                    className={`text-xl font-bold mb-2 ${
                      isAdmin ? "cursor-pointer hover:bg-gray-100 p-2 rounded" : ""
                    }`}
                  >
                    {item.title}
                  </h3>
                )}

                {/* Service Description */}
                {editing === `service-desc-${index}` ? (
                  <RichTextEditor
                    value={tempValue}
                    onChange={setTempValue}
                    onBlur={handleSave}
                    placeholder="Service description (optional)"
                    className="mb-2"
                  />
                ) : (
                  <div
                    onClick={() => {
                      if (isAdmin) {
                        setEditing(`service-desc-${index}`);
                        setTempValue(item.description || "");
                      }
                    }}
                    className={`text-gray-600 ${
                      isAdmin ? "cursor-pointer hover:bg-gray-100 p-2 rounded min-h-[40px]" : ""
                    }`}
                  >
                    {item.description ? (
                      <RichTextDisplay content={item.description} />
                    ) : (
                      isAdmin && <span className="text-gray-400">Click to add description...</span>
                    )}
                  </div>
                )}

                {/* Service Button */}
                {item.button && (() => {
                  const normalizedLink = normalizeInternalLink(item.button.link, siteSlug);
                  const isAnchor = normalizedLink.startsWith("#");
                  const isExternal = normalizedLink.startsWith("http://") || normalizedLink.startsWith("https://");
                  
                  if (isAnchor || isExternal) {
                    return (
                      <a
                        href={normalizedLink}
                        className="mt-4 inline-block w-full text-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                        {...(isExternal && { target: "_blank", rel: "noopener noreferrer" })}
                      >
                        {item.button.text}
                      </a>
                    );
                  }
                  
                  return (
                    <Link
                      href={normalizedLink}
                      className="mt-4 inline-block w-full text-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {item.button.text}
                    </Link>
                  );
                })()}

                {/* Add Image Button (if no image) */}
                {isAdmin && !item.image && (
                  <button
                    onClick={() => handleServiceImageUpload(index)}
                    className="mt-4 w-full py-2 border-2 border-dashed border-gray-300 rounded text-gray-500 hover:border-gray-400 hover:text-gray-600"
                  >
                    + Add Image
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add Service Button */}
        {isAdmin && (
          <button
            onClick={handleAddService}
            className="mt-8 mx-auto block px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600"
          >
            + Add Service
          </button>
        )}
      </div>
    </section>
  );
}
