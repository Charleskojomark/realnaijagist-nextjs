/**
 * Groq AI helpers (OpenAI-compatible API).
 * Summaries use GPT-OSS, never Llama (even if an old AI_MODEL env is set).
 */

const GROQ_BASE =
  process.env.OPENAI_API_BASE || 'https://api.groq.com/openai/v1'

const GPT_OSS_MODELS = new Set([
  'openai/gpt-oss-20b',
  'openai/gpt-oss-120b',
  'openai/gpt-oss-safeguard-20b',
])

function resolveGptOssModel(): string {
  const requested = (process.env.AI_MODEL || '').trim()
  if (GPT_OSS_MODELS.has(requested)) return requested
  return 'openai/gpt-oss-20b'
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractJsonArray(raw: string): unknown {
  const jsonMatch = raw.match(/\[[\s\S]*\]/)
  if (!jsonMatch) return null
  return JSON.parse(jsonMatch[0])
}

/**
 * Generate 3 concise key-takeaway bullets for a post using Groq GPT-OSS.
 * Falls back to empty array on failure so the UI can use local extraction.
 */
export async function generateKeyTakeaways(
  content: string,
  excerpt?: string | null
): Promise<string[]> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return []

  const plain = stripHtml(content).slice(0, 6000)
  if (plain.length < 80) return []

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)

    const response = await fetch(`${GROQ_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: resolveGptOssModel(),
        temperature: 0.4,
        max_completion_tokens: 800,
        reasoning_effort: 'low',
        include_reasoning: false,
        messages: [
          {
            role: 'system',
            content:
              'You summarize Nigerian news for busy readers. Return ONLY a JSON array of exactly 3 short bullet strings. No markdown, no commentary.',
          },
          {
            role: 'user',
            content: `Write 3 clear key takeaways (1 sentence each, max 140 characters) from this story.${
              excerpt ? `\n\nExcerpt: ${excerpt}` : ''
            }\n\nArticle:\n${plain}`,
          },
        ],
      }),
    })

    clearTimeout(timeout)

    if (!response.ok) {
      console.warn('Groq takeaways failed:', response.status, await response.text())
      return []
    }

    const data = await response.json()
    const message = data?.choices?.[0]?.message
    const raw = String(message?.content || message?.reasoning || '').trim()
    if (!raw) return []

    const parsed = extractJsonArray(raw)
    if (!Array.isArray(parsed)) return []

    return parsed
      .map((item) => String(item).trim())
      .filter((item) => item.length > 15)
      .slice(0, 3)
  } catch (error) {
    console.warn('Groq takeaways error:', error)
    return []
  }
}
