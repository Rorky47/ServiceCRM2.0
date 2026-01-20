import { NextRequest, NextResponse } from "next/server";
import { savePage } from "@/lib/data";
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

