export const dynamic = 'force-dynamic'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import prisma from '@/lib/db'
import { getPublishedPosts } from '@/lib/posts'
import PostCard from '@/components/PostCard'
import SidebarWidgets from '@/components/SidebarWidgets'
import Pagination from '@/components/Pagination'
import AdUnit from '@/components/AdUnit'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const category = await prisma.category.findUnique({ where: { slug } })
  if (!category) return { title: 'Category Not Found | RealNaijaGist' }

  const desc = category.description || `Read the latest ${category.name} news and breaking updates on RealNaijaGist.`

  return {
    title: `${category.name} News and Updates | RealNaijaGist`,
    description: desc,
    alternates: { canonical: `https://realnaijagist.com/category/${category.slug}` },
    openGraph: {
      title: `${category.name} News | RealNaijaGist`,
      description: desc,
      url: `https://realnaijagist.com/category/${category.slug}`,
      siteName: 'RealNaijaGist',
      images: [{ url: 'https://realnaijagist.com/og-image.jpg', width: 1200, height: 630, alt: `${category.name} News - RealNaijaGist` }],
      type: 'website',
      locale: 'en_NG',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${category.name} News | RealNaijaGist`,
      description: desc,
      images: ['https://realnaijagist.com/og-image.jpg'],
      site: '@RealNaijaGist',
    },
  }
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { page: pageStr } = await searchParams
  const currentPage = parseInt(pageStr || '1', 10)
  const category = await prisma.category.findUnique({ where: { slug } })
  if (!category) notFound()
  const { posts, total, totalPages } = await getPublishedPosts(currentPage, 12, slug)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <nav className="text-xs text-slate-400 mb-4 flex items-center gap-2">
        <Link href="/" className="hover:text-emerald-400">Home</Link>
        <span>/</span>
        <span className="text-slate-300">{category.name}</span>
      </nav>
      <header className="mb-8 border-b border-slate-800 pb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Category Archive</span>
        <h1 className="text-3xl sm:text-4xl font-black text-white mt-1">{category.name}</h1>
        {category.description && <p className="text-sm text-slate-400 mt-2 max-w-2xl">{category.description}</p>}
        <p className="text-xs text-slate-500 mt-2">{total.toLocaleString()} articles published</p>
      </header>
      <AdUnit slot="category-header" format="horizontal" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-6">
        <main className="lg:col-span-8">
          {posts.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">No articles yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {posts.map((post) => (<PostCard key={post.id} post={post} />))}
            </div>
          )}
          <Pagination totalPages={totalPages} currentPage={currentPage} basePath={`/category/${slug}`} />
        </main>
        <div className="lg:col-span-4"><SidebarWidgets /></div>
      </div>
    </div>
  )
}