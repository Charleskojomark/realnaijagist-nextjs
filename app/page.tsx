import { getPublishedPosts, getActiveCarouselSlides, getTrendingPosts, getPopularPosts } from '@/lib/posts'
import PostCard from '@/components/PostCard'
import HeroCarousel from '@/components/HeroCarousel'
import SidebarWidgets from '@/components/SidebarWidgets'
import Pagination from '@/components/Pagination'
import NewsletterForm from '@/components/NewsletterForm'
import AdUnit from '@/components/AdUnit'

export const revalidate = 1800 // Revalidate every 30 minutes (ISR)

interface HomePageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { page: pageStr } = await searchParams
  const currentPage = parseInt(pageStr || '1', 10)

  const [{ posts, total, totalPages }, carouselSlides, trendingPosts, popularPosts] =
    await Promise.all([
      getPublishedPosts(currentPage, 12),
      getActiveCarouselSlides(5),
      getTrendingPosts(5),
      getPopularPosts(5),
    ])

  const featuredPost = currentPage === 1 && posts.length > 0 ? posts[0] : null
  const standardPosts = currentPage === 1 && posts.length > 0 ? posts.slice(1) : posts

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-10">
      {/* Hero Carousel on First Page */}
      {currentPage === 1 && carouselSlides.length > 0 && (
        <section aria-label="Featured Carousel">
          <HeroCarousel slides={carouselSlides} />
        </section>
      )}

      {/* Top Banner Advertisement (AdSense) */}
      <AdUnit slot="homepage-leaderboard" format="horizontal" />

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Main Feed */}
        <main className="lg:col-span-8 space-y-8">
          {/* Section Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-[11px] uppercase tracking-widest text-emerald-400 font-bold">
                Nigeria Live
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
                Breaking News &amp; Exclusive Gist
              </h1>
            </div>
            <span className="text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full">
              {total} Total Stories
            </span>
          </div>

          {/* Lead Featured Story */}
          {featuredPost && (
            <div className="mb-8">
              <PostCard post={featuredPost} featured={true} />
            </div>
          )}

          {/* Regular Posts Grid */}
          {standardPosts.length === 0 && !featuredPost ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400 space-y-2">
              <p className="text-base text-slate-300 font-semibold">No published stories found.</p>
              <p className="text-xs">Live articles are being synced from the database.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {standardPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}

          {/* Pagination */}
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            basePath="/"
          />

          {/* Newsletter Box */}
          <div className="pt-8">
            <NewsletterForm />
          </div>
        </main>

        {/* Sidebar */}
        <div className="lg:col-span-4">
          <SidebarWidgets
            trendingPosts={trendingPosts}
            popularPosts={popularPosts}
          />
        </div>
      </div>
    </div>
  )
}