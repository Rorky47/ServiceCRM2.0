"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Site {
  id: string;
  slug: string;
  domains: string[];
  name: string;
  theme: {
    primaryColor: string;
    font: string;
    logo?: string;
    favicon?: string;
  };
  seo?: {
    title?: string;
    description?: string;
    keywords?: string;
  };
}

interface SettingsPageProps {
  params: { slug: string };
}

export default function SettingsPage({ params }: SettingsPageProps) {
  const router = useRouter();
  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    primaryColor: "#0066cc",
    font: "system-ui",
    logo: "",
    favicon: "",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    domains: [] as string[],
    newDomain: "",
  });

  useEffect(() => {
    fetchSite();
  }, []);

  const fetchSite = async () => {
    try {
      const response = await fetch(`/api/sites?slug=${params.slug}`);
      if (response.ok) {
        const data = await response.json();
        setSite(data);
        setFormData({
          name: data.name || "",
          primaryColor: data.theme?.primaryColor || "#0066cc",
          font: data.theme?.font || "system-ui",
          logo: data.theme?.logo || "",
          favicon: data.theme?.favicon || "",
          seoTitle: data.seo?.title || "",
          seoDescription: data.seo?.description || "",
          seoKeywords: data.seo?.keywords || "",
          domains: data.domains || [],
          newDomain: "",
        });
      }
    } catch (error) {
      console.error("Error fetching site:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedSite: Site = {
        ...site!,
        name: formData.name,
        domains: formData.domains,
        theme: {
          primaryColor: formData.primaryColor,
          font: formData.font,
          logo: formData.logo || undefined,
          favicon: formData.favicon || undefined,
        },
        seo: {
          title: formData.seoTitle || undefined,
          description: formData.seoDescription || undefined,
          keywords: formData.seoKeywords || undefined,
        },
      };

      const response = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSite),
      });

      if (response.ok) {
        alert("Settings saved successfully!");
        router.refresh();
      } else {
        alert("Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleAddDomain = () => {
    if (formData.newDomain.trim() && !formData.domains.includes(formData.newDomain.trim())) {
      setFormData({
        ...formData,
        domains: [...formData.domains, formData.newDomain.trim()],
        newDomain: "",
      });
    }
  };

  const handleRemoveDomain = (domain: string) => {
    setFormData({
      ...formData,
      domains: formData.domains.filter((d) => d !== domain),
    });
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!site) {
    return <div className="p-8">Site not found</div>;
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Site Settings</h1>
        <p className="mt-2 text-sm text-gray-600">Configure your site appearance and SEO</p>
      </div>

      <div className="space-y-6">
        {/* Basic Settings */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Theme</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="h-10 w-20 border border-gray-300 rounded"
                />
                <input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="#0066cc"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Font Family</label>
              <select
                value={formData.font}
                onChange={(e) => setFormData({ ...formData, font: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="system-ui">System UI</option>
                <option value="Arial">Arial</option>
                <option value="Georgia">Georgia</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
              <input
                type="text"
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="https://example.com/logo.png"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Favicon URL</label>
              <input
                type="text"
                value={formData.favicon}
                onChange={(e) => setFormData({ ...formData, favicon: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="https://example.com/favicon.ico"
              />
            </div>
          </div>
        </div>

        {/* SEO Settings */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">SEO Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
              <input
                type="text"
                value={formData.seoTitle}
                onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Your Site Title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
              <textarea
                value={formData.seoDescription}
                onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                rows={3}
                placeholder="Your site description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Keywords</label>
              <input
                type="text"
                value={formData.seoKeywords}
                onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="keyword1, keyword2, keyword3"
              />
            </div>
          </div>
        </div>

        {/* Domain Settings */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Domains</h2>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={formData.newDomain}
                onChange={(e) => setFormData({ ...formData, newDomain: e.target.value })}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                placeholder="example.com"
                onKeyPress={(e) => e.key === "Enter" && handleAddDomain()}
              />
              <button
                onClick={handleAddDomain}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Domain
              </button>
            </div>
            {formData.domains.length > 0 && (
              <div className="space-y-2">
                {formData.domains.map((domain) => (
                  <div key={domain} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                    <span className="text-sm font-medium">{domain}</span>
                    <button
                      onClick={() => handleRemoveDomain(domain)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500">
              Add domains that should point to this site. Configure DNS CNAME/A records to point to your deployment.
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}

