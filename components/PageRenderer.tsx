"use client";

import { useState } from "react";
import { Site, Page, Section } from "@/types";
import SectionRenderer from "./SectionRenderer";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface PageRendererProps {
  site: Site;
  page: Page;
  isAdmin: boolean;
}

function SortableSection({ section, isAdmin, onUpdate, onDelete, siteSlug }: { section: Section; isAdmin: boolean; onUpdate: (section: Section) => void; onDelete: (sectionId: string) => void; siteSlug: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {isAdmin && (
        <div className="bg-gray-200 p-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-gray-600"
            >
              ⋮⋮ Drag
            </button>
            <span className="text-sm text-gray-600">{section.type}</span>
          </div>
          <button
            onClick={() => {
              if (confirm(`Are you sure you want to delete this ${section.type} section?`)) {
                onDelete(section.id);
              }
            }}
            className="text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1 rounded hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      )}
      <SectionRenderer
        section={section}
        isAdmin={isAdmin}
        onUpdate={onUpdate}
        siteSlug={siteSlug}
      />
    </div>
  );
}

export default function PageRenderer({ site, page: initialPage, isAdmin }: PageRendererProps) {
  // Ensure page has sections array
  const safePage = {
    ...initialPage,
    sections: initialPage.sections || [],
  };
  const [page, setPage] = useState(safePage);
  const [saving, setSaving] = useState(false);
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleSectionUpdate = async (updatedSection: Section) => {
    const currentSections = page.sections || [];
    const newSections = currentSections.map((s) =>
      s.id === updatedSection.id ? updatedSection : s
    );
    const updatedPage = { ...page, sections: newSections };
    setPage(updatedPage);

    // Persist immediately
    setSaving(true);
    try {
      const response = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPage),
      });
      if (!response.ok) {
        console.error("Failed to save page");
      }
    } catch (error) {
      console.error("Error saving page:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const currentSections = page.sections || [];
      const oldIndex = currentSections.findIndex((s) => s.id === active.id);
      const newIndex = currentSections.findIndex((s) => s.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      const newSections = arrayMove(currentSections, oldIndex, newIndex);
      handleSectionsReorder(newSections);
    }
  };

  const handleSectionsReorder = async (newSections: Section[]) => {
    const updatedPage = { ...page, sections: newSections };
    setPage(updatedPage);

    setSaving(true);
    try {
      const response = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPage),
      });
      if (!response.ok) {
        console.error("Failed to save page");
      }
    } catch (error) {
      console.error("Error saving page:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    const currentSections = page.sections || [];
    const updatedPage = { ...page, sections: currentSections.filter((s) => s.id !== sectionId) };
    setPage(updatedPage);

    // Save to server
    setSaving(true);
    try {
      const response = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPage),
      });
      if (!response.ok) {
        console.error("Failed to save page");
        // Revert on error
        setPage(page);
      }
    } catch (error) {
      console.error("Error saving page:", error);
      // Revert on error
      setPage(page);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSection = (sectionType: Section["type"]) => {
    let newSection: Section;

    switch (sectionType) {
      case "hero":
        newSection = {
          id: `section-${Date.now()}`,
          type: "hero",
          content: {
            headline: "Welcome",
            subheadline: "Add your subheadline here",
            image: "",
          },
        };
        break;
      case "services":
        newSection = {
          id: `section-${Date.now()}`,
          type: "services",
          content: {
            title: "Our Services",
            items: [],
          },
        };
        break;
      case "textImage":
        newSection = {
          id: `section-${Date.now()}`,
          type: "textImage",
          content: {
            title: "Section Title",
            text: "Add your text here",
            image: "",
          },
        };
        break;
      case "contact":
        newSection = {
          id: `section-${Date.now()}`,
          type: "contact",
          content: {
            title: "Contact Us",
            description: "Get in touch with us",
          },
        };
        break;
      default:
        return;
    }

    const currentSections = page.sections || [];
    const updatedPage = { ...page, sections: [...currentSections, newSection] };
    setPage(updatedPage);
    setShowAddSectionModal(false);

    // Save to server
    setSaving(true);
    fetch("/api/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedPage),
    })
      .then((response) => {
        if (!response.ok) {
          console.error("Failed to save page");
        }
      })
      .catch((error) => {
        console.error("Error saving page:", error);
      })
      .finally(() => {
        setSaving(false);
      });
  };

  return (
    <div
      style={{
        fontFamily: site.theme.font || "system-ui",
        color: site.theme.primaryColor || "#000",
      }}
    >
      {isAdmin && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-400 text-black p-2 text-center z-40">
          ADMIN MODE {saving && " - Saving..."}
        </div>
      )}
      {isAdmin ? (
        <>
          {(!page.sections || page.sections.length === 0) ? (
            <div className="min-h-screen flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">No sections yet</h2>
                <p className="text-gray-600 mb-6">Add your first section to get started</p>
                <button
                  onClick={() => setShowAddSectionModal(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 text-lg font-medium"
                >
                  + Add Section
                </button>
              </div>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={(page.sections || []).map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                {(page.sections || []).map((section) => (
                  <SortableSection
                    key={section.id}
                    section={section}
                    isAdmin={isAdmin}
                    onUpdate={handleSectionUpdate}
                    onDelete={handleDeleteSection}
                    siteSlug={site.slug}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
          {page.sections && page.sections.length > 0 && (
            <div className="fixed bottom-4 right-4 flex flex-col gap-2">
              <button
                onClick={() => setShowAddSectionModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 font-medium"
              >
                + Add Section
              </button>
              <a
                href={`/admin/${site.slug}/leads`}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-gray-700 text-center"
              >
                View Leads
              </a>
            </div>
          )}
        </>
      ) : (
        (page.sections || []).map((section) => (
          <SectionRenderer
            key={section.id}
            section={section}
            isAdmin={isAdmin}
            onUpdate={handleSectionUpdate}
            siteSlug={site.slug}
          />
        ))
      )}

      {/* Add Section Modal */}
      {showAddSectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Add New Section</h2>
            <p className="text-gray-600 mb-6">Choose a section type to add to your page</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleAddSection("hero")}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="font-semibold text-gray-900">Hero</div>
                <div className="text-sm text-gray-500 mt-1">Large banner with headline</div>
              </button>
              <button
                onClick={() => handleAddSection("services")}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="font-semibold text-gray-900">Services</div>
                <div className="text-sm text-gray-500 mt-1">Service cards grid</div>
              </button>
              <button
                onClick={() => handleAddSection("textImage")}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="font-semibold text-gray-900">Text & Image</div>
                <div className="text-sm text-gray-500 mt-1">Content with image</div>
              </button>
              <button
                onClick={() => handleAddSection("contact")}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="font-semibold text-gray-900">Contact</div>
                <div className="text-sm text-gray-500 mt-1">Contact form</div>
              </button>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowAddSectionModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

