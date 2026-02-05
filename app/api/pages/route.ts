import { NextRequest, NextResponse } from "next/server";
import { savePage, getAllPages, deletePage } from "@/lib/data";
import { Page } from "@/types";
import { handleApiError } from "@/lib/api-errors";
import { verifyApiKey } from "@/lib/api-auth";

function validatePage(body: unknown): body is Page {
  return (
    typeof body === "object" &&
    body !== null &&
    "siteSlug" in body &&
    typeof (body as Page).siteSlug === "string" &&
    (body as Page).siteSlug.length > 0 &&
    "slug" in body &&
    typeof (body as Page).slug === "string" &&
    (body as Page).slug.length > 0 &&
    "sections" in body &&
    Array.isArray((body as Page).sections)
  );
}

export async function POST(request: NextRequest) {
  try {
    verifyApiKey(request);
    const body = await request.json();
    if (!validatePage(body)) {
      return NextResponse.json(
        { error: "Missing or invalid fields: siteSlug, slug, and sections (array) are required" },
        { status: 400 }
      );
    }
    const page = body as Page;
    await savePage(page);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "API key not configured") {
      return NextResponse.json({ error: "API key not configured" }, { status: 503 });
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error saving page:", error);
    const { status, message } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
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
    const { status, message } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    verifyApiKey(request);
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
    if (error instanceof Error && error.message === "API key not configured") {
      return NextResponse.json({ error: "API key not configured" }, { status: 503 });
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error deleting page:", error);
    const { status, message } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
