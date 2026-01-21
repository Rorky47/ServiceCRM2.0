"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Page } from "@/types";

interface PagesPageProps {
  params: { slug: string };
}

export default function PagesPage({ params }: PagesPageProps) {
  const router = useRouter();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState("");
  const [newPageSlug, setNewPageSlug] = useState("");

  useEffect(() => {
    fetchPages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPages = async () => {
    try {
      const response = await fetch(`/api/pages?siteSlug=${params.slug}`);
      if (response.ok) {
        const data = await response.json();
        setPages(data);
      }
    } catch (error) {
      console.error("Error fetching pages:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleTitleChange = (title: string) => {
    setNewPageTitle(title);
    if (!newPageSlug || newPageSlug === generateSlug(newPageTitle)) {
      setNewPageSlug(generateSlug(title));
    }
  };

  const handleAddPage = async () => {
    if (!newPageTitle.trim() || !newPageSlug.trim()) {
      alert("Please enter a page title");
      return;
    }

    // Validate slug uniqueness
    if (pages.some((p) => p.slug === newPageSlug)) {
      alert("A page with this slug already exists. Please choose a different slug.");
      return;
    }

    try {
      const newPage: Page = {
        siteSlug: params.slug,
        slug: newPageSlug,
        sections: [],
      };

      const response = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPage),
      });

      if (response.ok) {
        setShowAddModal(false);
        setNewPageTitle("");
        setNewPageSlug("");
        fetchPages();
        router.push(`/site/${params.slug}/${newPageSlug}?admin=true`);
      } else {
        alert("Failed to create page");
      }
    } catch (error) {
      console.error("Error creating page:", error);
      alert("Failed to create page");
    }
  };

  const handleDeletePage = async (pageSlug: string) => {
    if (pageSlug === "home") {
      alert("Cannot delete the home page");
      return;
    }

    if (!confirm(`Are you sure you want to delete the page "${pageSlug}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/pages?siteSlug=${params.slug}&pageSlug=${pageSlug}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchPages();
      } else {
        alert("Failed to delete page");
      }
    } catch (error) {
      console.error("Error deleting page:", error);
      alert("Failed to delete page");
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pages</h1>
          <p className="mt-2 text-sm text-gray-600">Manage your site pages</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Add Page
        </button>
      </div>

      {pages.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <p className="text-gray-500 mb-4">No pages yet. Create your first page!</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Create First Page
          </button>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {pages.map((page) => (
              <li key={page.slug} className="px-6 py-4 flex items-center justify-between">
                <div className="flex-1">
                  <Link
                    href={`/site/${params.slug}/${page.slug}?admin=true`}
                    className="text-lg font-medium text-gray-900 hover:text-blue-600"
                  >
                    /{page.slug}
                  </Link>
                  <p className="text-sm text-gray-500">
                    {page.sections.length} section{page.sections.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <Link
                    href={`/site/${params.slug}/${page.slug}?admin=true`}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Edit
                  </Link>
                  {page.slug !== "home" && (
                    <button
                      onClick={() => handleDeletePage(page.slug)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Add Page Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Add New Page</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Page Title
                </label>
                <input
                  type="text"
                  value={newPageTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="About Us"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Page Slug (URL)
                </label>
                <input
                  type="text"
                  value={newPageSlug}
                  onChange={(e) => setNewPageSlug(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="about-us"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL: /site/{params.slug}/{newPageSlug || "..."}
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewPageTitle("");
                  setNewPageSlug("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPage}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Page
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

