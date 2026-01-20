import { NextRequest, NextResponse } from "next/server";
import { savePage, getAllPages, deletePage } from "@/lib/data";
import { Page } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const page: Page = await request.json();
    await savePage(page);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving page:", error);
    return NextResponse.json({ error: "Failed to save page" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const siteSlug = searchParams.get("siteSlug");
    if (!siteSlug) {
      return NextResponse.json({ error: "siteSlug required" }, { status: 400 });
    }
    const pages = await getAllPages(siteSlug);
    return NextResponse.json(pages);
  } catch (error) {
    console.error("Error fetching pages:", error);
    return NextResponse.json({ error: "Failed to fetch pages" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const siteSlug = searchParams.get("siteSlug");
    const pageSlug = searchParams.get("pageSlug");
    
    if (!siteSlug || !pageSlug) {
      return NextResponse.json({ error: "siteSlug and pageSlug required" }, { status: 400 });
    }

    if (pageSlug === "home") {
      return NextResponse.json({ error: "Cannot delete home page" }, { status: 400 });
    }

    await deletePage(siteSlug, pageSlug);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting page:", error);
    return NextResponse.json({ error: "Failed to delete page" }, { status: 500 });
  }
}

