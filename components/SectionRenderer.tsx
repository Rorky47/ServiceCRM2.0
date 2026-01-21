"use client";

import { Section } from "@/types";
import HeroSection from "./sections/HeroSection";
import ServicesSection from "./sections/ServicesSection";
import TextImageSection from "./sections/TextImageSection";
import ContactSection from "./sections/ContactSection";

interface SectionRendererProps {
  section: Section;
  isAdmin: boolean;
  onUpdate: (section: Section) => void;
  siteSlug: string;
}

export default function SectionRenderer({ section, isAdmin, onUpdate, siteSlug }: SectionRendererProps) {
  switch (section.type) {
    case "hero":
      return <HeroSection section={section} isAdmin={isAdmin} onUpdate={onUpdate} siteSlug={siteSlug} />;
    case "services":
      return <ServicesSection section={section} isAdmin={isAdmin} onUpdate={onUpdate} siteSlug={siteSlug} />;
    case "textImage":
      return <TextImageSection section={section} isAdmin={isAdmin} onUpdate={onUpdate} siteSlug={siteSlug} />;
    case "contact":
      return <ContactSection section={section} isAdmin={isAdmin} onUpdate={onUpdate} siteSlug={siteSlug} />;
    default:
      return null;
  }
}

