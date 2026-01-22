"use client";

import { useState } from "react";
import { Site, Page, Section } from "@/types";
import SectionRenderer from "./SectionRenderer";
import HeaderRenderer from "./HeaderRenderer";
import FooterRenderer from "./FooterRenderer";
import EditableFooterRenderer from "./EditableFooterRenderer";
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

function SortableSection({ section, isAdmin, onUpdate, onDelete, siteSlug, themeColor }: { section: Section; isAdmin: boolean; onUpdate: (section: Section) => void; onDelete: (sectionId: string) => void; siteSlug: string; themeColor?: string }) {
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
            <div className="bg-gray-200 p-2 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-gray-600 text-xs sm:text-sm touch-manipulation"
            >
              ⋮⋮ Drag
            </button>
            <span className="text-xs sm:text-sm text-gray-600">{section.type}</span>
          </div>
          <button
            onClick={() => {
              if (confirm(`Are you sure you want to delete this ${section.type} section?`)) {
                onDelete(section.id);
              }
            }}
            className="text-red-600 hover:text-red-800 text-xs sm:text-sm font-medium px-2 py-1 rounded hover:bg-red-50 touch-manipulation"
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
        themeColor={themeColor}
      />
    </div>
  );
}

export default function PageRenderer({ site: initialSite, page: initialPage, isAdmin }: PageRendererProps) {
  // Ensure page has sections array
  const safePage = {
    ...initialPage,
    sections: initialPage.sections || [],
  };
  const [site, setSite] = useState(initialSite);
  const [page, setPage] = useState(safePage);
  const [saving, setSaving] = useState(false);
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [mobilePreview, setMobilePreview] = useState(false);
  const [mobileWidth, setMobileWidth] = useState<375 | 390 | 428>(375); // Common mobile widths

  const handleSiteUpdate = async (updatedSite: Site) => {
    setSite(updatedSite);
    setSaving(true);
    try {
      const response = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSite),
      });
      if (!response.ok) {
        console.error("Failed to save site");
      }
    } catch (error) {
      console.error("Error saving site:", error);
    } finally {
      setSaving(false);
    }
  };

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
    <>
      {isAdmin && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-400 text-black p-2 z-50 text-xs sm:text-sm">
          <div className="flex items-center justify-between max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-3">
              <span className="font-semibold">ADMIN MODE</span>
              {saving && <span className="text-xs">- Saving...</span>}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMobilePreview(!mobilePreview)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors touch-manipulation ${
                  mobilePreview
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-white/90 text-gray-800 hover:bg-white"
                }`}
                title="Toggle mobile preview"
              >
                📱 {mobilePreview ? "Mobile" : "Desktop"}
              </button>
              {mobilePreview && (
                <select
                  value={mobileWidth}
                  onChange={(e) => setMobileWidth(Number(e.target.value) as 375 | 390 | 428)}
                  className="px-2 py-1 rounded text-xs bg-white/90 text-gray-800 border border-gray-300 touch-manipulation"
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value={375}>iPhone SE (375px)</option>
                  <option value={390}>iPhone 12/13 (390px)</option>
                  <option value={428}>iPhone 14 Pro Max (428px)</option>
                </select>
              )}
            </div>
          </div>
        </div>
      )}
      <div
        className={mobilePreview && isAdmin ? "flex justify-center bg-gray-200 min-h-screen pt-12 pb-12" : ""}
        style={{
          fontFamily: site.theme.font || "system-ui",
          color: site.theme.primaryColor || "#000",
        }}
      >
        <div
          className={mobilePreview && isAdmin ? "transition-all duration-300 shadow-2xl bg-white relative flex flex-col" : "w-full"}
          style={
            mobilePreview && isAdmin
              ? {
                  width: `${mobileWidth}px`,
                  maxWidth: `${mobileWidth}px`,
                  marginTop: "20px",
                  marginBottom: "20px",
                  borderRadius: "12px",
                  overflow: "hidden",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                  border: "4px solid #3b82f6",
                  minHeight: "667px", // Typical mobile viewport height
                  maxHeight: "90vh",
                  overflowY: "auto",
                  WebkitOverflowScrolling: "touch",
                  display: "flex",
                  flexDirection: "column",
                }
              : {}
          }
        >
          {mobilePreview && isAdmin && (
            <div className="absolute top-0 left-0 right-0 bg-blue-600 text-white text-center py-1 text-xs font-semibold z-10">
              Mobile Preview - {mobileWidth}px
            </div>
          )}
          {/* Mobile Preview Wrapper - Forces mobile viewport behavior */}
          <div 
            className={mobilePreview && isAdmin ? "pt-6 flex flex-col mobile-preview-wrapper" : ""}
            style={mobilePreview && isAdmin ? {
              width: '100%',
              maxWidth: '100%',
              minHeight: '100%',
              flex: '1 1 auto',
            } : {}}
          >
          {/* Header in mobile preview - only show when in mobile preview mode */}
          {mobilePreview && isAdmin && site.header && (
            <div className="w-full mobile-preview-header" style={{ position: 'relative', zIndex: 1 }}>
              <HeaderRenderer site={site} />
            </div>
          )}
          
          {/* Header in desktop admin mode - only show when NOT in mobile preview */}
          {!mobilePreview && isAdmin && site.header && (
            <div className="w-full mb-4">
              <HeaderRenderer site={site} />
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
            <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
              <button
                onClick={() => setShowAddSectionModal(true)}
                className="bg-blue-600 text-white px-4 py-3 sm:px-6 sm:py-3 rounded-lg shadow-lg hover:bg-blue-700 font-medium text-sm sm:text-base touch-manipulation"
              >
                + Add Section
              </button>
              <a
                href={`/admin/${site.slug}/leads`}
                className="bg-gray-600 text-white px-4 py-3 sm:px-6 sm:py-3 rounded-lg shadow-lg hover:bg-gray-700 text-center text-sm sm:text-base touch-manipulation"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Add New Section</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Choose a section type to add to your page</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => handleAddSection("hero")}
                className="p-3 sm:p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left touch-manipulation"
              >
                <div className="font-semibold text-gray-900 text-sm sm:text-base">Hero</div>
                <div className="text-xs sm:text-sm text-gray-500 mt-1">Large banner with headline</div>
              </button>
              <button
                onClick={() => handleAddSection("services")}
                className="p-3 sm:p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left touch-manipulation"
              >
                <div className="font-semibold text-gray-900 text-sm sm:text-base">Services</div>
                <div className="text-xs sm:text-sm text-gray-500 mt-1">Service cards grid</div>
              </button>
              <button
                onClick={() => handleAddSection("textImage")}
                className="p-3 sm:p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left touch-manipulation"
              >
                <div className="font-semibold text-gray-900 text-sm sm:text-base">Text & Image</div>
                <div className="text-xs sm:text-sm text-gray-500 mt-1">Content with image</div>
              </button>
              <button
                onClick={() => handleAddSection("contact")}
                className="p-3 sm:p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left touch-manipulation"
              >
                <div className="font-semibold text-gray-900 text-sm sm:text-base">Contact</div>
                <div className="text-xs sm:text-sm text-gray-500 mt-1">Contact form</div>
              </button>
            </div>
            <div className="mt-4 sm:mt-6 flex justify-end">
              <button
                onClick={() => setShowAddSectionModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm sm:text-base touch-manipulation"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
          
          {/* Footer in mobile preview - only show when in mobile preview mode */}
          {mobilePreview && isAdmin && site.footer && (
            <div className="w-full mt-auto" style={{ position: 'relative', zIndex: 1 }}>
              <EditableFooterRenderer site={site} isAdmin={isAdmin} onUpdate={handleSiteUpdate} />
            </div>
          )}
          
          {/* Footer in desktop admin mode - only show when NOT in mobile preview */}
          {!mobilePreview && isAdmin && site.footer && (
            <div className="w-full mt-8">
              <EditableFooterRenderer site={site} isAdmin={isAdmin} onUpdate={handleSiteUpdate} />
            </div>
          )}

          {/* Footer in non-admin mode */}
          {!isAdmin && site.footer && (
            <FooterRenderer site={site} />
          )}
          </div>
        </div>
      </div>
    </>
  );
}

