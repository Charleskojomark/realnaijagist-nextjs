const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const username = process.argv[2];
  const newPassword = process.argv[3];

  if (!username || !newPassword) {
    console.error('Usage: node --env-file=.env scripts/set-password.js <username_or_email> <new_password>');
    process.exit(1);
  }

  // Retry logic for Neon serverless pooler
  let user = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { username: { equals: username, mode: 'insensitive' } },
            { email: { equals: username, mode: 'insensitive' } },
          ],
        },
      });
      break;
    } catch (err) {
      console.log(`Attempt ${attempt} failed, retrying... (${err.message})`);
      await new Promise(r => setTimeout(r, 1500));
    }
  }

  if (!user) {
    console.error(`User "${username}" not found in database!`);
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: hashedPassword,
      isStaff: true,
      isActive: true,
    },
  });

  console.log(`✅ Successfully updated password for user "${user.username}" (${user.email || 'No email'})!`);
  console.log(`Staff status: ACTIVE & VERIFIED`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
