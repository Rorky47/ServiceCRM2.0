import { NextRequest, NextResponse } from "next/server";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Use JPEG, PNG, or WebP." },
        { status: 400 }
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Max 5 MB." },
        { status: 400 }
      );
    }

    // For MVP, we'll use a simple approach: convert to base64 and use a placeholder
    // In production, you'd upload to Cloudinary here
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");

    // For now, return a placeholder URL. Replace with actual Cloudinary upload
    // You'll need to set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

    if (!cloudName) {
      // Fallback: return a data URL for MVP
      const mimeType = file.type || "image/jpeg";
      return NextResponse.json({
        url: `data:${mimeType};base64,${base64}`,
      });
    }

    // Actual Cloudinary upload would go here
    // For MVP speed, we'll use the data URL approach above
    return NextResponse.json({
      url: `data:${file.type};base64,${base64}`,
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}
