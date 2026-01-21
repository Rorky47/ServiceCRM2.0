import { NextRequest, NextResponse } from "next/server";
import { updateSiteSlug } from "@/lib/site-slug-update";
import { getSite } from "@/lib/data";

export async function POST(request: NextRequest) {
  try {
    const { oldSlug, newSlug } = await request.json();

    if (!oldSlug || !newSlug) {
      return NextResponse.json(
        { error: "oldSlug and newSlug are required" },
        { status: 400 }
      );
    }

    // Validate old slug exists
    const site = await getSite(oldSlug);
    if (!site) {
      return NextResponse.json(
        { error: "Site not found" },
        { status: 404 }
      );
    }

    // Validate new slug format
    if (oldSlug === newSlug) {
      return NextResponse.json(
        { error: "New slug must be different from current slug" },
        { status: 400 }
      );
    }

    // Update the slug
    await updateSiteSlug(oldSlug, newSlug);

    return NextResponse.json({ success: true, newSlug });
  } catch (error: any) {
    console.error("Error updating site slug:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update site slug" },
      { status: 500 }
    );
  }
}

