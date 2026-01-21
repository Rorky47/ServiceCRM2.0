/**
 * Normalizes internal links to include the site slug
 * @param url - The URL to normalize
 * @param siteSlug - The site slug to prepend for relative paths
 * @returns The normalized URL
 */
export function normalizeInternalLink(url: string, siteSlug: string): string {
  // Don't modify anchor links, external URLs, or special protocols
  if (
    url.startsWith("#") ||
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("mailto:") ||
    url.startsWith("tel:")
  ) {
    return url;
  }

  // If it already starts with /site/, leave it as is
  if (url.startsWith("/site/")) {
    return url;
  }

  // If it's a relative path (starts with /), prepend /site/[slug]
  if (url.startsWith("/")) {
    return `/site/${siteSlug}${url}`;
  }

  // For relative paths without leading slash, add /site/[slug]/
  return `/site/${siteSlug}/${url}`;
}

