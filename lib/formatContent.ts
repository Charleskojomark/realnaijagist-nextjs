/**
 * Sanitizes HTML from Django/external content to prevent overflow and layout issues.
 * - Removes fixed width/height attributes from images (CSS handles sizing)
 * - Wraps bare iframes in responsive 16:9 containers
 * - Strips dangerous inline styles
 */
function sanitizeHtml(html: string): string {
  let out = html
  // Remove width/height attrs from <img> so CSS max-width:100% controls size
  out = out.replace(/ width=["'][^"']*["']/gi, '')
  out = out.replace(/ height=["'][^"']*["']/gi, '')
  // Remove inline style attributes (may have fixed pixel widths)
  out = out.replace(/ style=["'][^"']*["']/gi, '')
  // Remove table fixed widths
  out = out.replace(/<table ([^>]*)width=["'][^"']*["']/gi, '<table $1')
  // Wrap iframes in responsive container (skip if already wrapped)
  if (out.includes('<iframe') && !out.includes('aspect-video')) {
    out = out
      .replace(/<iframe /gi, '<div class="relative w-full aspect-video my-5 rounded-xl overflow-hidden shadow-lg"><iframe style="width:100%;height:100%;position:absolute;top:0;left:0;" ')
      .replace(/<\/iframe>/gi, '</iframe></div>')
  }
  return out
}

/**
 * Converts post content (plain text or HTML) to safe, readable HTML.
 * Handles content from both the Django admin and the new Next.js admin.
 */
export function formatPostContent(content: string): string {
  if (!content) return ''

  // Already contains HTML block-level tags - sanitize and return
  const hasHtmlBlocks = /<(p|div|h[1-6]|ul|ol|li|blockquote|img|iframe|br|figure|section|article)\b/i.test(content)
  if (hasHtmlBlocks) {
    return sanitizeHtml(content)
  }

  // Plain text: convert to HTML paragraphs
  const paragraphs = content
    .split(/\n{2,}/)
    .map((para) => {
      const trimmed = para.trim()
      if (!trimmed) return ''
      if (trimmed.startsWith('### ')) return `<h3>${trimmed.slice(4)}</h3>`
      if (trimmed.startsWith('## ')) return `<h2>${trimmed.slice(3)}</h2>`
      if (trimmed.startsWith('# ')) return `<h1>${trimmed.slice(2)}</h1>`
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
