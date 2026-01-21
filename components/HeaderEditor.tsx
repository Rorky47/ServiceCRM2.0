"use client";

import { useState } from "react";
import OptimizedImage from "@/components/OptimizedImage";
import LinkInput from "@/components/LinkInput";
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
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface NavigationLink {
  label: string;
  url: string;
}

interface SocialLink {
  platform: "facebook" | "twitter" | "instagram" | "linkedin" | "youtube" | "custom";
  url: string;
  label?: string;
}

interface HeaderData {
  showLogo: boolean;
  logo?: string;
  navigationLinks?: NavigationLink[];
  phoneNumber?: string;
  socialLinks?: SocialLink[];
  showGetQuoteButton: boolean;
  getQuoteButtonText?: string;
  getQuoteButtonLink?: string;
  backgroundColor?: string;
  textColor?: string;
}

interface HeaderEditorProps {
  header: HeaderData;
  onChange: (header: HeaderData) => void;
  themeLogo?: string; // Logo from theme settings
  siteSlug: string; // Site slug for fetching pages
}

export default function HeaderEditor({
  header,
  onChange,
  themeLogo,
  siteSlug,
}: HeaderEditorProps) {
  const [newLinkLabel, setNewLinkLabel] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editUrl, setEditUrl] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const updateHeader = (updates: Partial<HeaderData>) => {
    onChange({ ...header, ...updates });
  };

  const addNavigationLink = () => {
    if (newLinkLabel.trim() && newLinkUrl.trim()) {
      updateHeader({
        navigationLinks: [...(header.navigationLinks || []), { label: newLinkLabel, url: newLinkUrl }],
      });
      setNewLinkLabel("");
      setNewLinkUrl("");
    }
  };

  const removeNavigationLink = (index: number) => {
    const links = [...(header.navigationLinks || [])];
    links.splice(index, 1);
    updateHeader({ navigationLinks: links });
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  const startEditing = (index: number) => {
    const link = header.navigationLinks?.[index];
    if (link) {
      setEditingIndex(index);
      setEditLabel(link.label);
      setEditUrl(link.url);
    }
  };

  const saveEdit = () => {
    if (editingIndex !== null && editLabel.trim() && editUrl.trim()) {
      const links = [...(header.navigationLinks || [])];
      links[editingIndex] = { label: editLabel, url: editUrl };
      updateHeader({ navigationLinks: links });
      setEditingIndex(null);
      setEditLabel("");
      setEditUrl("");
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditLabel("");
    setEditUrl("");
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = header.navigationLinks?.findIndex((_, i) => i.toString() === active.id) ?? -1;
      const newIndex = header.navigationLinks?.findIndex((_, i) => i.toString() === over.id) ?? -1;
      
      if (oldIndex !== -1 && newIndex !== -1 && header.navigationLinks) {
        const newLinks = arrayMove(header.navigationLinks, oldIndex, newIndex);
        updateHeader({ navigationLinks: newLinks });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Logo Settings */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={header.showLogo}
              onChange={(e) => updateHeader({ showLogo: e.target.checked })}
              className="rounded"
            />
            <span className="font-medium">Show Logo</span>
          </label>
        </div>
        {header.showLogo && (
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> The logo from Theme settings will be used by default. You can override it with a custom URL below.
              </p>
            </div>
            {themeLogo && !header.logo && (
              <div className="flex items-center space-x-4 bg-gray-50 p-3 rounded">
                <span className="text-sm text-gray-600">Using theme logo:</span>
                <OptimizedImage
                  src={themeLogo}
                  alt="Theme logo"
                  width={48}
                  height={48}
                  className="h-12 w-auto object-contain"
                  unoptimized
                />
              </div>
            )}
            {header.logo && (
              <div className="flex items-center space-x-4">
                <OptimizedImage
                  src={header.logo}
                  alt="Custom logo preview"
                  width={64}
                  height={64}
                  className="h-16 w-auto object-contain border border-gray-200 rounded"
                  unoptimized
                />
                <button
                  onClick={() => updateHeader({ logo: undefined })}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove Custom Logo (use theme logo)
                </button>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Logo URL (optional - leave empty to use theme logo)
              </label>
              <input
                type="text"
                value={header.logo || ""}
                onChange={(e) => updateHeader({ logo: e.target.value || undefined })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="https://example.com/logo.png or leave empty for theme logo"
              />
            </div>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium mb-4">Navigation Links</h3>
        {header.navigationLinks && header.navigationLinks.length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={header.navigationLinks.map((_, i) => i.toString())}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2 mb-4">
                {header.navigationLinks.map((link, index) => (
                  <SortableNavigationLink
                    key={index}
                    id={index.toString()}
                    link={link}
                    index={index}
                    isEditing={editingIndex === index}
                    editLabel={editLabel}
                    editUrl={editUrl}
                    onEditLabelChange={setEditLabel}
                    onEditUrlChange={setEditUrl}
                    onStartEdit={() => startEditing(index)}
                    onSaveEdit={saveEdit}
                    onCancelEdit={cancelEdit}
                    onRemove={() => removeNavigationLink(index)}
                    siteSlug={siteSlug}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
        <div className="space-y-2">
          <input
            type="text"
            value={newLinkLabel}
            onChange={(e) => setNewLinkLabel(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            placeholder="Link Label"
            onKeyPress={(e) => e.key === "Enter" && addNavigationLink()}
          />
          <LinkInput
            value={newLinkUrl}
            onChange={setNewLinkUrl}
            siteSlug={siteSlug}
            placeholder="/about or https://example.com"
          />
          <button
            onClick={addNavigationLink}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Link
          </button>
        </div>
      </div>

      {/* Phone Number */}
      <div className="border border-gray-200 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
        <input
          type="tel"
          value={header.phoneNumber || ""}
          onChange={(e) => updateHeader({ phoneNumber: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          placeholder="(555) 123-4567"
        />
      </div>

      {/* Social Links Info */}
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <h3 className="font-medium mb-2">Social Media Links</h3>
        <p className="text-sm text-gray-600">
          Social media links are managed in the <strong>General</strong> tab. They will be shared between the header and footer.
        </p>
      </div>

      {/* Get Quote Button */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={header.showGetQuoteButton}
              onChange={(e) => updateHeader({ showGetQuoteButton: e.target.checked })}
              className="rounded"
            />
            <span className="font-medium">Show Get Quote Button</span>
          </label>
        </div>
        {header.showGetQuoteButton && (
          <div className="space-y-3">
            <input
              type="text"
              value={header.getQuoteButtonText || ""}
              onChange={(e) => updateHeader({ getQuoteButtonText: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Get Free Quote"
            />
            <LinkInput
              value={header.getQuoteButtonLink || ""}
              onChange={(url) => updateHeader({ getQuoteButtonLink: url })}
              siteSlug={siteSlug}
              placeholder="#contact or /contact"
            />
          </div>
        )}
      </div>

      {/* Colors */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium mb-4">Colors</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={header.backgroundColor || "#ffffff"}
                onChange={(e) => updateHeader({ backgroundColor: e.target.value })}
                className="h-10 w-20 border border-gray-300 rounded"
              />
              <input
                type="text"
                value={header.backgroundColor || "#ffffff"}
                onChange={(e) => updateHeader({ backgroundColor: e.target.value })}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={header.textColor || "#000000"}
                onChange={(e) => updateHeader({ textColor: e.target.value })}
                className="h-10 w-20 border border-gray-300 rounded"
              />
              <input
                type="text"
                value={header.textColor || "#000000"}
                onChange={(e) => updateHeader({ textColor: e.target.value })}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SortableNavigationLink({
  id,
  link,
  index,
  isEditing,
  editLabel,
  editUrl,
  onEditLabelChange,
  onEditUrlChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onRemove,
  siteSlug,
}: {
  id: string;
  link: NavigationLink;
  index: number;
  isEditing: boolean;
  editLabel: string;
  editUrl: string;
  onEditLabelChange: (value: string) => void;
  onEditUrlChange: (value: string) => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onRemove: () => void;
  siteSlug: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (isEditing) {
    return (
      <div ref={setNodeRef} style={style} className="bg-blue-50 border-2 border-blue-300 rounded-lg p-3 space-y-2">
        <input
          type="text"
          value={editLabel}
          onChange={(e) => onEditLabelChange(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          placeholder="Link Label"
          autoFocus
        />
        <LinkInput
          value={editUrl}
          onChange={onEditUrlChange}
          siteSlug={siteSlug}
          placeholder="/about or https://example.com"
        />
        <div className="flex space-x-2">
          <button
            onClick={onSaveEdit}
            className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
          >
            Save
          </button>
          <button
            onClick={onCancelEdit}
            className="flex-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center space-x-2 bg-gray-50 p-3 rounded border border-gray-200 hover:border-gray-300"
    >
      <button
        {...attributes}
        {...listeners}
        className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
        title="Drag to reorder"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </button>
      <span className="flex-1 font-medium">{link.label}</span>
      <span className="text-sm text-gray-500 truncate max-w-xs">{link.url}</span>
      <button
        onClick={onStartEdit}
        className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1"
        title="Edit"
      >
        Edit
      </button>
      <button
        onClick={onRemove}
        className="text-red-600 hover:text-red-800 text-sm px-2 py-1"
        title="Remove"
      >
        Remove
      </button>
    </div>
  );
}

