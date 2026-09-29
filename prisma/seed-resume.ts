import { PrismaClient, PostStatus } from '@prisma/client'
import fs from 'fs'
import path from 'path'

let prisma = new PrismaClient({ log: ['error'] })

interface SeedPost {
  id: number; title: string; slug: string; content: string; status: string;
  excerpt: string | null; featured_image: string | null; image_alt_text: string | null;
  cdn_image_url: string | null; created_at: string; updated_at: string; published_at: string | null;
  views: number; likes: number; is_trending: boolean; author_id: number; category_id: number;
  is_video_post: boolean; video_embed_url: string | null;
}

interface SeedData {
  categories: Array<{ id: number; name: string; slug: string; description: string | null }>
  users: Array<{ id: number; username: string; email: string | null; password?: string; is_staff?: boolean; is_active?: boolean }>
  posts: SeedPost[]
}

function sleep(ms: number) { return new Promise((res) => setTimeout(res, ms)) }

async function reconnect() {
  try { await prisma.$disconnect() } catch {}
  prisma = new PrismaClient({ log: ['error'] })
  await sleep(1000)
}

async function warmup() {
  console.log('Waking up Neon...')
  for (let i = 1; i <= 8; i++) {
    try { await prisma.$queryRaw`SELECT 1`; console.log('Connected!'); return }
    catch { console.log('Retry ' + i); await sleep(3000) }
  }
  throw new Error('Cannot connect')
}

async function main() {
  await warmup()
  const data: SeedData = JSON.parse(fs.readFileSync(path.join(__dirname, 'seed-data.json'), 'utf-8'))
  console.log('Posts in JSON: ' + data.posts.length)

  const validCatIds = new Set((await prisma.category.findMany({ select: { id: true } })).map((c) => c.id))
  const validUserIds = new Set((await prisma.user.findMany({ select: { id: true } })).map((u) => u.id))
  const defaultCatId = Array.from(validCatIds)[0] ?? 1
  const defaultAuthorId = Array.from(validUserIds)[0] ?? 1

  console.log('Fetching existing post IDs...')
  const existingPostIds = new Set<number>()
  let cursor: number | undefined
  while (true) {
    const chunk = await prisma.post.findMany({
      select: { id: true }, take: 5000,
      ...(cursor !== undefined ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: 'asc' },
    })
    if (!chunk.length) break
    chunk.forEach((p) => existingPostIds.add(p.id))
    cursor = chunk[chunk.length - 1].id
    if (chunk.length < 5000) break
    await sleep(300)
  }
  console.log('Existing posts in DB: ' + existingPostIds.size)

  const postsToSeed = data.posts
    .filter((p) => !existingPostIds.has(p.id) && p.slug && p.title)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  console.log('Remaining to seed: ' + postsToSeed.length)

  const BATCH = 100
  let inserted = 0, batchErrors = 0

  for (let i = 0; i < postsToSeed.length; i += BATCH) {
    const batch = postsToSeed.slice(i, i + BATCH)
    const records = batch.map((p) => {
      let finalImg = p.cdn_image_url || p.featured_image
      if (finalImg && finalImg.startsWith('blog/images/') && !finalImg.startsWith('http'))
        finalImg = 'https://res.cloudinary.com/da0r9kmia/' + finalImg + '.webp'
      const postDate = p.created_at ? new Date(p.created_at) : new Date()
      const pubDate = p.published_at ? new Date(p.published_at) : postDate
      return {
        id: p.id,
        title: (p.title || 'Untitled').slice(0, 500),
        slug: p.slug ? (p.slug + '-' + p.id).slice(0, 190) : ('post-' + p.id),
        content: p.content || '',
        excerpt: p.excerpt || null,
        featuredImage: p.featured_image || null,
        cdnImageUrl: finalImg || null,
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
      const res = await prisma.post.createMany({ data: records, skipDuplicates: true })
      inserted += res.count
    } catch (e: any) {
      batchErrors++
      for (const rec of records) {
        try { await prisma.post.create({ data: rec }); inserted++ } catch {}
      }
      if (batchErrors % 5 === 0) {
        console.log('Reconnecting after errors...')
        await reconnect()
        await warmup()
      }
    }

    if (inserted % 1000 === 0 && inserted > 0)
      console.log('Progress: ' + inserted + '/' + postsToSeed.length)
    if (i + BATCH >= postsToSeed.length)
      console.log('Final: ' + inserted + '/' + postsToSeed.length + ' inserted')
    if (inserted > 0 && inserted % 5000 === 0) {
      console.log('Periodic reconnect...')
      await reconnect()
      await warmup()
    }

    await sleep(15)
  }

  const totalPosts = await prisma.post.count()
  console.log('DONE! Total posts in DB: ' + totalPosts)
}

main().catch((e) => { console.error('Error:', e); process.exit(1) }).finally(() => prisma.$disconnect())
