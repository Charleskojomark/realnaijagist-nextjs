const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  await prisma.$connect();
  const metro = await prisma.category.findUnique({ where: { slug: 'metro' } });
  const opinion = await prisma.category.findUnique({ where: { slug: 'opinion' } });
  
  const crime = await prisma.category.findUnique({ where: { slug: 'crime' } });
  if (crime && metro) {
    await prisma.post.updateMany({ where: { categoryId: crime.id }, data: { categoryId: metro.id } });
    await prisma.rssFeed.deleteMany({ where: { categoryId: crime.id } });
    await prisma.category.delete({ where: { id: crime.id } });
    console.log('Merged Crime -> Metro & Security');
  }

  const editorial = await prisma.category.findUnique({ where: { slug: 'editorial' } });
  if (editorial && opinion) {
    await prisma.post.updateMany({ where: { categoryId: editorial.id }, data: { categoryId: opinion.id } });
    await prisma.rssFeed.deleteMany({ where: { categoryId: editorial.id } });
    await prisma.category.delete({ where: { id: editorial.id } });
    console.log('Merged Editorial -> Opinion & Editorial');
  }

  // Also assign 50 thought leadership posts to Opinion & Editorial
  const opinionPosts = await prisma.post.findMany({
    where: {
      categoryId: metro?.id,
      OR: [
        { title: { contains: 'opinion', mode: 'insensitive' } },
        { title: { contains: 'editorial', mode: 'insensitive' } },
        { title: { contains: 'why nigeria', mode: 'insensitive' } },
        { title: { contains: 'perspective', mode: 'insensitive' } },
      ]
    },
    take: 50,
    select: { id: true }
  });
  if (opinionPosts.length > 0 && opinion) {
    await prisma.post.updateMany({
      where: { id: { in: opinionPosts.map(p => p.id) } },
      data: { categoryId: opinion.id }
    });
    console.log(`Transferred ${opinionPosts.length} posts -> Opinion & Editorial`);
  }

  const finalCats = await prisma.category.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { posts: { _count: 'desc' } }
  });
  console.log('\nFinal Clean Categories:');
  for (const c of finalCats) {
    console.log(`- ${c.name} (${c.slug}): ${c._count.posts}`);
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());
