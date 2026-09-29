import Link from 'next/link'
import { getOptimizedImageUrl } from '@/lib/images'
import AdUnit from './AdUnit'

interface PostSummary {
  id: number
  title: string
  slug: string
  cdnImageUrl?: string | null
  featuredImage?: string | null
  views?: number
  createdAt: Date | string
  category?: { name: string; slug: string } | null
}

interface SidebarWidgetsProps {
  trendingPosts?: PostSummary[]
  popularPosts?: PostSummary[]
}

export default function SidebarWidgets({ trendingPosts = [], popularPosts = [] }: SidebarWidgetsProps) {
  return (
    <aside className="space-y-8">
      {/* Top Sidebar Ad Unit */}
      <AdUnit slot="sidebar-top" format="rectangle" />

      {/* Trending Posts Widget */}
      {trendingPosts.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <h3 className="text-sm font-black uppercase tracking-wider text-white border-l-3 border-emerald-500 pl-2.5 mb-4 flex items-center justify-between">
            <span>🔥 Trending Now</span>
            <span className="text-[10px] text-emerald-400 font-semibold lowercase">24h pulse</span>
          </h3>
          <div className="space-y-4">
            {trendingPosts.map((post, idx) => (
              <div key={post.id} className="flex gap-3 items-start group">
                <span className="text-xl font-black text-slate-700 group-hover:text-emerald-500 transition-colors w-5 text-right flex-shrink-0">
                  {idx + 1}
                </span>
                <div className="space-y-1">
                  {post.category && (
                    <span className="text-[10px] uppercase font-bold text-emerald-400">
                      {post.category.name}
                    </span>
                  )}
                  <h4 className="text-xs font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
                    <Link href={`/post/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Popular Posts Widget */}
      {popularPosts.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <h3 className="text-sm font-black uppercase tracking-wider text-white border-l-3 border-emerald-500 pl-2.5 mb-4">
            ⭐ Most Read This Week
          </h3>
          <div className="space-y-3.5">
            {popularPosts.map((post) => {
              const img = getOptimizedImageUrl(post.cdnImageUrl || post.featuredImage)
              return (
                <div key={post.id} className="flex gap-3 items-center group">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0">
                    <img
                      src={img}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <h4 className="text-xs font-medium text-slate-300 group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
                      <Link href={`/post/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h4>
                    <span className="text-[10px] text-slate-400">{post.views || 0} readers</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Mid Sidebar Ad Unit */}
      <AdUnit slot="sidebar-bottom" format="vertical" />
    </aside>
  )
}