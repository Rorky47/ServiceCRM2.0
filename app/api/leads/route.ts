import { NextRequest, NextResponse } from "next/server";
import { saveLead } from "@/lib/data";
import { Lead } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const lead: Lead = {
      id: Date.now().toString(),
      siteSlug: data.siteSlug,
      name: data.name,
      email: data.email,
      message: data.message,
      createdAt: new Date().toISOString(),
    };
    await saveLead(lead);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving lead:", error);
    return NextResponse.json({ error: "Failed to save lead" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const siteSlug = searchParams.get("siteSlug");
    if (!siteSlug) {
      return NextResponse.json({ error: "siteSlug required" }, { status: 400 });
    }
    const { getLeads } = await import("@/lib/data");
    const leads = await getLeads(siteSlug);
    return NextResponse.json(leads);
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}

