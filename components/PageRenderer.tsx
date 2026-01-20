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

function SortableSection({ section, isAdmin, onUpdate, siteSlug }: { section: Section; isAdmin: boolean; onUpdate: (section: Section) => void; siteSlug: string }) {
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
        <div className="bg-gray-200 p-2 flex items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-600"
          >
            ⋮⋮ Drag
          </button>
          <span className="text-sm text-gray-600">{section.type}</span>
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
  const [page, setPage] = useState(initialPage);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleSectionUpdate = async (updatedSection: Section) => {
    const newSections = page.sections.map((s) =>
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
      const oldIndex = page.sections.findIndex((s) => s.id === active.id);
      const newIndex = page.sections.findIndex((s) => s.id === over.id);
      const newSections = arrayMove(page.sections, oldIndex, newIndex);
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

  return (
    <div
      style={{
        fontFamily: site.theme.font || "system-ui",
        color: site.theme.primaryColor || "#000",
      }}
    >
      {isAdmin && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-400 text-black p-2 text-center z-50">
          ADMIN MODE {saving && " - Saving..."}
        </div>
      )}
      {isAdmin ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={page.sections.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {page.sections.map((section) => (
              <SortableSection
                key={section.id}
                section={section}
                isAdmin={isAdmin}
                onUpdate={handleSectionUpdate}
                siteSlug={site.slug}
              />
            ))}
          </SortableContext>
        </DndContext>
      ) : (
        page.sections.map((section) => (
          <SectionRenderer
            key={section.id}
            section={section}
            isAdmin={isAdmin}
            onUpdate={handleSectionUpdate}
            siteSlug={site.slug}
          />
        ))
      )}
      {isAdmin && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg">
          <a
            href={`/admin/${site.slug}/leads`}
            className="text-white underline"
          >
            View Leads
          </a>
        </div>
      )}
    </div>
  );
}

