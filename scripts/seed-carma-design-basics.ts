import { PrismaClient } from '@prisma/client'
import { seedCarmaDesignBasics } from '../lib/learning/seed-carma-design-basics'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Carma Design Basics course...')
  await seedCarmaDesignBasics(prisma)
  console.log('✅ Carma Design Basics seeded (slug: carma-design-basics)')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
