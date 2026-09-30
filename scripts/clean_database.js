const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function safeDeletePosts(postIds, label = '') {
  if (!postIds || postIds.length === 0) return;
  console.log(`  Deleting ${postIds.length} posts for ${label}...`);
  
  // Unlink carousel slides and scraped articles to prevent foreign key errors
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
  console.log('=== REALNAIJAGIST DATABASE RESTRUCTURING & PURGE ===');

  // STEP 1: Delete junk categories and their posts
  const junkSlugs = [
    'appreciation',
    'bilateral',
    'birthday-wishes',
    'sad-story',
    'press-statement',
    'religious',
    'pap-news',
    'local-news',
    'news'
  ];

  console.log('\n[1/5] Removing junk categories & associated posts...');
  for (const slug of junkSlugs) {
    const cat = await prisma.category.findUnique({
      where: { slug },
      include: { posts: { select: { id: true } } }
    });

    if (cat) {
      console.log(`  Found category "${cat.name}" (ID ${cat.id}) with ${cat.posts.length} posts.`);
      // Delete any RSS feed referencing this category
      await prisma.rssFeed.deleteMany({ where: { categoryId: cat.id } });

      const postIds = cat.posts.map(p => p.id);
      await safeDeletePosts(postIds, `Category "${cat.name}"`);

      // Delete the category itself
      await prisma.category.delete({ where: { id: cat.id } });
      console.log(`    ✓ Deleted category "${cat.name}".`);
    }
  }

  // STEP 2: Ensure professional core categories exist
  console.log('\n[2/5] Setting up core professional news taxonomy...');
  const coreCategories = [
    { name: 'Politics', slug: 'politics', description: 'National Assembly, Presidency, Governance & Policy' },
    { name: 'Entertainment', slug: 'entertainment', description: 'Nollywood, Afrobeats, Celebrity Gist & Culture' },
    { name: 'Business & Economy', slug: 'business', description: 'Markets, Currency, Fintech & Economic Trends' },
    { name: 'Metro & Security', slug: 'metro', description: 'Lagos Pulse, Community, Justice & Safety' },
    { name: 'Sports', slug: 'sports', description: 'Super Eagles, European Leagues, Boxing & Athletics' },
    { name: 'Tech & Innovation', slug: 'technology', description: 'Startups, AI, Telecommunications & Digital Economy' },
    { name: 'Opinion & Editorial', slug: 'opinion', description: 'Thought Leadership, Columnists & Critical Analysis' },
    { name: 'General News', slug: 'general-news', description: 'Daily Happenings across Nigeria & the Globe' },
    { name: 'Breaking News', slug: 'breaking-news', description: 'Verified Urgent Breaking Headlines' },
  ];

  const catMap = {};
  for (const c of coreCategories) {
    const existing = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description },
      create: { name: c.name, slug: c.slug, description: c.description }
    });
    catMap[c.slug] = existing.id;
    console.log(`  ✓ Category "${existing.name}" (ID: ${existing.id})`);
  }

  // STEP 3: Re-distribute posts from General/Breaking into specific channels
  console.log('\n[3/5] Re-distributing posts into specific news channels...');
  const keywordMappings = [
    {
      slug: 'entertainment',
      terms: ['nollywood', 'wizkid', 'davido', 'burna', 'tiwa', 'bbnaija', 'asake', 'rema', 'actress', 'actor', 'grammy', 'afrobeats', 'album', 'celebrity', 'gist', 'funke akindele', 'omoni oboli', 'mo abudu', 'music', 'nollywood film']
    },
    {
      slug: 'business',
      terms: ['cbn', 'naira', 'dollar', 'inflation', 'dangote', 'crude oil', 'nnpcl', 'revenue', 'tax', 'stock exchange', 'gdp', 'forex', 'interest rate', 'banking', 'fintech', 'economy', 'investors', 'opec', 'subsidy']
    },
    {
      slug: 'sports',
      terms: ['super eagles', 'osimhen', 'chelsea', 'arsenal', 'manchester', 'premier league', 'champions league', 'afcon', 'fifa', 'football', 'striker', 'coach', 'nff', 'ballon', 'madrid', 'barcelona']
    },
    {
      slug: 'politics',
      terms: ['tinubu', 'shettima', 'senate', 'house of reps', 'akpabio', 'apc', 'pdp', 'labour party', 'inec', 'governor', 'minister', 'federal government', 'fct minister', 'wike', 'sanwo-olu', 'fubara']
    },
    {
      slug: 'metro',
      terms: ['police', 'efcc', 'court', 'trial', 'arrested', 'kidnap', 'gunmen', 'lagos traffic', 'dss', 'customs', 'ndlea', 'suspects', 'judiciary', 'nabbed']
    },
    {
      slug: 'technology',
      terms: ['artificial intelligence', 'startup', 'mtn', 'airtel', 'tech', 'software', 'cybersecurity', 'telecoms', 'starlink']
    }
  ];

  for (const k of keywordMappings) {
    const targetCatId = catMap[k.slug];
    if (!targetCatId) continue;

    const orConditions = k.terms.map(t => ({ title: { contains: t, mode: 'insensitive' } }));
    const updateResult = await prisma.post.updateMany({
      where: {
        categoryId: { in: [catMap['general-news'], catMap['breaking-news']] },
        OR: orConditions
      },
      data: { categoryId: targetCatId }
    });
    console.log(`  Assigned ${updateResult.count} posts to "${k.slug.toUpperCase()}".`);
  }

  // STEP 4: Remove 60% of Scraped Vanguard & Punch Posts
  console.log('\n[4/5] Purging oldest 60% of scraped Vanguard and Punch posts...');

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
    take: 6100 // ~60%
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
    take: 8100 // ~60%
  });
  await safeDeletePosts(oldestPunch.map(p => p.id), 'Oldest Punch Posts');

  // STEP 5: Final status & verification
  console.log('\n[5/5] Final Taxonomy & Post Counts:');
  const finalTotal = await prisma.post.count();
  const allCategories = await prisma.category.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { posts: { _count: 'desc' } }
  });

  console.log(`  Total Active Stories in Database: ${finalTotal}`);
  for (const c of allCategories) {
    console.log(`  - "${c.name}" (${c.slug}): ${c._count.posts} stories`);
  }

  console.log('\n=== RESTRUCTURING AND PURGE COMPLETE ===');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
