export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export function slugify(name: string) {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return base || "tournament";
}

/**
 * Safely encode a slug for use in URLs and redirect headers.
 * Ensures Arabic and other non-ASCII characters are properly encoded.
 */
export function encodeSlug(slug: string): string {
  return encodeURIComponent(slug);
}
