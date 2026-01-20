"use client";

import { useState } from "react";
import { Section } from "@/types";
import RichTextEditor from "@/components/RichTextEditor";
import RichTextDisplay from "@/components/RichTextDisplay";

interface ContactSectionProps {
  section: Extract<Section, { type: "contact" }>;
  isAdmin: boolean;
  onUpdate: (section: Section) => void;
  siteSlug: string;
}

export default function ContactSection({ section, isAdmin, onUpdate, siteSlug }: ContactSectionProps) {
  const [editing, setEditing] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
    } else if (editing === "description") {
      onUpdate({
        ...section,
        content: { ...section.content, description: tempValue },
      });
    }
    setEditing(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, siteSlug }),
      });
      if (response.ok) {
        setSubmitted(true);
        setFormData({ name: "", email: "", message: "" });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      className={`py-20 px-4 bg-gray-50 ${
        isAdmin ? "border-2 border-dashed border-blue-500" : ""
      }`}
    >
      <div className="max-w-2xl mx-auto">
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
            className="w-full text-4xl font-bold mb-6 bg-white p-4 rounded"
            autoFocus
          />
        ) : (
          <h2
            onClick={() => handleClick("title", section.content.title)}
            className={`text-4xl font-bold mb-6 text-center ${
              isAdmin ? "cursor-pointer hover:bg-gray-200 p-2 rounded" : ""
            }`}
          >
            {section.content.title}
          </h2>
        )}
        {editing === "description" ? (
          <RichTextEditor
            value={tempValue}
            onChange={setTempValue}
            onBlur={handleSave}
            placeholder="Enter description..."
            className="mb-8"
          />
        ) : (
          <div
            onClick={() => handleClick("description", section.content.description)}
            className={`text-lg text-center mb-8 ${
              isAdmin ? "cursor-pointer hover:bg-gray-200 p-2 rounded" : ""
            }`}
          >
            <RichTextDisplay content={section.content.description} />
          </div>
        )}
        {!isAdmin && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="text"
              placeholder="Your Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300"
            />
            <input
              type="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300"
            />
            <textarea
              placeholder="Your Message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
              rows={6}
              className="w-full px-4 py-3 rounded-lg border border-gray-300"
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Sending..." : "Send Message"}
            </button>
            {submitted && (
              <p className="text-green-600 text-center">Thank you! Your message has been sent.</p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}

