const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function safeDeletePosts(postIds, label = '') {
  if (!postIds || postIds.length === 0) return;
  console.log(`  Deleting ${postIds.length} posts for ${label}...`);
  
  for (let i = 0; i < postIds.length; i += 1000) {
    const batch = postIds.slice(i, i + 1000);
    await prisma.carouselSlide.updateMany({
      where: { postId: { in: batch } },
      data: { postId: null }
    });
    await prisma.scrapedArticle.updateMany({
      where: { postId: { in: batch } },
      data: { postId: null }
    });
    await prisma.postTag.deleteMany({
      where: { postId: { in: batch } }
    });
    await prisma.comment.deleteMany({
      where: { postId: { in: batch } }
    });
    await prisma.like.deleteMany({
      where: { postId: { in: batch } }
    });
    await prisma.post.deleteMany({
      where: { id: { in: batch } }
    });
    console.log(`    Deleted batch ${Math.floor(i / 1000) + 1} (${batch.length} posts)`);
  }
}

async function main() {
  console.log('=== FINISHING DATABASE CLEANUP & PURGE ===');

  // Fix PostgreSQL sequence
  try {
    await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('categories', 'id'), COALESCE(max(id), 1)) FROM categories;`);
    console.log('✓ Categories ID sequence synchronized!');
  } catch (e) {
    console.log('Sequence sync note:', e.message);
  }

  // Ensure professional categories
  const targetCategories = [
    { name: 'Politics', slug: 'politics' },
    { name: 'Entertainment', slug: 'entertainment' },
    { name: 'Business & Economy', slug: 'business' },
    { name: 'Metro & Security', slug: 'metro' },
    { name: 'Sports', slug: 'sports' },
    { name: 'Tech & Innovation', slug: 'technology' },
    { name: 'Opinion & Analysis', slug: 'opinion' },
    { name: 'General News', slug: 'general-news' },
    { name: 'Breaking News', slug: 'breaking-news' },
  ];

  const catMap = {};
  for (const c of targetCategories) {
    let cat = await prisma.category.findUnique({ where: { slug: c.slug } });
    if (!cat) {
      cat = await prisma.category.create({ data: { name: c.name, slug: c.slug } });
    } else if (cat.name !== c.name) {
      cat = await prisma.category.update({ where: { id: cat.id }, data: { name: c.name } });
    }
    catMap[c.slug] = cat.id;
    console.log(`  ✓ Category "${cat.name}" (ID ${cat.id}) ready.`);
  }

  // Re-classify posts based on title keywords
  console.log('\n[2/4] Distributing posts into relevant categories...');
  const keywordMappings = [
    {
      slug: 'entertainment',
      terms: ['nollywood', 'wizkid', 'davido', 'burna', 'tiwa', 'bbnaija', 'asake', 'rema', 'actress', 'actor', 'grammy', 'afrobeats', 'album', 'celebrity', 'gist', 'funke akindele', 'omoni oboli', 'mo abudu', 'music video', 'nollywood film', 'portable', 'vector', 'odumodublvck', 'ay makun']
    },
    {
      slug: 'business',
      terms: ['cbn', 'naira', 'dollar', 'inflation', 'dangote', 'crude oil', 'nnpcl', 'revenue', 'tax', 'stock exchange', 'gdp', 'forex', 'interest rate', 'banking', 'fintech', 'economy', 'investors', 'opec', 'subsidy', 'customs revenue', 'export', 'import']
    },
    {
      slug: 'sports',
      terms: ['super eagles', 'osimhen', 'chelsea', 'arsenal', 'manchester', 'premier league', 'champions league', 'afcon', 'fifa', 'football', 'striker', 'coach', 'nff', 'ballon', 'madrid', 'barcelona', 'epl', 'lookman', 'boniface']
    },
    {
      slug: 'politics',
      terms: ['tinubu', 'shettima', 'senate', 'house of reps', 'akpabio', 'apc', 'pdp', 'labour party', 'inec', 'governor', 'minister', 'federal government', 'fct minister', 'wike', 'sanwo-olu', 'fubara', 'national assembly', 'presidency']
    },
    {
      slug: 'metro',
      terms: ['police', 'efcc', 'court', 'trial', 'arrested', 'kidnap', 'gunmen', 'lagos traffic', 'dss', 'customs', 'ndlea', 'suspects', 'judiciary', 'nabbed', 'robbery', 'accident', 'remanded']
    },
    {
      slug: 'technology',
      terms: ['artificial intelligence', 'startup', 'mtn', 'airtel', 'tech', 'software', 'cybersecurity', 'telecoms', 'starlink', 'glo', 'fintech startup']
    }
  ];

  const sourceCats = [catMap['general-news'], catMap['breaking-news']].filter(Boolean);

  for (const k of keywordMappings) {
    const targetCatId = catMap[k.slug];
    if (!targetCatId) continue;

    const orConditions = k.terms.map(t => ({ title: { contains: t, mode: 'insensitive' } }));
    const updateResult = await prisma.post.updateMany({
      where: {
        categoryId: { in: sourceCats },
        OR: orConditions
      },
      data: { categoryId: targetCatId }
    });
    console.log(`  Assigned ${updateResult.count} posts to "${k.slug.toUpperCase()}".`);
  }

  // Purge 60% of Vanguard & Punch
  console.log('\n[3/4] Purging oldest 60% of scraped Vanguard and Punch posts...');

  // A. Vanguard
  const oldestVanguard = await prisma.post.findMany({
    where: {
      OR: [
        { content: { contains: 'Vanguard', mode: 'insensitive' } },
        { excerpt: { contains: 'Vanguard', mode: 'insensitive' } },
      ]
    },
    orderBy: { createdAt: 'asc' },
    select: { id: true },
    take: 6100
  });
  await safeDeletePosts(oldestVanguard.map(p => p.id), 'Oldest Vanguard Posts');

  // B. Punch
  const oldestPunch = await prisma.post.findMany({
    where: {
      OR: [
        { content: { contains: 'Punch', mode: 'insensitive' } },
        { excerpt: { contains: 'Punch', mode: 'insensitive' } },
      ]
    },
    orderBy: { createdAt: 'asc' },
    select: { id: true },
    take: 8100
  });
  await safeDeletePosts(oldestPunch.map(p => p.id), 'Oldest Punch Posts');

  // Summary
  console.log('\n[4/4] Final Results:');
  const finalCount = await prisma.post.count();
  const cats = await prisma.category.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { posts: { _count: 'desc' } }
  });

  console.log(`  Total Active Posts: ${finalCount}`);
  for (const c of cats) {
    console.log(`  - ${c.name} (${c.slug}): ${c._count.posts} posts`);
  }

  console.log('\n=== COMPLETED SUCCESSFULLY ===');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
