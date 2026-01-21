"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Toast from "@/components/Toast";
import { Site } from "@/types";

interface SettingsPageProps {
  params: { slug: string };
}

type TabType = "general" | "theme" | "seo" | "domains" | "analytics" | "integrations" | "notifications";

export default function SettingsPage({ params }: SettingsPageProps) {
  const router = useRouter();
  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
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
    googleAnalyticsId: "",
    googleTagManagerId: "",
    facebookPixelId: "",
    emailNotifications: true,
    leadEmail: "",
    customHeadCode: "",
    customFooterCode: "",
  });

  useEffect(() => {
    fetchSite();
  }, []);

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
  };

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
          googleAnalyticsId: data.analytics?.googleAnalyticsId || "",
          googleTagManagerId: data.analytics?.googleTagManagerId || "",
          facebookPixelId: data.analytics?.facebookPixelId || "",
          emailNotifications: data.notifications?.enabled ?? true,
          leadEmail: data.notifications?.leadEmail || "",
          customHeadCode: data.customCode?.head || "",
          customFooterCode: data.customCode?.footer || "",
        });
      }
    } catch (error) {
      console.error("Error fetching site:", error);
      showToast("Failed to load site settings", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File, type: "logo" | "favicon") => {
    const setUploading = type === "logo" ? setUploadingLogo : setUploadingFavicon;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/cloudinary", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setFormData((prev) => ({
          ...prev,
          [type]: data.url,
        }));
        showToast(`${type === "logo" ? "Logo" : "Favicon"} uploaded successfully`, "success");
      } else {
        showToast(`Failed to upload ${type}`, "error");
      }
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      showToast(`Failed to upload ${type}`, "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showToast("Site name is required", "error");
      return;
    }

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
        analytics: {
          googleAnalyticsId: formData.googleAnalyticsId || undefined,
          googleTagManagerId: formData.googleTagManagerId || undefined,
          facebookPixelId: formData.facebookPixelId || undefined,
        },
        notifications: {
          enabled: formData.emailNotifications,
          leadEmail: formData.leadEmail || undefined,
        },
        customCode: {
          head: formData.customHeadCode || undefined,
          footer: formData.customFooterCode || undefined,
        },
      };

      const response = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSite),
      });

      if (response.ok) {
        showToast("Settings saved successfully!", "success");
        router.refresh();
      } else {
        showToast("Failed to save settings", "error");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      showToast("Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAddDomain = () => {
    const domain = formData.newDomain.trim().toLowerCase();
    if (!domain) {
      showToast("Please enter a domain", "error");
      return;
    }
    
    // Basic domain validation
    const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
    if (!domainRegex.test(domain)) {
      showToast("Please enter a valid domain", "error");
      return;
    }

    if (formData.domains.includes(domain)) {
      showToast("Domain already exists", "error");
      return;
    }

    setFormData({
      ...formData,
      domains: [...formData.domains, domain],
      newDomain: "",
    });
    showToast("Domain added", "success");
  };

  const handleRemoveDomain = (domain: string) => {
    setFormData({
      ...formData,
      domains: formData.domains.filter((d) => d !== domain),
    });
    showToast("Domain removed", "success");
  };

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: "general", label: "General", icon: "⚙️" },
    { id: "theme", label: "Theme", icon: "🎨" },
    { id: "seo", label: "SEO", icon: "🔍" },
    { id: "domains", label: "Domains", icon: "🌐" },
    { id: "analytics", label: "Analytics", icon: "📊" },
    { id: "integrations", label: "Integrations", icon: "🔗" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Site not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Site Settings</h1>
        <p className="mt-2 text-sm text-gray-600">Configure your site settings and preferences</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
              `}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="space-y-6">
        {/* General Tab */}
        {activeTab === "general" && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">General Settings</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="My Service Business"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">The name of your site</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Site Slug</label>
                <input
                  type="text"
                  value={site.slug}
                  disabled
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 text-gray-500"
                />
                <p className="mt-1 text-xs text-gray-500">Site slug cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Custom Head Code</label>
                <textarea
                  value={formData.customHeadCode}
                  onChange={(e) => setFormData({ ...formData, customHeadCode: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder="<!-- Custom code for <head> section -->"
                />
                <p className="mt-1 text-xs text-gray-500">HTML/JavaScript code to inject in the &lt;head&gt; section</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Custom Footer Code</label>
                <textarea
                  value={formData.customFooterCode}
                  onChange={(e) => setFormData({ ...formData, customFooterCode: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder="<!-- Custom code before </body> -->"
                />
                <p className="mt-1 text-xs text-gray-500">HTML/JavaScript code to inject before the closing &lt;/body&gt; tag</p>
              </div>
            </div>
          </div>
        )}

        {/* Theme Tab */}
        {activeTab === "theme" && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Theme Settings</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="h-12 w-20 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="#0066cc"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Primary brand color used throughout the site</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
                <select
                  value={formData.font}
                  onChange={(e) => setFormData({ ...formData, font: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="system-ui">System UI (Default)</option>
                  <option value="Arial">Arial</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Courier New">Courier New</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Verdana">Verdana</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">Font family for the entire site</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
                <div className="space-y-3">
                  {formData.logo && (
                    <div className="flex items-center space-x-4">
                      <img src={formData.logo} alt="Logo preview" className="h-16 w-auto object-contain border border-gray-200 rounded" />
                      <button
                        onClick={() => setFormData({ ...formData, logo: "" })}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <label className="cursor-pointer">
                      <span className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-block">
                        {uploadingLogo ? "Uploading..." : "Upload Logo"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, "logo");
                        }}
                        className="hidden"
                        disabled={uploadingLogo}
                      />
                    </label>
                    <span className="text-sm text-gray-500">or</span>
                    <input
                      type="text"
                      value={formData.logo}
                      onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">Upload an image or enter a URL for your site logo</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Favicon</label>
                <div className="space-y-3">
                  {formData.favicon && (
                    <div className="flex items-center space-x-4">
                      <img src={formData.favicon} alt="Favicon preview" className="h-8 w-8 object-contain border border-gray-200 rounded" />
                      <button
                        onClick={() => setFormData({ ...formData, favicon: "" })}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <label className="cursor-pointer">
                      <span className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-block">
                        {uploadingFavicon ? "Uploading..." : "Upload Favicon"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, "favicon");
                        }}
                        className="hidden"
                        disabled={uploadingFavicon}
                      />
                    </label>
                    <span className="text-sm text-gray-500">or</span>
                    <input
                      type="text"
                      value={formData.favicon}
                      onChange={(e) => setFormData({ ...formData, favicon: e.target.value })}
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com/favicon.ico"
                    />
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">Upload an image or enter a URL for your site favicon (recommended: 32x32px)</p>
              </div>
            </div>
          </div>
        )}

        {/* SEO Tab */}
        {activeTab === "seo" && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">SEO Settings</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
                <input
                  type="text"
                  value={formData.seoTitle}
                  onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Your Site Title"
                  maxLength={60}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {formData.seoTitle.length}/60 characters. Appears in search engine results and browser tabs.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                <textarea
                  value={formData.seoDescription}
                  onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder="Your site description"
                  maxLength={160}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {formData.seoDescription.length}/160 characters. Appears in search engine results.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Keywords</label>
                <input
                  type="text"
                  value={formData.seoKeywords}
                  onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="keyword1, keyword2, keyword3"
                />
                <p className="mt-1 text-xs text-gray-500">Comma-separated keywords (less important for modern SEO)</p>
              </div>
            </div>
          </div>
        )}

        {/* Domains Tab */}
        {activeTab === "domains" && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Domain Settings</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Add Domain</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={formData.newDomain}
                    onChange={(e) => setFormData({ ...formData, newDomain: e.target.value })}
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="example.com"
                    onKeyPress={(e) => e.key === "Enter" && handleAddDomain()}
                  />
                  <button
                    onClick={handleAddDomain}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Domain
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">Add domains that should point to this site</p>
              </div>

              {formData.domains.length > 0 ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Configured Domains</label>
                  <div className="space-y-2">
                    {formData.domains.map((domain) => (
                      <div key={domain} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-900">{domain}</span>
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Active</span>
                        </div>
                        <button
                          onClick={() => handleRemoveDomain(domain)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                  <p className="text-gray-500">No domains configured yet</p>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">Domain Setup Instructions</h3>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Configure DNS CNAME or A records to point to your deployment</li>
                  <li>For CNAME: Point to your deployment domain (e.g., your-app.railway.app)</li>
                  <li>For A records: Point to your server IP address</li>
                  <li>SSL certificates will be automatically provisioned</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Analytics Settings</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Google Analytics ID</label>
                <input
                  type="text"
                  value={formData.googleAnalyticsId}
                  onChange={(e) => setFormData({ ...formData, googleAnalyticsId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="G-XXXXXXXXXX"
                />
                <p className="mt-1 text-xs text-gray-500">Your Google Analytics 4 measurement ID</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Google Tag Manager ID</label>
                <input
                  type="text"
                  value={formData.googleTagManagerId}
                  onChange={(e) => setFormData({ ...formData, googleTagManagerId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="GTM-XXXXXXX"
                />
                <p className="mt-1 text-xs text-gray-500">Your Google Tag Manager container ID</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Facebook Pixel ID</label>
                <input
                  type="text"
                  value={formData.facebookPixelId}
                  onChange={(e) => setFormData({ ...formData, facebookPixelId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="123456789012345"
                />
                <p className="mt-1 text-xs text-gray-500">Your Facebook Pixel ID for tracking conversions</p>
              </div>
            </div>
          </div>
        )}

        {/* Integrations Tab */}
        {activeTab === "integrations" && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Integrations</h2>
            <div className="space-y-6">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                <p className="text-gray-600 mb-4">More integrations coming soon!</p>
                <p className="text-sm text-gray-500">
                  Future integrations may include: Email marketing platforms, CRM systems, Payment processors, and more.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Notification Settings</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Notifications</label>
                  <p className="text-xs text-gray-500">Receive email notifications when new leads are submitted</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.emailNotifications}
                    onChange={(e) => setFormData({ ...formData, emailNotifications: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {formData.emailNotifications && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lead Notification Email</label>
                  <input
                    type="email"
                    value={formData.leadEmail}
                    onChange={(e) => setFormData({ ...formData, leadEmail: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="notifications@example.com"
                  />
                  <p className="mt-1 text-xs text-gray-500">Email address to receive lead notifications</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end space-x-3 bg-white shadow rounded-lg p-4">
          <button
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {saving ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              "Save Settings"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

