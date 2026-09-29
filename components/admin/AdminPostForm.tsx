'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Category {
  id: number
  name: string
}

interface PostFormProps {
  postId?: number
  initialData?: {
    title: string
    slug: string
    content: string
    excerpt?: string | null
    categoryId: number
    featuredImage?: string | null
    status: string
    isFeatured: boolean
    isTrending: boolean
    isVideoPost?: boolean
    videoEmbedUrl?: string | null
  }
}

export default function AdminPostForm({ postId, initialData }: PostFormProps) {
  const router = useRouter()
  const isEditing = Boolean(postId)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const contentImageInputRef = useRef<HTMLInputElement>(null)

  const [categories, setCategories] = useState<Category[]>([])
  const [title, setTitle] = useState(initialData?.title || '')
  const [slug, setSlug] = useState(initialData?.slug || '')
  const [content, setContent] = useState(initialData?.content || '')
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '')
  const [categoryId, setCategoryId] = useState<number | string>(initialData?.categoryId || '')
  const [featuredImage, setFeaturedImage] = useState(initialData?.featuredImage || '')
  const [status, setStatus] = useState(initialData?.status || 'PUBLISHED')
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured || false)
  const [isTrending, setIsTrending] = useState(initialData?.isTrending || false)
  const [isVideoPost, setIsVideoPost] = useState(initialData?.isVideoPost || false)
  const [videoEmbedUrl, setVideoEmbedUrl] = useState(initialData?.videoEmbedUrl || '')

  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingContentImage, setUploadingContentImage] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    fetch('/api/admin/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) {
          setCategories(data.categories)
          if (!categoryId && data.categories.length > 0) {
            setCategoryId(data.categories[0].id)
          }
        }
      })
      .catch(console.error)
  }, [])

  const handleTitleChange = (val: string) => {
    setTitle(val)
    if (!isEditing) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
      )
    }
  }

  // Helper to insert markdown/HTML at current cursor position
  const insertIntoContent = (snippet: string) => {
    if (!textareaRef.current) {
      setContent((prev) => prev + '\n' + snippet)
      return
    }
    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newContent = content.substring(0, start) + snippet + content.substring(end)
    setContent(newContent)
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + snippet.length, start + snippet.length)
    }, 50)
  }

  // Upload photo to Cloudinary for Featured Image
  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload photo')
      }

      setFeaturedImage(data.url)
    } catch (err: any) {
      setError(err.message || 'Error uploading photo')
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Upload photo to Cloudinary and insert directly into body content
  const handleContentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingContentImage(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload photo')
      }

      insertIntoContent(`\n<img src="${data.url}" alt="${file.name.replace(/\.[^/.]+$/, '')}" class="w-full rounded-2xl my-4 shadow-md" />\n`)
    } catch (err: any) {
      setError(err.message || 'Error uploading photo into content')
    } finally {
      setUploadingContentImage(false)
      if (contentImageInputRef.current) contentImageInputRef.current.value = ''
    }
  }

  // Insert video embed snippet into body content
  const handleInsertVideoSnippet = () => {
    const url = prompt('Enter YouTube or Video URL to embed into article:')
    if (!url) return

    let embedSrc = url.trim()
    if (embedSrc.includes('youtube.com/watch?v=')) {
      const id = embedSrc.split('v=')[1]?.split('&')[0]
      if (id) embedSrc = `https://www.youtube.com/embed/${id}`
    } else if (embedSrc.includes('youtu.be/')) {
      const id = embedSrc.split('youtu.be/')[1]?.split('?')[0]
      if (id) embedSrc = `https://www.youtube.com/embed/${id}`
    }

    insertIntoContent(
      `\n<div class="relative w-full aspect-video my-5 rounded-2xl overflow-hidden shadow-lg">\n  <iframe src="${embedSrc}" class="absolute top-0 left-0 w-full h-full" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>\n</div>\n`
    )
  }

  // Insert Link snippet
  const handleInsertLink = () => {
    const url = prompt('Enter Destination URL:')
    if (!url) return
    const text = prompt('Enter Link Text:', 'Click here') || url
    insertIntoContent(`<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-emerald-400 font-semibold underline hover:text-emerald-300">${text}</a>`)
  }

  const getYoutubeEmbed = (url: string) => {
    if (!url) return null
    if (url.includes('youtube.com/embed/')) return url
    if (url.includes('youtube.com/watch?v=')) {
      const id = url.split('v=')[1]?.split('&')[0]
      return id ? `https://www.youtube.com/embed/${id}` : null
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0]
      return id ? `https://www.youtube.com/embed/${id}` : null
    }
    return url
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      const url = isEditing ? `/api/admin/posts/${postId}` : '/api/admin/posts'
      const method = isEditing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          content,
          excerpt,
          categoryId: Number(categoryId),
          featuredImage: featuredImage || null,
          status,
          isFeatured,
          isTrending,
          isVideoPost: Boolean(isVideoPost) || Boolean(videoEmbedUrl),
          videoEmbedUrl: videoEmbedUrl || null,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save post')
      }

      router.push('/admin/posts')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Error saving post')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Header / Actions - Sticky on Mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 sticky top-14 bg-slate-950/90 backdrop-blur-md py-3 z-30">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            {isEditing ? 'Edit Article' : 'Write New Article'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Add content, photos, videos, and SEO metadata
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/posts"
            className="flex-1 sm:flex-none text-center px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs sm:text-sm rounded-xl transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 sm:flex-none px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {saving ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Saving...
              </>
            ) : isEditing ? (
              'Update Article'
            ) : (
              'Publish Article'
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Headline / Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. Breaking: Major Developments Unfold..."
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-base sm:text-lg font-bold focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Permanent URL Slug
            </label>
            <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 px-3 py-2.5 text-xs sm:text-sm text-slate-400 overflow-hidden">
              <span className="text-slate-500 mr-1 select-none font-mono">/post/</span>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="bg-transparent text-white w-full focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Short Summary / Excerpt
            </label>
            <textarea
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief summary that appears on Google and social media cards..."
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* Article Body with Media Toolbar */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Article Body & Media
              </label>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
              >
                {showPreview ? '✏️ Edit Content' : '👁️ Live Preview'}
              </button>
            </div>

            {/* Media & Formatting Toolbar */}
            <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-900 border border-slate-800 rounded-t-xl text-xs">
              <span className="text-slate-500 font-semibold px-1 text-[11px] uppercase">Insert:</span>

              {/* Upload Image to Content */}
              <input
                ref={contentImageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleContentImageUpload}
              />
              <button
                type="button"
                disabled={uploadingContentImage}
                onClick={() => contentImageInputRef.current?.click()}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
              >
                <span>📷</span>
                <span>{uploadingContentImage ? 'Uploading...' : 'Add Photo'}</span>
              </button>

              {/* Embed Video to Content */}
              <button
                type="button"
                onClick={handleInsertVideoSnippet}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1.5 transition"
              >
                <span>🎥</span>
                <span>Embed Video</span>
              </button>

              {/* Add Link */}
              <button
                type="button"
                onClick={handleInsertLink}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1 transition"
              >
                <span>🔗</span>
                <span>Link</span>
              </button>

              <div className="h-4 w-px bg-slate-700 mx-1 hidden sm:block" />

              {/* Formatting */}
              <button
                type="button"
                onClick={() => insertIntoContent('**Bold Text**')}
                className="px-2 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                title="Bold"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => insertIntoContent('*Italic Text*')}
                className="px-2 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 italic"
                title="Italic"
              >
                I
              </button>
              <button
                type="button"
                onClick={() => insertIntoContent('\n## Subheading\n')}
                className="px-2 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-[11px]"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => insertIntoContent('\n> Blockquote text here\n')}
                className="px-2 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Quote
              </button>
              <button
                type="button"
                onClick={() => insertIntoContent('\n- Bullet item\n- Bullet item\n')}
                className="px-2 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                List
              </button>
            </div>

            {showPreview ? (
              <div
                className="min-h-[420px] p-5 sm:p-6 rounded-b-xl bg-slate-900 border-x border-b border-slate-800 text-slate-200 prose prose-invert max-w-none leading-relaxed"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ) : (
              <textarea
                ref={textareaRef}
                required
                rows={16}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your article here... You can click 'Add Photo' or 'Embed Video' in the toolbar above to place photos and videos anywhere in the body."
                className="w-full px-4 py-3 rounded-b-xl bg-slate-900 border-x border-b border-slate-800 text-white placeholder-slate-500 text-sm font-sans focus:outline-none focus:border-emerald-500 leading-relaxed font-mono"
              />
            )}
          </div>
        </div>

        {/* Sidebar Controls (Photos, Videos, Publishing) */}
        <div className="space-y-5">
          {/* Featured Image Section (Cloudinary Upload) */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>📸</span> Featured Cover Photo
              </h3>
              {featuredImage && (
                <button
                  type="button"
                  onClick={() => setFeaturedImage('')}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              )}
            </div>

            {/* Direct File Upload */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFeaturedImageUpload}
            />

            <button
              type="button"
              disabled={uploadingImage}
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
            >
              {uploadingImage ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Uploading to Cloudinary...
                </>
              ) : (
                <>
                  <span>📁</span>
                  <span>Upload Photo from Phone / PC</span>
                </>
              )}
            </button>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Or Paste Image URL / Cloudinary Path
              </label>
              <input
                type="text"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                placeholder="https://... or blog/images/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Image Preview */}
            {featuredImage && (
              <div className="space-y-2">
                <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video relative">
                  <img
                    src={
                      featuredImage.startsWith('http')
                        ? featuredImage
                        : `https://res.cloudinary.com/da0r9kmia/${featuredImage}`
                    }
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      ;(e.target as HTMLElement).style.display = 'none'
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const fullUrl = featuredImage.startsWith('http')
                      ? featuredImage
                      : `https://res.cloudinary.com/da0r9kmia/${featuredImage}`
                    insertIntoContent(`\n<img src="${fullUrl}" alt="${title || 'Image'}" class="w-full rounded-2xl my-4 shadow-md" />\n`)
                  }}
                  className="w-full py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
                >
                  + Also Insert into Content Body
                </button>
              </div>
            )}
          </div>

          {/* Video Post Section */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>🎬</span> Video Post / Embed
              </h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isVideoPost}
                  onChange={(e) => setIsVideoPost(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                YouTube or Video URL
              </label>
              <input
                type="text"
                value={videoEmbedUrl}
                onChange={(e) => {
                  setVideoEmbedUrl(e.target.value)
                  if (e.target.value) setIsVideoPost(true)
                }}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Supports YouTube, Vimeo, and direct video links.
              </p>
            </div>

            {/* Video Live Preview */}
            {videoEmbedUrl && getYoutubeEmbed(videoEmbedUrl) && (
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-emerald-400">Video Preview:</p>
                <div className="rounded-xl overflow-hidden border border-slate-800 aspect-video relative">
                  <iframe
                    src={getYoutubeEmbed(videoEmbedUrl)!}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </div>

          {/* Publishing Settings & Category */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-lg">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">
              Publishing Options
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="PUBLISHED">Published (Visible to Public)</option>
                <option value="DRAFT">Draft (Save for Later)</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Category *
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-800">
              <label className="flex items-center gap-3 text-xs sm:text-sm text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
                />
                <span>Featured Story (Top Carousel)</span>
              </label>

              <label className="flex items-center gap-3 text-xs sm:text-sm text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isTrending}
                  onChange={(e) => setIsTrending(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
                />
                <span>Trending Story (Highlights)</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
