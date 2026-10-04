/**
 * Converts post content (plain text or HTML) to safe, readable HTML.
 * Handles content from both the Django admin and the new Next.js admin.
 * Ensures paragraphs, headings, lists, and embeds all render correctly.
 */
export function formatPostContent(content: string): string {
  if (!content) return ''

  // Already contains HTML block-level tags - return with minimal cleanup
  const hasHtmlBlocks = /<(p|div|h[1-6]|ul|ol|li|blockquote|img|iframe|br|figure|section|article)\b/i.test(content)
  if (hasHtmlBlocks) {
    // Ensure inline YouTube/video iframes have proper wrapper
    return content.replace(
      /<iframe([^>]*youtube[^>]*)>/gi,
      '<div class="relative w-full aspect-video my-5 rounded-xl overflow-hidden shadow-lg"><iframe$1>'
    )
  }

  // Plain text: convert to HTML paragraphs
  const paragraphs = content
    .split(/\n{2,}/)  // split on 2+ newlines
    .map((para) => {
      const trimmed = para.trim()
      if (!trimmed) return ''

      // Headings: lines starting with # (Markdown-style)
      if (trimmed.startsWith('### ')) return `<h3>${trimmed.slice(4)}</h3>`
      if (trimmed.startsWith('## ')) return `<h2>${trimmed.slice(3)}</h2>`
      if (trimmed.startsWith('# ')) return `<h1>${trimmed.slice(2)}</h1>`

      // Handle single newlines within a paragraph as line breaks
      const inner = trimmed.replace(/\n/g, '<br />')
      return `<p>${inner}</p>`
    })
    .filter(Boolean)
    .join('\n')

  return paragraphs
}

/**
 * Strips all HTML tags and returns clean plain text.
 * Used for excerpts, TTS audio narration, and meta descriptions.
 */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s{2,}/g, ' ')
    .trim()
}