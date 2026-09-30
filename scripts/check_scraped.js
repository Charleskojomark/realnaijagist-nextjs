const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const vanguardCount = await prisma.post.count({
    where: {
      OR: [
        { content: { contains: 'Vanguard', mode: 'insensitive' } },
        { excerpt: { contains: 'Vanguard', mode: 'insensitive' } },
      ]
    }
  });

  const punchCount = await prisma.post.count({
    where: {
      OR: [
        { content: { contains: 'Punch', mode: 'insensitive' } },
        { excerpt: { contains: 'Punch', mode: 'insensitive' } },
      ]
    }
  });

  const oldestVanguard = await prisma.post.findFirst({
    where: {
      OR: [
        { content: { contains: 'Vanguard', mode: 'insensitive' } },
        { excerpt: { contains: 'Vanguard', mode: 'insensitive' } },
      ]
    },
    orderBy: { createdAt: 'asc' },
    select: { id: true, createdAt: true, title: true }
  });

  const newestVanguard = await prisma.post.findFirst({
    where: {
      OR: [
        { content: { contains: 'Vanguard', mode: 'insensitive' } },
        { excerpt: { contains: 'Vanguard', mode: 'insensitive' } },
      ]
    },
    orderBy: { createdAt: 'desc' },
    select: { id: true, createdAt: true, title: true }
  });

  console.log(`Vanguard count: ${vanguardCount}`);
  console.log('Oldest Vanguard:', oldestVanguard);
  console.log('Newest Vanguard:', newestVanguard);

  console.log(`Punch count: ${punchCount}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
