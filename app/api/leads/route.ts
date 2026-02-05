import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { saveLead } from "@/lib/data";
import { Lead } from "@/types";

const LeadSchema = z.object({
  siteSlug: z.string().regex(/^[a-z0-9-]+$/, "siteSlug must be lowercase letters, numbers, and hyphens only"),
  name: z.string().min(1, "Name is required").max(255),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters").max(10000),
});

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const validated = LeadSchema.parse(data);

    const lead: Lead = {
      id: Date.now().toString(),
      siteSlug: validated.siteSlug,
      name: validated.name,
      email: validated.email,
      message: validated.message,
      createdAt: new Date().toISOString(),
    };
    await saveLead(lead);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      const message = firstError?.message ?? "Validation failed";
      return NextResponse.json({ error: message }, { status: 400 });
    }
    console.error("Error saving lead:", error);
    return NextResponse.json({ error: "Failed to save lead" }, { status: 500 });
  }
}

const MAX_LEADS_LIMIT = 100;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const siteSlug = searchParams.get("siteSlug");
    if (!siteSlug) {
      return NextResponse.json({ error: "siteSlug required" }, { status: 400 });
    }
    const limitParam = searchParams.get("limit");
    const offsetParam = searchParams.get("offset");
    const limit = limitParam != null ? Math.min(Math.max(1, parseInt(limitParam, 10) || 50), MAX_LEADS_LIMIT) : 50;
    const offset = offsetParam != null ? Math.max(0, parseInt(offsetParam, 10) || 0) : 0;
    const { getLeads } = await import("@/lib/data");
    const leads = await getLeads(siteSlug, limit, offset);
    return NextResponse.json(leads);
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}
