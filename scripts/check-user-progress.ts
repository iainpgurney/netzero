import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking user progress...\n')

  try {
    // Get all users
    const users = await prisma.user.findMany({
      include: {
        progress: {
          include: {
            module: {
              include: {
                course: true,
              },
            },
          },
        },
        badges: {
          include: {
            module: {
              include: {
                course: true,
              },
            },
          },
        },
        certificates: {
          include: {
            course: true,
            module: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (users.length === 0) {
      console.log('❌ No users found in database')
      process.exit(1)
    }

    console.log(`📊 Found ${users.length} user(s):\n`)

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name || 'Unnamed'} (${user.email || 'No email'})`)
      console.log(`   User ID: ${user.id}`)
      console.log(`   Created: ${user.createdAt.toLocaleDateString()}`)
      
      const completedModules = user.progress.filter((p) => p.completed)
      const totalProgress = user.progress.length
      
      console.log(`   📚 Progress: ${completedModules.length} completed module(s) out of ${totalProgress} started`)
      
      if (completedModules.length > 0) {
        console.log(`   ✅ Completed modules:`)
        completedModules.forEach((progress) => {
          const completedDate = progress.completedAt 
            ? progress.completedAt.toLocaleDateString() 
            : 'Unknown date'
          console.log(`      - ${progress.module.course.title}: ${progress.module.title} (${completedDate})`)
        })
      }
      
      if (user.badges.length > 0) {
        console.log(`   🏆 Badges earned: ${user.badges.length}`)
        user.badges.forEach((badge) => {
          console.log(`      - ${badge.module.badgeEmoji} ${badge.module.badgeName}`)
        })
      }
      
      if (user.certificates.length > 0) {
        console.log(`   📜 Certificates: ${user.certificates.length}`)
        user.certificates.forEach((cert) => {
          const certType = cert.moduleId ? 'Module' : 'Course'
          const certName = cert.module 
            ? `${cert.course.title}: ${cert.module.title}`
            : cert.course.title
          console.log(`      - ${certType}: ${certName}`)
        })
      }
      
      console.log('')
    })

    // Summary
    const allProgress = await prisma.userProgress.findMany({
      where: {
        completed: true,
      },
      include: {
        module: {
          include: {
            course: true,
          },
        },
        user: true,
      },
    })

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`📈 Overall Summary:`)
    console.log(`   Total users: ${users.length}`)
    console.log(`   Total completed modules: ${allProgress.length}`)
    console.log(`   Total badges earned: ${await prisma.badge.count()}`)
    console.log(`   Total certificates: ${await prisma.certificate.count()}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    if (allProgress.length === 0) {
      console.log('⚠️  No completed modules found. If you had completed modules before,')
      console.log('   they were likely lost when the database was reset/reseeded.')
      console.log('   The seed script deletes all UserProgress records before recreating courses.')
    }
  } catch (error) {
    console.error('❌ Error:', error)
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

