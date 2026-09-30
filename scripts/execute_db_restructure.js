const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  log: ['warn', 'error']
});

async function safeDeletePosts(postIds, label = '') {
  if (!postIds || postIds.length === 0) return;
  console.log(`  Purging ${postIds.length} posts for ${label}...`);
  
  const batchSize = 1000;
  for (let i = 0; i < postIds.length; i += batchSize) {
    const batch = postIds.slice(i, i + batchSize);
    
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
    
    const res = await prisma.post.deleteMany({
      where: { id: { in: batch } }
    });
    
    console.log(`    Deleted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(postIds.length / batchSize)}: ${res.count} posts`);
  }
}

async function main() {
  console.log('========================================================');
  console.log('   REALNAIJAGIST DATABASE RESTRUCTURING & PURGE PIPELINE');
  console.log('========================================================');

  // Retry connection
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      await prisma.$connect();
      console.log('Connected to Neon PostgreSQL successfully!');
      break;
    } catch (err) {
      console.log(`Connection attempt ${attempt} failed: ${err.message}. Retrying in 2s...`);
      if (attempt === 5) throw err;
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  // Synchronize PostgreSQL ID sequence
  try {
    await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('categories', 'id'), COALESCE((SELECT max(id) FROM categories), 1));`);
    console.log('Synchronized categories sequence to max(id)!');
  } catch (seqErr) {
    console.warn('Sequence sync note:', seqErr.message);
  }

  // STEP 1: Define Target Categories
  console.log('\n[1/5] Setting up target category taxonomy...');
  const targetCategories = [
    { name: 'Politics', slug: 'politics', description: 'National Assembly, Presidency, Governance & Policy' },
    { name: 'Entertainment', slug: 'entertainment', description: 'Nollywood, Afrobeats, Celebrity Gist & Culture' },
    { name: 'Business & Economy', slug: 'business', description: 'Markets, Currency, Fintech & Economic Trends' },
    { name: 'Metro & Security', slug: 'metro', description: 'Lagos & State News, Community, Justice & Safety' },
    { name: 'Sports', slug: 'sports', description: 'Super Eagles, European Leagues, Boxing & Athletics' },
    { name: 'Tech & Innovation', slug: 'technology', description: 'Startups, AI, Telecommunications & Digital Economy' },
    { name: 'Opinion & Editorial', slug: 'opinion', description: 'Thought Leadership, Columnists & Critical Analysis' },
    { name: 'General News', slug: 'general-news', description: 'Daily Happenings across Nigeria & the Globe' },
    { name: 'Breaking News', slug: 'breaking-news', description: 'Verified Urgent Breaking Headlines' },
  ];

  const catMap = {};
  for (const c of targetCategories) {
    let cat = await prisma.category.findUnique({ where: { slug: c.slug } });
    if (!cat) {
      cat = await prisma.category.findUnique({ where: { name: c.name } });
    }
    if (!cat) {
      cat = await prisma.category.create({
        data: { name: c.name, slug: c.slug, description: c.description }
      });
      console.log(`  + Created: "${cat.name}" (slug: ${cat.slug}, ID: ${cat.id})`);
    } else {
      cat = await prisma.category.update({
        where: { id: cat.id },
        data: { name: c.name, slug: c.slug, description: c.description }
      });
      console.log(`  ✓ Updated: "${cat.name}" (slug: ${cat.slug}, ID: ${cat.id})`);
    }
    catMap[c.slug] = cat.id;
  }

  // STEP 2: Remove Junk Categories
  console.log('\n[2/5] Cleaning up obsolete/junk categories...');
  const junkSlugs = [
    'appreciation',
    'bilateral',
    'birthday-wishes',
    'sad-story',
    'press-statement',
    'religious',
    'pap-news',
    'local-news',
    'news',
    'gist',
    'law',
    'health'
  ];

  const generalCatId = catMap['general-news'];
  for (const slug of junkSlugs) {
    const cat = await prisma.category.findUnique({
      where: { slug },
      include: { posts: { select: { id: true } } }
    });

    if (cat) {
      console.log(`  Found junk category "${cat.name}" (${cat.slug}, ID: ${cat.id}) with ${cat.posts.length} posts.`);
      // Unlink RSS feeds
      await prisma.rssFeed.deleteMany({ where: { categoryId: cat.id } });

      if (cat.posts.length > 0) {
        // Reassign posts to general news instead of losing them completely
        await prisma.post.updateMany({
          where: { categoryId: cat.id },
          data: { categoryId: generalCatId }
        });
        console.log(`    Reassigned ${cat.posts.length} posts to General News.`);
      }

      await prisma.category.delete({ where: { id: cat.id } });
      console.log(`    ✓ Deleted category record: "${cat.name}"`);
    }
  }

  // STEP 3: Re-classify Posts by Keyword into Relevant Categories
  console.log('\n[3/5] Re-distributing articles into specific categories via keyword intelligence...');
  const keywordMappings = [
    {
      slug: 'entertainment',
      terms: ['nollywood', 'wizkid', 'davido', 'burna', 'tiwa', 'bbnaija', 'asake', 'rema', 'actress', 'actor', 'grammy', 'afrobeats', 'album', 'celebrity', 'gist', 'funke akindele', 'omoni oboli', 'mo abudu', 'music video', 'nollywood film', 'portable', 'vector', 'odumodublvck', 'ay makun', 'singer', 'song', 'filmmaker', 'box office', 'hit song', 'cinema', 'premiere']
    },
    {
      slug: 'business',
      terms: ['cbn', 'naira', 'dollar', 'inflation', 'dangote', 'crude oil', 'nnpcl', 'revenue', 'tax', 'stock exchange', 'gdp', 'forex', 'interest rate', 'banking', 'fintech', 'economy', 'investors', 'opec', 'subsidy', 'customs revenue', 'export', 'import', 'firs', 'monetary policy', 'central bank', 'dividend', 'refinery']
    },
    {
      slug: 'sports',
      terms: ['super eagles', 'osimhen', 'chelsea', 'arsenal', 'manchester', 'premier league', 'champions league', 'afcon', 'fifa', 'football', 'striker', 'coach', 'nff', 'ballon', 'madrid', 'barcelona', 'epl', 'lookman', 'boniface', 'championship', 'serie a', 'la liga', 'bundesliga', 'winger', 'midfielder', 'wimbledon', 'olympic', 'boxing', 'trophy']
    },
    {
      slug: 'politics',
      terms: ['tinubu', 'shettima', 'senate', 'house of reps', 'akpabio', 'apc', 'pdp', 'labour party', 'inec', 'governor', 'minister', 'federal government', 'fct minister', 'wike', 'sanwo-olu', 'fubara', 'national assembly', 'presidency', 'election', 'senator', 'legislature', 'buhari', 'atiku', 'peter obi', 'tribunal', 'lawmaker']
    },
    {
      slug: 'metro',
      terms: ['police', 'efcc', 'court', 'trial', 'arrested', 'kidnap', 'gunmen', 'lagos traffic', 'dss', 'customs', 'ndlea', 'suspects', 'judiciary', 'nabbed', 'robbery', 'accident', 'remanded', 'high court', 'supreme court', 'judge', 'commuters', 'flood', 'tragedy', 'fire outbreak', 'hoodlums']
    },
    {
      slug: 'technology',
      terms: ['artificial intelligence', 'startup', 'mtn', 'airtel', 'tech', 'software', 'cybersecurity', 'telecoms', 'starlink', 'glo', 'fintech startup', 'ncc', '5g network', 'app', 'data privacy', 'crypto', 'blockchain']
    }
  ];

  const sourceCategoryIds = [catMap['general-news'], catMap['breaking-news']].filter(Boolean);

  for (const k of keywordMappings) {
    const targetCatId = catMap[k.slug];
    if (!targetCatId) continue;

    const orConditions = k.terms.map(t => ({ title: { contains: t, mode: 'insensitive' } }));
    const updateResult = await prisma.post.updateMany({
      where: {
        categoryId: { in: sourceCategoryIds },
        OR: orConditions
      },
      data: { categoryId: targetCatId }
    });
    console.log(`  ✓ Transferred ${updateResult.count} posts -> ${k.slug.toUpperCase()}`);
  }

  // STEP 4: Purge 60% of Scraped Vanguard & Punch Posts
  console.log('\n[4/5] Purging oldest 60% of scraped Vanguard and Punch articles...');

  // A. Vanguard (~6,100 posts)
  console.log('  Fetching oldest Vanguard posts...');
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
  console.log(`  Found ${oldestVanguard.length} Vanguard posts to remove.`);
  await safeDeletePosts(oldestVanguard.map(p => p.id), 'Oldest Vanguard Posts');

  // B. Punch (~8,100 posts)
  console.log('  Fetching oldest Punch posts...');
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
  console.log(`  Found ${oldestPunch.length} Punch posts to remove.`);
  await safeDeletePosts(oldestPunch.map(p => p.id), 'Oldest Punch Posts');

  // STEP 5: Final Taxonomy & Post Counts
  console.log('\n[5/5] Final Database Taxonomy & Story Counts:');
  const finalTotal = await prisma.post.count();
  const allCategories = await prisma.category.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { posts: { _count: 'desc' } }
  });

  console.log(`\n  >>> Total Active Stories in Database: ${finalTotal} <<<`);
  for (const c of allCategories) {
    console.log(`  * "${c.name}" (${c.slug}): ${c._count.posts} stories`);
  }

  console.log('\n========================================================');
  console.log('   DATABASE RESTRUCTURING & PURGE COMPLETED SUCCESSFULLY!');
  console.log('========================================================');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
