"use client";

import { useEffect } from "react";

/**
 * Suppresses known harmless console errors that don't affect functionality:
 * - Chrome extension script errors
 * - React removeChild errors from hydration
 * 
 * Note: Only suppresses errors in production or when explicitly enabled
 */
export default function ErrorSuppressor() {
  useEffect(() => {
    // Only suppress in production to avoid hiding real errors during development
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    // Store original error handlers
    const originalError = console.error;

    // Filter out known harmless errors
    console.error = (...args: any[]) => {
      const errorString = args.join(" ");
      
      // Suppress chrome-extension errors (browser extensions injecting scripts)
      if (errorString.includes("chrome-extension://") || 
          errorString.includes("moz-extension://") ||
          errorString.includes("safari-extension://")) {
        return; // Silently ignore extension errors
      }
      
      // Suppress React removeChild errors (harmless hydration mismatches)
      // Only suppress if it's clearly a null reference from React internals
      if (errorString.includes("removeChild") && 
          errorString.includes("null") &&
          (errorString.includes("fd9d1056") || errorString.includes("React"))) {
        return; // Silently ignore React internal removeChild errors
      }
      
      // Suppress ES6 module syntax errors from extensions
      if (errorString.includes("Unexpected token 'export'") && 
          (errorString.includes("extension://") || errorString.includes("webpage_content_reporter"))) {
        return; // Silently ignore extension module errors
      }
      
      // Call original error handler for other errors
      originalError.apply(console, args);
    };

    // Cleanup on unmount
    return () => {
      console.error = originalError;
    };
  }, []);

  return null;
}

