import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getPostBySlug, getRelatedPosts, getAllPublishedSlugs } from '@/lib/posts'
import { getOptimizedImageUrl } from '@/lib/images'
import PostCard from '@/components/PostCard'
import SidebarWidgets from '@/components/SidebarWidgets'
import AdUnit from '@/components/AdUnit'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  try {
    const posts = await getAllPublishedSlugs()
    return posts.slice(0, 30).map((p) => ({ slug: p.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return { title: 'Post Not Found | RealNaijaGist' }

  const ogImage = getOptimizedImageUrl(post.cdnImageUrl || post.featuredImage)

  return {
    title: `${post.title} | RealNaijaGist`,
    description: post.excerpt || post.title,
    openGraph: {
      title: post.title,
      description: post.excerpt || post.title,
      url: `https://realnaijagist.com/post/${post.slug}`,
      siteName: 'RealNaijaGist',
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.imageAltText || post.title }],
      type: 'article',
      publishedTime: post.publishedAt?.toISOString() || post.createdAt.toISOString(),
      authors: [post.author?.username || 'RealNaijaGist Editorial Desk'],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || post.title,
      images: [ogImage],
    },
  }
}

export default async function PostDetailPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) notFound()

  const related = await getRelatedPosts(post.categoryId, post.id, 3)
  const imageUrl = getOptimizedImageUrl(post.cdnImageUrl || post.featuredImage)
  const dateFormatted = new Date(post.createdAt).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  // JSON-LD NewsArticle structured data for Google Search & AdSense
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.title,
    description: post.excerpt,
    image: [imageUrl],
    datePublished: post.publishedAt?.toISOString() || post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      '@type': 'Person',
      name: post.author?.username || 'RealNaijaGist Editorial Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'RealNaijaGist',
      logo: {
        '@type': 'ImageObject',
        url: 'https://realnaijagist.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://realnaijagist.com/post/${post.slug}`,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb */}
        <nav className="text-xs text-slate-400 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-emerald-400">Home</Link>
          <span>/</span>
          {post.category && (
            <>
              <Link href={`/category/${post.category.slug}`} className="hover:text-emerald-400 text-emerald-400">
                {post.category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="truncate max-w-[200px] sm:max-w-md text-slate-300">{post.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Main Article Content */}
          <article className="lg:col-span-8 space-y-6">
            <header className="space-y-4">
              {post.category && (
                <span className="bg-emerald-600/90 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                  {post.category.name}
                </span>
              )}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
                {post.title}
              </h1>

              {/* Byline */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 py-3 border-y border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-white text-[11px]">
                    {post.author?.username?.charAt(0).toUpperCase() || 'R'}
                  </div>
                  <span className="text-slate-200 font-semibold">
                    {post.author?.username || 'RealNaijaGist Desk'}
                  </span>
                </div>
                <span>•</span>
                <time dateTime={post.createdAt.toISOString()}>{dateFormatted}</time>
                <span>•</span>
                <span>{post.views} views</span>
              </div>
            </header>

            {/* Featured Image */}
            <div className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 aspect-[16/10] relative">
              <img
                src={imageUrl}
                alt={post.imageAltText || post.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Top In-Article Ad */}
            <AdUnit slot="article-top" format="horizontal" />

            {/* Post Body */}
            <div
              className="prose prose-invert prose-emerald max-w-none text-slate-300 leading-relaxed text-base sm:text-lg space-y-4"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Video Post Embed if present */}
            {post.isVideoPost && post.videoEmbedUrl && (
              <div className="aspect-video w-full rounded-xl overflow-hidden my-6 border border-slate-800">
                <iframe
                  src={post.videoEmbedUrl}
                  title={post.title}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase">Tags:</span>
                {post.tags.map(({ tag }) => (
                  <Link
                    key={tag.slug}
                    href={`/tag/${tag.slug}`}
                    className="text-xs bg-slate-800 hover:bg-emerald-600/30 hover:text-emerald-300 border border-slate-700 text-slate-300 px-3 py-1 rounded-full transition-colors"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Bottom In-Article Ad */}
            <AdUnit slot="article-bottom" format="rectangle" />

            {/* Related Posts */}
            {related.length > 0 && (
              <section className="pt-8 border-t border-slate-800 space-y-6">
                <h3 className="text-xl font-bold text-white">Related Stories</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {related.map((p) => (
                    <PostCard key={p.id} post={p} />
                  ))}
                </div>
              </section>
            )}
          </article>

          {/* Right Sidebar */}
          <div className="lg:col-span-4">
            <SidebarWidgets />
          </div>
        </div>
      </div>
    </>
  )
}
