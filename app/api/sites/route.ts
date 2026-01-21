import { NextRequest, NextResponse } from "next/server";
import { getSite, saveSite } from "@/lib/data";
import { Site } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    if (!slug) {
      return NextResponse.json({ error: "slug required" }, { status: 400 });
    }
    const site = await getSite(slug);
    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }
    return NextResponse.json(site);
  } catch (error) {
    console.error("Error fetching site:", error);
    return NextResponse.json({ error: "Failed to fetch site" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const site: Site = await request.json();
    await saveSite(site);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error saving site:", error);
    const errorMessage = error?.message || error?.toString() || "Failed to save site";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

