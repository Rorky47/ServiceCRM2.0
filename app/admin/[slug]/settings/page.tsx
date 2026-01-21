"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Toast from "@/components/Toast";
import HeaderEditor from "@/components/HeaderEditor";
import FooterEditor from "@/components/FooterEditor";
import SocialIcon from "@/components/SocialIcon";
import { Site } from "@/types";

interface SettingsPageProps {
  params: { slug: string };
}

type TabType = "general" | "theme" | "header" | "footer" | "seo" | "domains" | "analytics" | "integrations" | "notifications";

export default function SettingsPage({ params }: SettingsPageProps) {
  const router = useRouter();
  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [socialLinks, setSocialLinks] = useState<Site["socialLinks"]>([]);
  const [newSocialPlatform, setNewSocialPlatform] = useState<"facebook" | "twitter" | "instagram" | "linkedin" | "youtube" | "custom">("facebook");
  const [newSocialUrl, setNewSocialUrl] = useState("");
  const [newSocialLabel, setNewSocialLabel] = useState("");
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
  });
  const [headerData, setHeaderData] = useState<Site["header"]>({
    showLogo: false,
    showGetQuoteButton: false,
  });
  const [footerData, setFooterData] = useState<Site["footer"]>({
    showLogo: false,
  });

  useEffect(() => {
    fetchSite();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
  };

  // Helper function to remove undefined values from objects
  const removeUndefined = (obj: any): any => {
    if (obj === null || obj === undefined) {
      return undefined;
    }
    if (Array.isArray(obj)) {
      return obj.length > 0 ? obj.map(removeUndefined).filter(item => item !== undefined) : undefined;
    }
    if (typeof obj === 'object') {
      const cleaned: any = {};
      for (const key in obj) {
        const value = removeUndefined(obj[key]);
        if (value !== undefined) {
          cleaned[key] = value;
        }
      }
      return Object.keys(cleaned).length > 0 ? cleaned : undefined;
    }
    return obj;
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
        });
        setHeaderData(data.header || { showLogo: false, showGetQuoteButton: false });
        setFooterData(data.footer || { showLogo: false });
        setSocialLinks(data.socialLinks || []);
      }
    } catch (error) {
      console.error("Error fetching site:", error);
      showToast("Failed to load site settings", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File, type: "logo" | "favicon"): Promise<string> => {
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
        showToast(`${type} uploaded successfully`, "success");
        return data.url;
      } else {
        showToast(`Failed to upload ${type}`, "error");
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      showToast(`Failed to upload ${type}`, "error");
      throw error;
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
      // Clean up header/footer data - remove empty arrays and undefined values
      const cleanHeader = headerData ? removeUndefined({
        ...headerData,
        showLogo: headerData.showLogo ?? false,
        showGetQuoteButton: headerData.showGetQuoteButton ?? false,
        navigationLinks: headerData.navigationLinks && headerData.navigationLinks.length > 0 
          ? headerData.navigationLinks 
          : undefined,
        phoneNumber: headerData.phoneNumber || undefined,
        getQuoteButtonText: headerData.getQuoteButtonText || undefined,
        getQuoteButtonLink: headerData.getQuoteButtonLink || undefined,
        backgroundColor: headerData.backgroundColor || undefined,
        textColor: headerData.textColor || undefined,
        logo: headerData.logo || undefined,
        // Don't include socialLinks - use shared social links instead
      }) : undefined;

      const cleanFooter = footerData ? removeUndefined({
        ...footerData,
        showLogo: footerData.showLogo ?? false,
        copyrightText: footerData.copyrightText || undefined,
        columns: footerData.columns && footerData.columns.length > 0 
          ? footerData.columns
              .map(col => ({
                title: col.title,
                links: col.links && col.links.length > 0 ? col.links : undefined,
              }))
              .filter(col => col.title.trim() || col.links)
          : undefined,
        backgroundColor: footerData.backgroundColor || undefined,
        textColor: footerData.textColor || undefined,
        logo: footerData.logo || undefined,
        // Don't include socialLinks - use shared social links instead
      }) : undefined;

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
        socialLinks: (socialLinks && socialLinks.length > 0) ? socialLinks : undefined,
        header: cleanHeader,
        footer: cleanFooter,
      };

      const finalSite: Site = removeUndefined(updatedSite) as Site;

      const response = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalSite),
      });

      if (response.ok) {
        showToast("Settings saved successfully!", "success");
        router.refresh();
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("Failed to save settings:", errorData);
        showToast(errorData.error || "Failed to save settings", "error");
      }
    } catch (error: any) {
      console.error("Error saving settings:", error);
      showToast(error?.message || "Failed to save settings", "error");
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
    { id: "header", label: "Header", icon: "📋" },
    { id: "footer", label: "Footer", icon: "📄" },
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
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={site.slug}
                    disabled
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 text-gray-500"
                  />
                  <button
                    onClick={async () => {
                      const newSlug = prompt(
                        `Enter new slug for "${site.slug}":\n\nNote: This will update all pages, leads, and user references.`,
                        site.slug
                      );
                      if (!newSlug || newSlug === site.slug) return;

                      // Validate slug format
                      if (!/^[a-zA-Z0-9_-]+$/.test(newSlug)) {
                        showToast("Slug can only contain letters, numbers, hyphens, and underscores", "error");
                        return;
                      }

                      if (!confirm(`Are you sure you want to change the slug from "${site.slug}" to "${newSlug}"?\n\nThis will update:\n- All pages\n- All leads\n- User permissions\n\nThis action cannot be easily undone.`)) {
                        return;
                      }

                      try {
                        const response = await fetch("/api/sites/update-slug", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ oldSlug: site.slug, newSlug }),
                        });

                        if (response.ok) {
                          showToast("Site slug updated successfully! Redirecting...", "success");
                          // Redirect to new slug after a short delay
                          setTimeout(() => {
                            router.push(`/admin/${newSlug}/settings`);
                          }, 1000);
                        } else {
                          const data = await response.json();
                          showToast(data.error || "Failed to update slug", "error");
                        }
                      } catch (error) {
                        console.error("Error updating slug:", error);
                        showToast("Failed to update slug", "error");
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                  >
                    Change Slug
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Site slug is used in URLs. Changing it will update all related pages and leads.
                </p>
              </div>

              {/* Social Links */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium mb-4">Social Media Links</h3>
                <p className="text-sm text-gray-600 mb-4">
                  These links will be shared between the header and footer. You can override them individually in the Header and Footer tabs if needed.
                </p>
                <div className="space-y-3">
                  {(socialLinks || []).map((link, index) => (
                    <div key={index} className="flex items-center space-x-2 bg-gray-50 p-3 rounded">
                      <SocialIcon platform={link.platform} size="md" className="text-gray-600" />
                      <span className="flex-1 font-medium capitalize">{link.platform}</span>
                      {link.label && <span className="text-sm text-gray-500">({link.label})</span>}
                      <span className="text-sm text-gray-500 truncate max-w-xs">{link.url}</span>
                      <button
                        onClick={() => {
                          const newLinks = [...(socialLinks || [])];
                          newLinks.splice(index, 1);
                          setSocialLinks(newLinks);
                        }}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <select
                        value={newSocialPlatform}
                        onChange={(e) => setNewSocialPlatform(e.target.value as any)}
                        className="border border-gray-300 rounded-lg px-3 py-2"
                      >
                        <option value="facebook">Facebook</option>
                        <option value="twitter">Twitter</option>
                        <option value="instagram">Instagram</option>
                        <option value="linkedin">LinkedIn</option>
                        <option value="youtube">YouTube</option>
                        <option value="custom">Custom</option>
                      </select>
                      <input
                        type="text"
                        value={newSocialUrl}
                        onChange={(e) => setNewSocialUrl(e.target.value)}
                        placeholder="https://facebook.com/yourpage"
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && newSocialUrl.trim()) {
                            setSocialLinks([
                              ...(socialLinks || []),
                              {
                                platform: newSocialPlatform,
                                url: newSocialUrl.trim(),
                                label: newSocialLabel || undefined,
                              },
                            ]);
                            setNewSocialUrl("");
                            setNewSocialLabel("");
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          if (newSocialUrl.trim()) {
                            setSocialLinks([
                              ...(socialLinks || []),
                              {
                                platform: newSocialPlatform,
                                url: newSocialUrl.trim(),
                                label: newSocialLabel || undefined,
                              },
                            ]);
                            setNewSocialUrl("");
                            setNewSocialLabel("");
                          }
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Add
                      </button>
                    </div>
                    {newSocialPlatform === "custom" && (
                      <input
                        type="text"
                        value={newSocialLabel}
                        onChange={(e) => setNewSocialLabel(e.target.value)}
                        placeholder="Custom label (optional)"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    )}
                  </div>
                </div>
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
                      {formData.logo.startsWith('data:') ? (
                        <img src={formData.logo} alt="Logo preview" className="h-16 w-auto object-contain border border-gray-200 rounded" />
                      ) : (
                        <Image src={formData.logo} alt="Logo preview" width={64} height={64} className="h-16 w-auto object-contain border border-gray-200 rounded" unoptimized />
                      )}
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
                      {formData.favicon.startsWith('data:') ? (
                        <img src={formData.favicon} alt="Favicon preview" className="h-8 w-8 object-contain border border-gray-200 rounded" />
                      ) : (
                        <Image src={formData.favicon} alt="Favicon preview" width={32} height={32} className="h-8 w-8 object-contain border border-gray-200 rounded" unoptimized />
                      )}
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

        {/* Header Tab */}
        {activeTab === "header" && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Header / Navigation Bar</h2>
            <HeaderEditor
              header={headerData || { showLogo: false, showGetQuoteButton: false }}
              onChange={setHeaderData}
              themeLogo={formData.logo}
            />
          </div>
        )}

        {/* Footer Tab */}
        {activeTab === "footer" && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Footer</h2>
            <FooterEditor
              footer={footerData || { showLogo: false }}
              onChange={setFooterData}
              themeLogo={formData.logo}
            />
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

