/**
 * Cleans scraped boilerplate from article excerpts so they display cleanly.
 * Removes patterns like:
 *   "The post X appeared first on Vanguard News."
 *   "Read More: https://..."
 *   Leading/trailing "n" artifacts from \n
 */
export function formatExcerpt(text: string | null | undefined): string {
  if (!text) return ''
  return text
    // Remove "The post ... appeared first on ..." (RSS scraper artifact)
    .replace(/\s*The post .+? appeared first on .+?\.?\s*$/gi, '')
    // Remove "Read More: https://..." lines
    .replace(/\s*Read More:?\s*https?:\/\/\S+\s*/gi, '')
    // Remove orphaned leading "n" from bad \n rendering
    .replace(/^n\s+/g, '')
    .replace(/\bn\n/g, '\n')
    // Trim whitespace
    .trim()
}

/** Estimates reading time in minutes based on word count */
export function readingTime(content: string): number {
  const words = content.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}
