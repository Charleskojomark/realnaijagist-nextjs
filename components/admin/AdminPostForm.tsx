'use client'

import { useState, useEffect } from 'react'
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
  }
}

export default function AdminPostForm({ postId, initialData }: PostFormProps) {
  const router = useRouter()
  const isEditing = Boolean(postId)

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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white">
            {isEditing ? 'Edit Article' : 'Write New Article'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isEditing ? 'Update post content, image, or publication status' : 'Draft and publish a new story on RealNaijaGist'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/posts"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm rounded-xl transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {saving ? 'Saving...' : isEditing ? 'Update Article' : 'Publish Article'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content Fields */}
        <div className="md:col-span-2 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Enter article headline..."
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-base font-semibold focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              URL Slug
            </label>
            <div className="flex items-center rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-slate-400">
              <span className="text-slate-500 mr-1 select-none">/post/</span>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="bg-transparent text-white w-full focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Excerpt / Summary
            </label>
            <textarea
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief 1-2 sentence preview for search engines & previews..."
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Article Body (HTML / Text)
              </label>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="text-xs text-emerald-400 hover:underline"
              >
                {showPreview ? 'Edit Content' : 'Preview'}
              </button>
            </div>

            {showPreview ? (
              <div
                className="min-h-[400px] p-6 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ) : (
              <textarea
                required
                rows={16}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your story content here (HTML paragraphs, embeds, headings supported)..."
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:border-emerald-500 leading-relaxed"
              />
            )}
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-5">
          {/* Status & Category */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
              Publishing Options
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="PUBLISHED">Published (Live)</option>
                <option value="DRAFT">Draft</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Category
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
                />
                Featured Story (Top Banner)
              </label>

              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isTrending}
                  onChange={(e) => setIsTrending(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
                />
                Trending Story (Sidebar widget)
              </label>
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
              Featured Image
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Image URL or Cloudinary Path
              </label>
              <input
                type="text"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                placeholder="https://... or blog/images/..."
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
              <p className="text-xs text-slate-500 mt-1">
                Paste any web image URL or Cloudinary path
              </p>
            </div>

            {featuredImage && (
              <div className="mt-2 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video relative">
                <img
                  src={
                    featuredImage.startsWith('http')
                      ? featuredImage
                      : `https://res.cloudinary.com/da0r9kmia/${featuredImage}`
                  }
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    ;(e.target as HTMLElement).style.display = 'none'
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  )
}
