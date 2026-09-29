import Link from 'next/link'
import { formatExcerpt, readingTime } from '@/lib/formatExcerpt'
import { getOptimizedImageUrl } from '@/lib/images'

interface PostCardProps {
  post: {
    id: number
    title: string
    slug: string
    excerpt?: string | null
    cdnImageUrl?: string | null
    featuredImage?: string | null
    imageAltText?: string | null
    views?: number
    likes?: number
    createdAt: Date | string
    isVideoPost?: boolean
    category?: { name: string; slug: string } | null
    author?: { username: string } | null
  }
  featured?: boolean
}

export default function PostCard({ post, featured = false }: PostCardProps) {
  const imageUrl = getOptimizedImageUrl(post.cdnImageUrl || post.featuredImage)
  const dateStr = new Date(post.createdAt).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  if (featured) {
    return (
      <article className="group relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 hover:border-emerald-500/50 transition-all duration-300 shadow-xl flex flex-col md:flex-row">
        <div className="relative w-full md:w-3/5 h-64 md:h-96 overflow-hidden bg-slate-800">
          <img
            src={imageUrl}
            alt={post.imageAltText || post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/placeholder-news.svg" }}
          />
          {post.category && (
            <span className="absolute top-4 left-4 bg-emerald-600 text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
              {post.category.name}
            </span>
          )}
          {post.isVideoPost && (
            <span className="absolute bottom-4 right-4 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm8.5 6l-5 3V7l5 3z"/></svg>
              VIDEO
            </span>
          )}
        </div>
        <div className="p-6 md:p-8 flex flex-col justify-between md:w-2/5">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>{dateStr}</span>
              <span>•</span>
              <span>{post.views || 0} views</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-3 leading-snug">
              <Link href={`/post/${post.slug}`}>
                {post.title}
              </Link>
            </h2>
            {post.excerpt && (
              <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed">
                {formatExcerpt(post.excerpt)}
              </p>
            )}
          </div>
          <div className="pt-4 flex items-center justify-between border-t border-slate-800">
            <span className="text-xs text-slate-400">
              By <span className="text-slate-300 font-medium">{post.author?.username || 'RealNaijaGist Desk'}</span>
            </span>
            <Link
              href={`/post/${post.slug}`}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              Read Full Story &rarr;
            </Link>
          </div>
        </div>
      </article>
    )
  }

  return (
    <article className="group bg-slate-900 rounded-xl overflow-hidden border border-slate-800/80 hover:border-slate-700 transition-all duration-300 hover:-translate-y-1 shadow-lg flex flex-col">
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-800">
        <img
          src={imageUrl}
          alt={post.imageAltText || post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/placeholder-news.svg" }}
        />
        {post.category && (
          <span className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-sm text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
            {post.category.name}
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>{dateStr}</span>
            <span>•</span>
            <span>{post.views || 0} reads</span>
            <span>·</span>
            <span>{readingTime(post.excerpt || post.title)} min read</span>
          </div>
          <h3 className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
            <Link href={`/post/${post.slug}`}>
              {post.title}
            </Link>
          </h3>
          {post.excerpt && (
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
              {formatExcerpt(post.excerpt)}
            </p>
          )}
        </div>
        <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
          <span className="text-slate-400 truncate max-w-[140px]">
            {post.author?.username || 'RealNaijaGist'}
          </span>
          <Link href={`/post/${post.slug}`} className="text-emerald-400 hover:text-emerald-300 font-medium">
            Read &rarr;
          </Link>
        </div>
      </div>
    </article>
  )
}
