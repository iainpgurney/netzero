import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Testing login setup...\n')

  try {
    // Check if demo user exists
    const user = await prisma.user.findUnique({
      where: { email: 'demo@netzero.com' },
    })

    if (!user) {
      console.log('❌ Demo user NOT found!')
      console.log('   Run: npm run create-demo-user')
      process.exit(1)
    }

    console.log('✅ Demo user found:')
    console.log(`   ID: ${user.id}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Name: ${user.name}`)
    console.log(`   Created: ${user.createdAt}`)
    console.log('\n✅ Login should work!')
    console.log('   Email: demo@netzero.com')
    console.log('   Password: demo123')
  } catch (error) {
    console.error('❌ Error:', error)
    if (error instanceof Error && error.message.includes('DATABASE_URL')) {
      console.error('\n⚠️  Database connection issue!')
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

