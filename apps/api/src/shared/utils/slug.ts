/**
 * Converts a string into a URL-safe slug: lowercase, alphanumeric words joined
 * by single hyphens, no leading/trailing hyphens.
 */
export const slugify = (input: string): string =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
