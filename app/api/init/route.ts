import { NextRequest, NextResponse } from "next/server";
import { Site, Page } from "@/types";
import { saveSite, savePage } from "@/lib/data";

async function initData() {
  // If using database, tables should already be created
  // If using JSON files, create directories
  if (!process.env.DATABASE_URL) {
    const fs = require("fs/promises");
    const path = require("path");
    const DATA_DIR = path.join(process.cwd(), "data");
    await fs.mkdir(path.join(DATA_DIR, "sites"), { recursive: true });
    await fs.mkdir(path.join(DATA_DIR, "pages"), { recursive: true });
    await fs.mkdir(path.join(DATA_DIR, "leads"), { recursive: true });
  }

  // Site 1: Plumber
  const plumberSite: Site = {
    id: "1",
    slug: "plumber",
    name: "ABC Plumbing",
    theme: {
      primaryColor: "#0066cc",
      font: "system-ui",
    },
  };

  const plumberPage: Page = {
    siteSlug: "plumber",
    slug: "home",
    sections: [
      {
        id: "1",
        type: "hero",
        content: {
          headline: "Expert Plumbing Services",
          subheadline: "24/7 Emergency Service Available",
          image: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=1920",
          ctaButton: {
            text: "Get Free Quote",
            link: "#contact",
          },
        },
      },
      {
        id: "2",
        type: "services",
        content: {
          title: "Our Services",
          items: [
            {
              title: "Emergency Repairs",
              description: "24/7 emergency plumbing services available",
              image: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400",
              button: {
                text: "Learn More",
                link: "/service/emergency-repairs",
              },
            },
            {
              title: "Drain Cleaning",
              description: "Professional drain cleaning and unclogging services",
              image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400",
              button: {
                text: "Get Quote",
                link: "/service/drain-cleaning",
              },
            },
            {
              title: "Water Heater Installation",
              description: "Expert water heater installation and repair",
            },
            {
              title: "Pipe Repair & Replacement",
              description: "Complete pipe repair and replacement services",
            },
            {
              title: "Leak Detection",
              description: "Advanced leak detection technology",
            },
            {
              title: "Bathroom Remodeling",
              description: "Full bathroom remodeling and renovation",
            },
          ],
        },
      },
      {
        id: "3",
        type: "textImage",
        content: {
          title: "Why Choose Us?",
          text: "With over 20 years of experience, we provide reliable and professional plumbing services. Our licensed plumbers are available 24/7 to handle any emergency. We stand behind our work with a 100% satisfaction guarantee.",
          image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800",
        },
      },
      {
        id: "4",
        type: "contact",
        content: {
          title: "Get In Touch",
          description: "Contact us today for a free estimate!",
        },
      },
    ],
  };

  // Site 2: Electrician
  const electricianSite: Site = {
    id: "2",
    slug: "electrician",
    name: "XYZ Electrical",
    theme: {
      primaryColor: "#ff6600",
      font: "system-ui",
    },
  };

  const electricianPage: Page = {
    siteSlug: "electrician",
    slug: "home",
    sections: [
      {
        id: "1",
        type: "hero",
        content: {
          headline: "Professional Electrical Services",
          subheadline: "Licensed & Insured Electricians",
          image: "https://images.unsplash.com/photo-1621905252472-7af326b6f5de?w=1920",
          ctaButton: {
            text: "Schedule Service",
            link: "#contact",
          },
        },
      },
      {
        id: "2",
        type: "services",
        content: {
          title: "What We Do",
          items: [
            {
              title: "Electrical Repairs",
              description: "Fast and reliable electrical repair services",
              image: "https://images.unsplash.com/photo-1621905252472-7af326b6f5de?w=400",
              button: {
                text: "Schedule Service",
                link: "/service/electrical-repairs",
              },
            },
            {
              title: "Panel Upgrades",
              description: "Electrical panel upgrades for safety and efficiency",
            },
            {
              title: "Lighting Installation",
              description: "Professional indoor and outdoor lighting installation",
            },
            {
              title: "Outlet & Switch Installation",
              description: "Safe outlet and switch installation and repair",
            },
            {
              title: "Wiring & Rewiring",
              description: "Complete home wiring and rewiring services",
            },
            {
              title: "Generator Installation",
              description: "Backup generator installation and maintenance",
            },
          ],
        },
      },
      {
        id: "3",
        type: "textImage",
        content: {
          title: "Trusted Electricians",
          text: "We've been serving the community for 15 years with quality electrical work. All our electricians are licensed, insured, and committed to safety. We offer competitive pricing and guarantee our workmanship.",
          image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800",
        },
      },
      {
        id: "4",
        type: "contact",
        content: {
          title: "Contact Us",
          description: "Call us for all your electrical needs!",
        },
      },
    ],
  };

  // Save sites (works with both database and JSON files)
  await saveSite(plumberSite);
  await saveSite(electricianSite);

  // Save pages (works with both database and JSON files)
  await savePage(plumberPage);
  await savePage(electricianPage);

  return { success: true, message: "Sample data initialized!" };
}

export async function GET(request: NextRequest) {
  try {
    // Check if data already exists
    const { getSite } = await import("@/lib/data");
    const existingSite = await getSite("plumber");
    if (existingSite) {
      return NextResponse.json({
        success: false,
        message: "Data already initialized. Sites exist. Use POST to force re-initialization.",
      });
    }

    const result = await initData();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error initializing data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to initialize data",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Allow force re-initialization via POST
  try {
    const result = await initData();
    return NextResponse.json({
      ...result,
      message: "Data initialized (forced)",
    });
  } catch (error) {
    console.error("Error initializing data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to initialize data",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

