import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Creating demo user...')

  try {
    const demoUser = await prisma.user.upsert({
      where: { email: 'demo@netzero.com' },
      update: {},
      create: {
        email: 'demo@netzero.com',
        name: 'Demo User',
        emailVerified: new Date(),
      },
    })

    console.log('✅ Demo user created/updated successfully!')
    console.log(`   Email: ${demoUser.email}`)
    console.log(`   Name: ${demoUser.name}`)
    console.log(`   ID: ${demoUser.id}`)
  } catch (error) {
    console.error('❌ Error creating demo user:', error)
    if (error instanceof Error && error.message.includes('DATABASE_URL')) {
      console.error('\n⚠️  Make sure you have DATABASE_URL set in your .env.local file!')
    }
    process.exit(1)
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

