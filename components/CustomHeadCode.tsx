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
          const scriptSrc = element.getAttribute("src");
          const scriptType = element.getAttribute("type");
          const scriptText = element.textContent || element.innerHTML;
          
          // Skip scripts with module type or that contain export statements (ES6 modules)
          if (scriptType === "module" || (scriptText && /^\s*export\s/.test(scriptText))) {
            console.warn("Skipping ES6 module script injection:", scriptSrc || "inline script");
            return; // Skip this script
          }
          
          if (scriptSrc) {
            script.src = scriptSrc;
          }
          if (scriptText) {
            script.textContent = scriptText;
          }
          
          // Set type - default to text/javascript for inline scripts
          if (scriptType && scriptType !== "module") {
            script.type = scriptType;
          } else if (!scriptType) {
            script.type = "text/javascript";
          } else {
            // Skip module scripts
            return;
          }
          
          // Copy other attributes (except src, type, and textContent)
          Array.from(element.attributes).forEach((attr) => {
            if (attr.name !== "src" && attr.name !== "type") {
              script.setAttribute(attr.name, attr.value);
            }
          });
          
          // Check if script already exists
          const existingScript = scriptSrc 
            ? document.querySelector(`script[src="${scriptSrc}"]`)
            : document.querySelector(`script[type="${script.type}"]`);
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

