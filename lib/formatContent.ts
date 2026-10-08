/**
 * Sanitizes HTML from Django/external content to prevent overflow and layout issues.
 * - Removes fixed width/height attributes from images (CSS handles sizing)
 * - Wraps bare iframes in responsive 16:9 containers
 * - Strips dangerous inline styles
 * - Splits jammed text into readable paragraphs
 */
function sanitizeHtml(html: string): string {
  let out = html
  out = out.replace(/ width=["'][^"']*["']/gi, '')
  out = out.replace(/ height=["'][^"']*["']/gi, '')
  out = out.replace(/ style=["'][^"']*["']/gi, '')
  out = out.replace(/<table ([^>]*)width=["'][^"']*["']/gi, '<table $1')
  if (out.includes('<iframe') && !out.includes('aspect-video')) {
    out = out
      .replace(
        /<iframe /gi,
        '<div class="relative w-full aspect-video my-5 rounded-xl overflow-hidden shadow-lg"><iframe style="width:100%;height:100%;position:absolute;top:0;left:0;" '
      )
      .replace(/<\/iframe>/gi, '</iframe></div>')
  }
  return out
}

function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#x27;/g, "'")
}

function stripTagsKeepBreaks(html: string): string {
  return decodeEntities(
    html
      .replace(/<(br|\/p|\/div|\/h[1-6]|\/li|\/blockquote)\b[^>]*>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
  )
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}

/** Split a long plain-text blob into short paragraph chunks. */
function splitPlainIntoParagraphs(text: string): string[] {
  const normalized = text
    .replace(/\r\n/g, '\n')
    .replace(/(<br\s*\/?>\s*){2,}/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/([.!?])([A-Z])/g, '$1 $2')
    .trim()

  let chunks = normalized
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)

  const sentenceSplit = (block: string): string[] => {
    const sentences = block
      .split(/(?<=[.!?])\s+(?=[A-Z0-9"“‘])/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)

    if (sentences.length <= 1) return [block]

    const grouped: string[] = []
    for (let i = 0; i < sentences.length; i += 2) {
      const group = sentences.slice(i, i + 2).join(' ')
      if (group) grouped.push(group)
    }
    return grouped
  }

  chunks = chunks.flatMap((chunk) => {
    if (chunk.length > 180) return sentenceSplit(chunk)
    return [chunk]
  })

  return chunks.filter((c) => c.length > 0)
}

function hasRichInnerHtml(inner: string): boolean {
  return /<(img|iframe|ul|ol|blockquote|h[1-6]|figure|table)\b/i.test(inner)
}

/** Ensure each <p> is not an oversized wall of text. */
function loosenParagraphs(html: string): string {
  let out = html.replace(/(<br\s*\/?>\s*){2,}/gi, '</p><p>')

  out = out.replace(/<p\b[^>]*>([\s\S]*?)<\/p>/gi, (_match, inner: string) => {
    if (hasRichInnerHtml(inner)) {
      return `<p>${inner.trim()}</p>`
    }

    const plain = stripTagsKeepBreaks(inner).replace(/\s+/g, ' ').trim()
    if (plain.length < 160) {
      return `<p>${inner.trim()}</p>`
    }

    const parts = splitPlainIntoParagraphs(plain)
    if (parts.length <= 1) {
      return `<p>${inner.trim()}</p>`
    }

    return parts.map((p) => `<p>${p}</p>`).join('\n')
  })

  return out
}

function wrapBareTextAsParagraphs(html: string): string {
  if (/<p\b/i.test(html)) return html

  const mediaBlocks: string[] = []
  const stash = (block: string) => {
    mediaBlocks.push(block)
    return `\n\n%%MEDIA_${mediaBlocks.length - 1}%%\n\n`
  }

  let withPlaceholders = html.replace(/<img\b[^>]*>/gi, stash)
  withPlaceholders = withPlaceholders.replace(
    /<(figure|ul|ol|blockquote|table|h[1-6]|iframe)\b[\s\S]*?<\/\1>/gi,
    stash
  )

  const plain = stripTagsKeepBreaks(withPlaceholders)
  const parts = splitPlainIntoParagraphs(plain)

  if (parts.length === 0 && mediaBlocks.length === 0) return html

  return parts
    .map((part) => {
      const media = part.match(/^%%MEDIA_(\d+)%%$/)
      if (media) return mediaBlocks[Number(media[1])] || ''
      return `<p>${part.replace(/%%MEDIA_(\d+)%%/g, (_m, i) => mediaBlocks[Number(i)] || '')}</p>`
    })
    .filter(Boolean)
    .join('\n')
}

/**
 * Converts post content (plain text or HTML) to safe, readable HTML.
 * Handles content from both the Django admin and the new Next.js admin.
 */
export function formatPostContent(content: string): string {
  if (!content) return ''

  const hasHtmlBlocks =
    /<(p|div|h[1-6]|ul|ol|li|blockquote|img|iframe|br|figure|section|article)\b/i.test(
      content
    )

  if (hasHtmlBlocks) {
    return sanitizeHtml(loosenParagraphs(wrapBareTextAsParagraphs(content)))
  }

  const paragraphs = splitPlainIntoParagraphs(content)
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
