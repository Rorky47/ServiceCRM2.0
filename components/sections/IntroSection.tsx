"use client";

import { useState } from "react";
import { Section } from "@/types";
import RichTextEditor from "@/components/RichTextEditor";
import RichTextDisplay from "@/components/RichTextDisplay";

interface IntroSectionProps {
  section: Extract<Section, { type: "intro" }>;
  isAdmin: boolean;
  onUpdate: (section: Section) => void;
  siteSlug: string;
}

export default function IntroSection({ section, isAdmin, onUpdate }: IntroSectionProps) {
  const [editing, setEditing] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState("");
  const [showLayoutControls, setShowLayoutControls] = useState(false);

  const handleClick = (field: string, currentValue: string) => {
    if (!isAdmin) return;
    setEditing(field);
    setTempValue(currentValue);
  };

  const handleSave = () => {
    if (editing === "subtitle") {
      onUpdate({
        ...section,
        content: { ...section.content, subtitle: tempValue },
      });
    } else if (editing === "title") {
      onUpdate({
        ...section,
        content: { ...section.content, title: tempValue },
      });
    } else if (editing === "body") {
      onUpdate({
        ...section,
        content: { ...section.content, body: tempValue },
      });
    }
    setEditing(null);
  };

  const textAlign = section.content.textAlign || "center";
  const alignClass = textAlign === "left" ? "text-left" : textAlign === "right" ? "text-right" : "text-center";
  const backgroundColor = section.content.backgroundColor || undefined;

  return (
    <section
      className={`py-12 sm:py-16 px-4 sm:px-6 ${isAdmin ? "border-2 border-dashed border-blue-500" : ""}`}
      style={backgroundColor ? { backgroundColor } : undefined}
    >
      <div className="max-w-4xl mx-auto">
        {isAdmin && (
          <div className="mb-4 bg-white rounded-lg shadow-lg p-4">
            <button
              onClick={() => setShowLayoutControls(!showLayoutControls)}
              className="text-sm font-semibold text-gray-700"
            >
              Layout {showLayoutControls ? "▼" : "▶"}
            </button>
            {showLayoutControls && (
              <div className="mt-2 space-y-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Text alignment</label>
                  <select
                    value={textAlign}
                    onChange={(e) =>
                      onUpdate({
                        ...section,
                        content: {
                          ...section.content,
                          textAlign: e.target.value as "left" | "center" | "right",
                        },
                      })
                    }
                    className="w-full px-2 py-1 text-xs border rounded"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Background color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={backgroundColor || "#ffffff"}
                      onChange={(e) =>
                        onUpdate({
                          ...section,
                          content: { ...section.content, backgroundColor: e.target.value },
                        })
                      }
                      className="h-8 w-16 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={backgroundColor || ""}
                      onChange={(e) =>
                        onUpdate({
                          ...section,
                          content: { ...section.content, backgroundColor: e.target.value || undefined },
                        })
                      }
                      placeholder="#ffffff"
                      className="flex-1 px-2 py-1 text-xs border rounded"
                    />
                    <button
                      onClick={() =>
                        onUpdate({
                          ...section,
                          content: { ...section.content, backgroundColor: undefined },
                        })
                      }
                      className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className={alignClass}>
          {(editing === "subtitle" || section.content.subtitle != null) && (
            <>
              {editing === "subtitle" ? (
                <input
                  type="text"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  onBlur={handleSave}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSave())}
                  className="w-full text-sm text-gray-500 mb-2 bg-gray-100 p-2 rounded"
                  placeholder="Subtitle"
                  autoFocus
                />
              ) : (
                <p
                  onClick={() => handleClick("subtitle", section.content.subtitle || "")}
                  className={`text-sm text-gray-500 mb-2 ${isAdmin ? "cursor-pointer hover:bg-gray-100 p-2 rounded" : ""}`}
                >
                  {section.content.subtitle || (isAdmin ? "Click to add subtitle..." : "")}
                </p>
              )}
            </>
          )}
          {isAdmin && section.content.subtitle == null && editing !== "subtitle" && (
            <button
              onClick={() => {
                setEditing("subtitle");
                setTempValue("");
              }}
              className="text-sm text-gray-400 hover:text-gray-600 mb-2"
            >
              + Add subtitle
            </button>
          )}

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
              className="w-full text-2xl sm:text-3xl font-bold mb-4 bg-gray-100 p-3 rounded"
              autoFocus
            />
          ) : (
            <h2
              onClick={() => handleClick("title", section.content.title)}
              className={`text-2xl sm:text-3xl font-bold mb-4 ${
                isAdmin ? "cursor-pointer hover:bg-gray-100 p-2 rounded" : ""
              }`}
            >
              {section.content.title}
            </h2>
          )}

          {section.content.body != null && section.content.body !== "" ? (
            editing === "body" ? (
              <RichTextEditor
                value={tempValue}
                onChange={setTempValue}
                onBlur={handleSave}
                placeholder="Body text..."
                className="mb-0"
              />
            ) : (
              <div
                onClick={() => handleClick("body", section.content.body || "")}
                className={`text-base text-gray-600 leading-relaxed ${
                  isAdmin ? "cursor-pointer hover:bg-gray-100 p-2 rounded" : ""
                }`}
              >
                <RichTextDisplay content={section.content.body} />
              </div>
            )
          ) : (
            isAdmin && (
              <button
                onClick={() => {
                  setEditing("body");
                  setTempValue("");
                }}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                + Add body text
              </button>
            )
          )}
        </div>
      </div>
    </section>
  );
}
