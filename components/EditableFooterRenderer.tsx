"use client";

import { useState, useEffect } from "react";
import { Site } from "@/types";
import FooterRenderer from "./FooterRenderer";
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
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FaGripVertical, FaTimes, FaCog } from "react-icons/fa";

interface EditableFooterRendererProps {
  site: Site;
  isAdmin: boolean;
  onUpdate: (site: Site) => void;
}

function SortableFooterColumn({
  column,
  columnIndex,
  footer,
  onUpdate,
  site,
}: {
  column: { title: string; links: Array<{ label: string; url: string }> };
  columnIndex: number;
  footer: NonNullable<Site["footer"]>;
  onUpdate: (site: Site) => void;
  site: Site;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `column-${columnIndex}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group"
    >
      <div className="absolute -top-8 left-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-auto">
        <button
          {...attributes}
          {...listeners}
          className="bg-yellow-400 text-black px-2 py-1 rounded cursor-grab active:cursor-grabbing text-xs flex items-center gap-1 shadow-lg"
          title="Drag to reorder"
        >
          <FaGripVertical /> Drag
        </button>
        <button
          onClick={() => {
            const newColumns = [...(footer.columns || [])];
            newColumns.splice(columnIndex, 1);
            onUpdate({
              ...site,
              footer: { ...footer, columns: newColumns },
            });
          }}
          className="bg-red-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1 shadow-lg"
          title="Delete column"
        >
          <FaTimes /> Delete
        </button>
      </div>
    </div>
  );
}

export default function EditableFooterRenderer({
  site,
  isAdmin,
  onUpdate,
}: EditableFooterRendererProps) {
  // All hooks must be called at the top level, before any conditional returns
  const [saving, setSaving] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [hoveredColumnIndex, setHoveredColumnIndex] = useState<number | null>(null);
  
  // Spacing state - initialize from footer config or defaults
  const [columnGap, setColumnGap] = useState<number>((site.footer as any)?.columnGap ?? 6);
  const [topPadding, setTopPadding] = useState<number>((site.footer as any)?.topPadding ?? 12);
  const [bottomPadding, setBottomPadding] = useState<number>((site.footer as any)?.bottomPadding ?? 8);
  const [bottomMargin, setBottomMargin] = useState<number>((site.footer as any)?.bottomMargin ?? 6);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Sync spacing state when footer changes - must be before any conditional returns
  useEffect(() => {
    if (site.footer) {
      const footerAny = site.footer as any;
      if (footerAny.columnGap !== undefined) setColumnGap(footerAny.columnGap);
      if (footerAny.topPadding !== undefined) setTopPadding(footerAny.topPadding);
      if (footerAny.bottomPadding !== undefined) setBottomPadding(footerAny.bottomPadding);
      if (footerAny.bottomMargin !== undefined) setBottomMargin(footerAny.bottomMargin);
    }
  }, [site.footer]);

  if (!site.footer) return null;

  const footer = site.footer;
  
  // Calculate grid structure to match FooterRenderer
  const hasLogo = footer.showLogo && (footer.logo || site.theme?.logo);
  const columnCount = footer.columns?.length || 0;
  const hasContact = footer.emailAddress || footer.phoneNumber;
  const totalItems = (hasLogo ? 1 : 0) + columnCount + (hasContact ? 1 : 0);
  
  const getGridClasses = () => {
    if (totalItems === 0) return "grid-cols-1";
    if (totalItems === 1) return "grid-cols-1";
    if (totalItems === 2) return "grid-cols-1 sm:grid-cols-2";
    if (totalItems === 3) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    if (totalItems === 4) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
    if (totalItems === 5) return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5";
    return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !footer.columns) return;

    const oldIndex = parseInt(active.id.toString().replace("column-", ""));
    const newIndex = parseInt(over.id.toString().replace("column-", ""));

    if (oldIndex !== newIndex && !isNaN(oldIndex) && !isNaN(newIndex)) {
      const newColumns = arrayMove(footer.columns, oldIndex, newIndex);
      handleUpdate({ ...footer, columns: newColumns });
    }
  };

  const handleUpdate = async (updatedFooter: typeof footer) => {
    const updatedSite = { ...site, footer: updatedFooter };
    setSaving(true);
    try {
      const response = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSite),
      });
      if (response.ok) {
        onUpdate(updatedSite);
      }
    } catch (error) {
      console.error("Error saving footer:", error);
    } finally {
      setSaving(false);
    }
  };

  const updateLogoScale = (scale: number) => {
    handleUpdate({ ...footer, logoScale: scale });
  };

  const updateSpacing = async (field: 'columnGap' | 'topPadding' | 'bottomPadding' | 'bottomMargin', value: number) => {
    const updatedFooter = { ...footer, [field]: value } as any;
    await handleUpdate(updatedFooter);
    // Update local state
    if (field === 'columnGap') setColumnGap(value);
    if (field === 'topPadding') setTopPadding(value);
    if (field === 'bottomPadding') setBottomPadding(value);
    if (field === 'bottomMargin') setBottomMargin(value);
  };

  if (!isAdmin) {
    return <FooterRenderer site={site} />;
  }

  return (
    <div className="relative">
      {/* Admin Controls Toggle Button */}
      <div className="absolute top-0 right-0 z-50">
        <button
          onClick={() => setShowControls(!showControls)}
          className="bg-yellow-400 text-black px-3 py-2 rounded-t-lg text-sm font-medium flex items-center gap-2 shadow-lg"
        >
          <FaCog /> {showControls ? "Hide" : "Edit"} Footer
        </button>
      </div>

      {/* Controls Panel */}
      {showControls && (
        <div className="bg-white border-2 border-yellow-400 rounded-lg p-4 mb-4 shadow-lg z-40 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Logo Scale */}
            {footer.showLogo && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Logo Scale: {footer.logoScale || 100}%
                </label>
                <input
                  type="range"
                  min="50"
                  max="200"
                  step="5"
                  value={footer.logoScale || 100}
                  onChange={(e) => updateLogoScale(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            )}

            {/* Background Color */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Background Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={footer.backgroundColor || "#1f2937"}
                  onChange={(e) => handleUpdate({ ...footer, backgroundColor: e.target.value })}
                  className="h-10 w-20 border border-gray-300 rounded"
                />
                <input
                  type="text"
                  value={footer.backgroundColor || "#1f2937"}
                  onChange={(e) => handleUpdate({ ...footer, backgroundColor: e.target.value })}
                  className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                />
              </div>
            </div>

            {/* Text Color */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Text Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={footer.textColor || "#ffffff"}
                  onChange={(e) => handleUpdate({ ...footer, textColor: e.target.value })}
                  className="h-10 w-20 border border-gray-300 rounded"
                />
                <input
                  type="text"
                  value={footer.textColor || "#ffffff"}
                  onChange={(e) => handleUpdate({ ...footer, textColor: e.target.value })}
                  className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                />
              </div>
            </div>

            {/* Column Gap */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Column Gap: {columnGap * 4}px
              </label>
              <input
                type="range"
                min="2"
                max="16"
                value={columnGap}
                onChange={(e) => updateSpacing('columnGap', Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Top Padding */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Top Padding: {topPadding * 4}px
              </label>
              <input
                type="range"
                min="4"
                max="32"
                value={topPadding}
                onChange={(e) => updateSpacing('topPadding', Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Bottom Padding */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Bottom Padding: {bottomPadding * 4}px
              </label>
              <input
                type="range"
                min="4"
                max="32"
                value={bottomPadding}
                onChange={(e) => updateSpacing('bottomPadding', Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Bottom Margin */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Bottom Margin: {bottomMargin * 4}px
              </label>
              <input
                type="range"
                min="2"
                max="16"
                value={bottomMargin}
                onChange={(e) => updateSpacing('bottomMargin', Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
          {saving && (
            <div className="mt-2 text-sm text-gray-600">Saving...</div>
          )}
        </div>
      )}

      {/* Footer with Drag-and-Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={footer.columns?.map((_, i) => `column-${i}`) || []}
          strategy={horizontalListSortingStrategy}
        >
          <div className="relative">
            {/* Render the footer with drag handles overlaid */}
            <FooterRenderer site={site} />
            
            {/* Drag handles overlay - positioned absolutely over footer columns */}
            {footer.columns && footer.columns.length > 0 && (
              <div className="absolute inset-0 pointer-events-none z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{
                  paddingTop: `${topPadding * 4}px`,
                  paddingBottom: `${bottomPadding * 4}px`,
                }}>
                  <div 
                    className={`grid ${getGridClasses()} items-start w-full justify-items-stretch`}
                    style={{ gap: `${columnGap * 4}px` }}
                  >
                    {/* Empty cell for logo if present */}
                    {hasLogo && <div></div>}
                    
                    {/* Drag handles for each column */}
                    {footer.columns.map((_, columnIndex) => (
                      <div
                        key={columnIndex}
                        className="relative h-full"
                        onMouseEnter={() => setHoveredColumnIndex(columnIndex)}
                        onMouseLeave={() => setHoveredColumnIndex(null)}
                      >
                        <SortableFooterColumn
                          column={footer.columns![columnIndex]}
                          columnIndex={columnIndex}
                          footer={footer}
                          onUpdate={onUpdate}
                          site={site}
                        />
                      </div>
                    ))}
                    
                    {/* Empty cell for contact if present */}
                    {hasContact && <div></div>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
