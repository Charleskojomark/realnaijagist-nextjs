import { PrismaClient, PostStatus } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

interface SeedData {
  categories: Array<{ id: number; name: string; slug: string; description: string | null }>
  users: Array<{ id: number; username: string; email: string | null; password?: string; is_staff?: boolean; is_active?: boolean }>
  posts: Array<{
    id: number
    title: string
    slug: string
    content: string
    status: string
    excerpt: string | null
    featured_image: string | null
    image_alt_text: string | null
    cdn_image_url: string | null
    created_at: string
    updated_at: string
    published_at: string | null
    views: number
    likes: number
    is_trending: boolean
    author_id: number
    category_id: number
    is_video_post: boolean
    video_embed_url: string | null
  }>
  carousel_slides: Array<{
    id: number
    title: string
    subtitle: string | null
    description: string | null
    image: string | null
    image_alt_text: string | null
    is_active: boolean
    order: number
    author_id: number | null
    post_id: number | null
    scraped_image_url: string | null
  }>
}

async function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms))
}

async function warmup() {
  console.log('⚡ Waking up Neon Postgres...')
  for (let i = 1; i <= 5; i++) {
    try {
      await prisma.$queryRaw`SELECT 1`
      console.log('✅ Neon Postgres is awake and connected!')
      return
    } catch {
      console.log(`... waiting for compute node (attempt ${i})...`)
      await sleep(2500)
    }
  }
}

async function main() {
  await warmup()

  console.log('🚀 Reading seed data...')
  const raw = fs.readFileSync(path.join(__dirname, 'seed-data.json'), 'utf-8')
  const data: SeedData = JSON.parse(raw)

  // 1. Seed Categories
  console.log(`📁 Seeding ${data.categories.length} categories...`)
  for (const cat of data.categories) {
    if (!cat.name || !cat.slug) continue
    await prisma.category.upsert({
      where: { id: cat.id },
      update: { name: cat.name, slug: cat.slug, description: cat.description },
      create: { id: cat.id, name: cat.name, slug: cat.slug, description: cat.description },
    })
  }
  console.log('✅ Categories seeded!')

  // 2. Seed Users
  console.log(`👤 Seeding ${data.users.length} users...`)
  for (const u of data.users) {
    if (!u.username) continue
    await prisma.user.upsert({
      where: { id: u.id },
      update: { username: u.username },
      create: {
        id: u.id,
        username: u.username,
        email: u.email || `${u.username.toLowerCase()}@realnaijagist.com`,
        passwordHash: u.password || 'migrated_user',
        isStaff: Boolean(u.is_staff),
        isActive: Boolean(u.is_active),
      },
    })
  }
  console.log('✅ Users seeded!')

  const validCatIds = new Set((await prisma.category.findMany({ select: { id: true } })).map((c) => c.id))
  const validUserIds = new Set((await prisma.user.findMany({ select: { id: true } })).map((u) => u.id))
  const defaultCatId = Array.from(validCatIds)[0] || 1
  const defaultAuthorId = Array.from(validUserIds)[0] || 1

  // 3. Find existing post IDs to avoid duplicate work
  const existingPostIds = new Set((await prisma.post.findMany({ select: { id: true } })).map((p) => p.id))
  console.log(`📊 Currently existing posts in DB: ${existingPostIds.size}`)

  // Sort posts: latest first so the newest articles are populated first
  const postsToSeed = data.posts
    .filter((p) => !existingPostIds.has(p.id))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  console.log(`📰 Seeding ${postsToSeed.length} remaining posts in micro-batches of 25...`)

  const BATCH_SIZE = 25
  let inserted = 0

  for (let i = 0; i < postsToSeed.length; i += BATCH_SIZE) {
    const batch = postsToSeed.slice(i, i + BATCH_SIZE)
    const records = batch.map((p) => {
      let finalImg = p.cdn_image_url || p.featured_image
      if (finalImg && finalImg.startsWith('blog/images/') && !finalImg.startsWith('http')) {
        finalImg = `https://res.cloudinary.com/da0r9kmia/${finalImg}.webp`
      }

      const postDate = p.created_at ? new Date(p.created_at) : new Date()
      const pubDate = p.published_at ? new Date(p.published_at) : postDate

      return {
        id: p.id,
        title: p.title || 'Untitled Post',
        slug: p.slug ? `${p.slug}-${p.id}`.slice(0, 190) : `post-${p.id}`,
        content: p.content || '',
        excerpt: p.excerpt || null,
        featuredImage: p.featured_image,
        cdnImageUrl: finalImg,
        imageAltText: p.image_alt_text || null,
        status: PostStatus.PUBLISHED,
        isTrending: Boolean(p.is_trending),
        isVideoPost: Boolean(p.is_video_post),
        videoEmbedUrl: p.video_embed_url || null,
        views: typeof p.views === 'number' ? p.views : 0,
        likes: typeof p.likes === 'number' ? p.likes : 0,
        categoryId: validCatIds.has(p.category_id) ? p.category_id : defaultCatId,
        authorId: validUserIds.has(p.author_id) ? p.author_id : defaultAuthorId,
        createdAt: isNaN(postDate.getTime()) ? new Date() : postDate,
        publishedAt: isNaN(pubDate.getTime()) ? new Date() : pubDate,
        updatedAt: p.updated_at && !isNaN(new Date(p.updated_at).getTime()) ? new Date(p.updated_at) : new Date(),
      }
    })

    try {
      await prisma.post.createMany({
        data: records,
        skipDuplicates: true,
      })
      inserted += records.length
    } catch {
      // Fallback: insert individually
      for (const rec of records) {
        try {
          await prisma.post.create({ data: rec })
          inserted++
        } catch {}
      }
    }

    if (inserted % 500 === 0 || i + BATCH_SIZE >= postsToSeed.length) {
      console.log(`   Seeded ${inserted}/${postsToSeed.length} posts...`)
    }

    await sleep(40)
  }

  console.log(`✅ Posts seeded! Total newly inserted: ${inserted}`)

  // 4. Seed Carousel Slides
  console.log('🎠 Seeding carousel slides...')
  const topSlides = data.carousel_slides.slice(-20)
  const validPostIdSet = new Set((await prisma.post.findMany({ select: { id: true }, take: 2000 })).map((p) => p.id))

  for (const s of topSlides) {
    let img = s.image || s.scraped_image_url
    if (img && img.startsWith('blog/images/') && !img.startsWith('http')) {
      img = `https://res.cloudinary.com/da0r9kmia/${img}.webp`
    }

    await prisma.carouselSlide.upsert({
      where: { id: s.id },
      update: { title: s.title },
      create: {
        id: s.id,
        title: s.title,
        subtitle: s.subtitle,
        description: s.description,
        image: img,
        imageAltText: s.image_alt_text,
        isActive: s.is_active,
        order: s.order || 0,
        authorId: s.author_id && validUserIds.has(s.author_id) ? s.author_id : null,
        postId: s.post_id && validPostIdSet.has(s.post_id) ? s.post_id : null,
      },
    })
  }
  console.log('✅ Carousel slides seeded!')

  const totalFinalPosts = await prisma.post.count()
  console.log(`🎉 Neon Database ready with ${totalFinalPosts} published articles!`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
