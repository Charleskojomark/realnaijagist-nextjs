const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const totalPosts = await prisma.post.count();
  console.log(`Total Posts in DB: ${totalPosts}`);

  const categories = await prisma.category.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { posts: { _count: 'desc' } }
  });

  console.log(`\nAll Categories (${categories.length}):`);
  for (const c of categories) {
    console.log(`  ID ${c.id}: "${c.name}" (slug: ${c.slug}) -> ${c._count.posts} posts`);
  }

  // Check Vanguard and Punch references
  const vanguardCount = await prisma.post.count({
    where: {
      OR: [
        { title: { contains: 'Vanguard', mode: 'insensitive' } },
        { content: { contains: 'Vanguard', mode: 'insensitive' } },
        { excerpt: { contains: 'Vanguard', mode: 'insensitive' } },
      ]
    }
  });

  const punchCount = await prisma.post.count({
    where: {
      OR: [
        { title: { contains: 'Punch', mode: 'insensitive' } },
        { content: { contains: 'Punch', mode: 'insensitive' } },
        { excerpt: { contains: 'Punch', mode: 'insensitive' } },
      ]
    }
  });

  console.log(`\nPosts referencing Vanguard: ${vanguardCount}`);
  console.log(`Posts referencing Punch: ${punchCount}`);

  // Sample some posts
  const sampleVanguard = await prisma.post.findMany({
    where: { content: { contains: 'Vanguard', mode: 'insensitive' } },
    take: 3,
    select: { id: true, title: true, slug: true, category: { select: { name: true } } }
  });
  console.log('\nSample Vanguard Posts:');
  console.log(JSON.stringify(sampleVanguard, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
