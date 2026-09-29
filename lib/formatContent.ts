/**
 * Converts plain-text post content (with \n newlines) to safe HTML.
 * Handles both plain text stored from the old Django site and
 * HTML content stored by the new admin editor.
 */
export function formatPostContent(content: string): string {
  if (!content) return ''

  // If it already contains HTML block-level tags, return as-is
  const hasHtmlBlocks = /<(p|div|h[1-6]|ul|ol|li|blockquote|img|iframe|br)\b/i.test(content)
  if (hasHtmlBlocks) {
    return content
  }

  // Plain text: split on double newlines = paragraph breaks
  return content
    .split(/\n\n+/)
    .map((para) => {
      const trimmed = para.trim()
      if (!trimmed) return ''
      // Single \n within a paragraph becomes a line break
      const inner = trimmed.replace(/\n/g, '<br />')
      return '<p>' + inner + '</p>'
    })
    .filter(Boolean)
    .join('\n')
}
