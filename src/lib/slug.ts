// src/lib/slug.ts

/**
 * Converts a title into a URL-safe slug.
 * "Men's Fashion & Style" -> "mens-fashion-style"
 */
export function generateSlug(title: string): string {
  return title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove non-alphanumeric chars
    .replace(/\s+/g, "-") // spaces -> hyphens
    .replace(/-+/g, "-") // collapse multiple hyphens
    .replace(/^-+|-+$/g, ""); // trim leading/trailing hyphens
}
