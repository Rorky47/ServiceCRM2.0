"use client";

import { useState } from "react";

interface MediaPageProps {
  params: { slug: string };
}

export default function MediaPage({ params }: MediaPageProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
        setUploadedImages([...uploadedImages, data.url]);
        alert("Image uploaded successfully!");
      } else {
        alert("Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleUrlUpload = async (url: string) => {
    if (!url.trim()) return;

    setUploadedImages([...uploadedImages, url]);
    alert("Image URL added!");
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
        <p className="mt-2 text-sm text-gray-600">Manage images and media files</p>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Upload Image</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload File</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {uploading && <p className="text-sm text-gray-500 mt-2">Uploading...</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Or Enter Image URL</label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="https://example.com/image.jpg"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleUrlUpload((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = "";
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                  if (input) {
                    handleUrlUpload(input.value);
                    input.value = "";
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add URL
              </button>
            </div>
          </div>
        </div>
      </div>

      {uploadedImages.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Uploads</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {uploadedImages.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(url);
                      alert("URL copied to clipboard!");
                    }}
                    className="opacity-0 group-hover:opacity-100 text-white text-sm px-2 py-1 bg-blue-600 rounded"
                  >
                    Copy URL
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6 mt-6">
        <h2 className="text-lg font-semibold mb-4">Usage Instructions</h2>
        <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
          <li>Upload images using the file uploader or paste image URLs</li>
          <li>Click on any uploaded image to copy its URL</li>
          <li>Use the copied URL in section image fields</li>
          <li>Images are stored in Cloudinary (or as base64 if Cloudinary is not configured)</li>
        </ul>
      </div>
    </div>
  );
}

