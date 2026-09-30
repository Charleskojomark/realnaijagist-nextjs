const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  for (let i = 0; i < 5; i++) {
    try {
      await prisma.$connect();
      const count = await prisma.category.count();
      console.log('Successfully connected! Category count:', count);
      return;
    } catch (e) {
      console.log(`Attempt ${i + 1} failed: ${e.message}. Retrying in 2s...`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
