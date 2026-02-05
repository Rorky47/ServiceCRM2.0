import { NextRequest, NextResponse } from "next/server";
import { getSite, saveSite } from "@/lib/data";
import { Site } from "@/types";
import { handleApiError } from "@/lib/api-errors";
import { verifyApiKey } from "@/lib/api-auth";

function validateSite(body: unknown): body is Site {
  return (
    typeof body === "object" &&
    body !== null &&
    "slug" in body &&
    typeof (body as Site).slug === "string" &&
    (body as Site).slug.length > 0 &&
    "name" in body &&
    typeof (body as Site).name === "string" &&
    (body as Site).name.length > 0
  );
}

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
    const { status, message } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    verifyApiKey(request);
    const body = await request.json();
    if (!validateSite(body)) {
      return NextResponse.json(
        { error: "Missing or invalid fields: slug and name are required" },
        { status: 400 }
      );
    }
    const site = body as Site;
    await saveSite(site);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "API key not configured") {
      return NextResponse.json({ error: "API key not configured" }, { status: 503 });
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error saving site:", error);
    const { status, message } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
