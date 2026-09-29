'use client'

import { useState, useEffect } from 'react'

interface CategoryItem {
  id: number
  name: string
  slug: string
  description?: string | null
  _count?: { posts: number }
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories')
      const data = await res.json()
      if (res.ok) {
        setCategories(data.categories)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setCreating(true)
    setMessage(null)

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: description.trim() }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create category')
      }

      setMessage({ text: 'Category created successfully!', type: 'success' })
      setName('')
      setDescription('')
      fetchCategories()
    } catch (err: any) {
      setMessage({ text: err.message || 'Error creating category', type: 'error' })
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-black text-white">Categories</h1>
        <p className="text-xs text-slate-400 mt-1">
          Organize RealNaijaGist stories and news sections
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Create Category Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg h-fit">
          <h2 className="text-base font-bold text-white mb-4">Add New Category</h2>

          {message && (
            <div
              className={`mb-4 p-3 rounded-xl text-xs font-medium ${
                message.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/10 border border-red-500/20 text-red-400'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Politics, Entertainment"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Description (Optional)
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this section..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={creating}
              className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
            >
              {creating ? 'Adding...' : 'Add Category'}
            </button>
          </form>
        </div>

        {/* Categories List */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="p-5 border-b border-slate-800">
            <h2 className="text-base font-bold text-white">Existing Categories ({categories.length})</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading categories...</div>
          ) : (
            <div className="divide-y divide-slate-800">
              {categories.map((cat) => (
                <div key={cat.id} className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition">
                  <div>
                    <h3 className="font-semibold text-white text-sm">{cat.name}</h3>
                    <p className="text-xs text-slate-500 font-mono">/category/{cat.slug}</p>
                    {cat.description && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">{cat.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
                      {cat._count?.posts?.toLocaleString() || 0} articles
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
