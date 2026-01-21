"use client";

import { useEffect, useRef } from "react";

interface CustomHeadCodeProps {
  headCode?: string;
  favicon?: string;
}

export default function CustomHeadCode({ headCode, favicon }: CustomHeadCodeProps) {
  const injectedRef = useRef<Set<string>>(new Set());
  const faviconRef = useRef<string | null>(null);

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    // Inject favicon if provided and it's different from what we've already injected
    if (favicon && favicon !== faviconRef.current) {
      try {
        // Remove only the favicons we've injected, not all favicons
        // This prevents interfering with React's DOM management
        const existingFavicons = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]');
        existingFavicons.forEach((link) => {
          try {
            // Only remove if it's one we injected (has data-injected attribute)
            if (link.hasAttribute("data-injected")) {
              link.remove();
            }
          } catch (error) {
            // Element may have already been removed, ignore silently
          }
        });

        // Add new favicon with marker
        const link = document.createElement("link");
        link.rel = "icon";
        link.type = favicon.startsWith("data:") ? favicon.split(";")[0].split(":")[1] : "image/x-icon";
        link.href = favicon;
        link.setAttribute("data-injected", "true");
        document.head.appendChild(link);

        // Also add as shortcut icon
        const shortcutLink = document.createElement("link");
        shortcutLink.rel = "shortcut icon";
        shortcutLink.href = favicon;
        shortcutLink.setAttribute("data-injected", "true");
        document.head.appendChild(shortcutLink);

        // Add apple touch icon
        const appleLink = document.createElement("link");
        appleLink.rel = "apple-touch-icon";
        appleLink.href = favicon;
        appleLink.setAttribute("data-injected", "true");
        document.head.appendChild(appleLink);

        faviconRef.current = favicon;
      } catch (error) {
        // Ignore errors when injecting favicons
        console.warn("Error injecting favicon:", error);
      }
    }

    // Inject custom head code (only once per unique headCode)
    if (headCode && !injectedRef.current.has(headCode)) {
      try {
        // Create a temporary container to parse the HTML
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = headCode;

        // Extract and inject each element
        const elements = tempDiv.querySelectorAll("script, link, meta, style, title");
        elements.forEach((element) => {
          try {
            // For scripts, we need special handling
            if (element.tagName === "SCRIPT") {
              const scriptSrc = element.getAttribute("src");
              const scriptType = element.getAttribute("type");
              const scriptText = element.textContent || element.innerHTML;
              
              // Skip scripts with module type or that contain export statements (ES6 modules)
              // Also skip chrome-extension scripts and any extension scripts
              if (
                scriptType === "module" || 
                (scriptText && /^\s*export\s/.test(scriptText)) ||
                (scriptSrc && (
                  scriptSrc.startsWith("chrome-extension://") ||
                  scriptSrc.startsWith("moz-extension://") ||
                  scriptSrc.startsWith("safari-extension://") ||
                  scriptSrc.includes("extension://") ||
                  scriptSrc.includes("webpage_content_reporter")
                ))
              ) {
                // Silently skip extension scripts
                return; // Skip this script
              }
              
              // Check if script already exists before injecting
              const existingScript = scriptSrc 
                ? document.querySelector(`script[src="${scriptSrc}"][data-injected="true"]`)
                : document.querySelector(`script[data-injected="true"]`);
              
              if (!existingScript) {
                const script = document.createElement("script");
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
                }
                
                // Copy other attributes
                Array.from(element.attributes).forEach((attr) => {
                  if (attr.name !== "src" && attr.name !== "type") {
                    script.setAttribute(attr.name, attr.value);
                  }
                });
                
                script.setAttribute("data-injected", "true");
                document.head.appendChild(script);
              }
            } else {
              // For other elements, check if they already exist
              const elementId = element.getAttribute("id");
              const elementRel = element.getAttribute("rel");
              const selector = elementId 
                ? `${element.tagName.toLowerCase()}[id="${elementId}"]`
                : elementRel
                ? `${element.tagName.toLowerCase()}[rel="${elementRel}"]`
                : null;
              
              const existing = selector ? document.querySelector(selector) : null;
              if (!existing) {
                const clonedElement = element.cloneNode(true) as HTMLElement;
                clonedElement.setAttribute("data-injected", "true");
                document.head.appendChild(clonedElement);
              }
            }
          } catch (error) {
            // Silently ignore errors to prevent breaking navigation
            // console.warn("Error injecting element:", error);
          }
        });
        
        // Mark this headCode as injected
        injectedRef.current.add(headCode);
      } catch (error) {
        // Silently ignore parsing errors
        // console.error("Error parsing head code:", error);
      }
    }

    // Cleanup function - don't remove elements on navigation to avoid flickering
    return () => {
      // Elements persist across navigations to maintain state
    };
  }, [headCode, favicon]);

  // Return null - this component doesn't render anything
  // It only manipulates the document head via useEffect
  return null;
}

