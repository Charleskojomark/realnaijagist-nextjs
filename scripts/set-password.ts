import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const username = process.argv[2]
  const newPassword = process.argv[3]

  if (!username || !newPassword) {
    console.error('Usage: npx tsx scripts/set-password.ts <username_or_email> <new_password>')
    process.exit(1)
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username: { equals: username, mode: 'insensitive' } },
        { email: { equals: username, mode: 'insensitive' } },
      ],
    },
  })

  if (!user) {
    console.error(`User "${username}" not found in database!`)
    process.exit(1)
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10)

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: hashedPassword,
      isStaff: true,
      isActive: true,
    },
  })

  console.log(`✅ Successfully updated password for user "${user.username}" (${user.email || 'No email'})!`)
  console.log(`Staff status: ACTIVE & VERIFIED`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
