"use client";

import { useEffect } from "react";

interface CustomHeadCodeProps {
  headCode?: string;
  favicon?: string;
}

export default function CustomHeadCode({ headCode, favicon }: CustomHeadCodeProps) {
  useEffect(() => {
    // Inject favicon if provided
    if (favicon) {
      // Remove existing favicon links
      const existingFavicons = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]');
      existingFavicons.forEach((link) => link.remove());

      // Add new favicon
      const link = document.createElement("link");
      link.rel = "icon";
      link.type = favicon.startsWith("data:") ? favicon.split(";")[0].split(":")[1] : "image/x-icon";
      link.href = favicon;
      document.head.appendChild(link);

      // Also add as shortcut icon
      const shortcutLink = document.createElement("link");
      shortcutLink.rel = "shortcut icon";
      shortcutLink.href = favicon;
      document.head.appendChild(shortcutLink);

      // Add apple touch icon
      const appleLink = document.createElement("link");
      appleLink.rel = "apple-touch-icon";
      appleLink.href = favicon;
      document.head.appendChild(appleLink);
    }

    // Inject custom head code
    if (headCode) {
      // Create a temporary container to parse the HTML
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = headCode;

      // Extract and inject each element
      const elements = tempDiv.querySelectorAll("script, link, meta, style, title");
      elements.forEach((element) => {
        // Clone the element to avoid issues
        const clonedElement = element.cloneNode(true) as HTMLElement;
        
        // For scripts, we need special handling
        if (element.tagName === "SCRIPT") {
          const script = document.createElement("script");
          if (element.getAttribute("src")) {
            script.src = element.getAttribute("src") || "";
          }
          if (element.textContent) {
            script.textContent = element.textContent;
          }
          const scriptType = element.getAttribute("type");
          if (scriptType) {
            script.type = scriptType;
          } else {
            // Default to text/javascript for inline scripts to avoid module syntax errors
            script.type = "text/javascript";
          }
          // Copy other attributes
          Array.from(element.attributes).forEach((attr) => {
            if (attr.name !== "src" && attr.name !== "type" && attr.name !== "textContent") {
              script.setAttribute(attr.name, attr.value);
            }
          });
          // Check if script already exists
          const existingScript = script.src 
            ? document.querySelector(`script[src="${script.src}"]`)
            : null;
          if (!existingScript) {
            document.head.appendChild(script);
          }
        } else {
          // Check if element already exists
          const existing = document.querySelector(
            `${element.tagName.toLowerCase()}${element.getAttribute("id") ? `[id="${element.getAttribute("id")}"]` : ""}${element.getAttribute("rel") ? `[rel="${element.getAttribute("rel")}"]` : ""}`
          );
          if (!existing) {
            document.head.appendChild(clonedElement);
          }
        }
      });
    }

    // Cleanup function
    return () => {
      // Note: We don't remove injected elements on cleanup to avoid flickering
      // If needed, you can add cleanup logic here
    };
  }, [headCode, favicon]);

  return null;
}

