import { PrismaClient } from '@prisma/client'

// Check DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set!')
  console.error('\nSet it in .env.local or run:')
  console.error('  $env:DATABASE_URL="your-connection-string"')
  process.exit(1)
}

// Use singleton pattern to avoid connection issues
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['error', 'warn'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

async function cleanupDuplicateCertificates() {
  console.log('🔍 Starting certificate cleanup...')

  try {
    // Get all course-level certificates (moduleId is null)
    const courseCertificates = await prisma.certificate.findMany({
      where: {
        moduleId: null,
      },
      orderBy: {
        issuedAt: 'desc',
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    })

    console.log(`📊 Found ${courseCertificates.length} total course-level certificates`)

    // Group by userId and courseId
    const grouped = new Map<string, typeof courseCertificates>()

    for (const cert of courseCertificates) {
      const key = `${cert.userId}-${cert.courseId}`
      if (!grouped.has(key)) {
        grouped.set(key, [])
      }
      grouped.get(key)!.push(cert)
    }

    // Find duplicates
    const duplicates: Array<{
      userId: string
      courseId: string
      certificates: typeof courseCertificates
    }> = []

    for (const [key, certs] of grouped.entries()) {
      if (certs.length > 1) {
        const [userId, courseId] = key.split('-')
        duplicates.push({
          userId,
          courseId,
          certificates: certs,
        })
      }
    }

    console.log(`🔎 Found ${duplicates.length} user-course combinations with duplicates`)

    if (duplicates.length === 0) {
      console.log('✅ No duplicates found!')
      return
    }

    // Delete duplicates, keeping the most recent one
    let deletedCount = 0

    for (const duplicate of duplicates) {
      const certs = duplicate.certificates
      const course = certs[0].course
      const user = certs[0].user

      // Keep the most recent one (first in array since we sorted by issuedAt desc)
      const keepCert = certs[0]
      const deleteCerts = certs.slice(1)

      console.log(
        `\n👤 User: ${user.email || user.name || user.id}`
      )
      console.log(`📚 Course: ${course.title}`)
      console.log(`✅ Keeping certificate: ${keepCert.id} (issued: ${keepCert.issuedAt.toISOString()})`)
      console.log(`❌ Deleting ${deleteCerts.length} duplicate(s):`)

      for (const certToDelete of deleteCerts) {
        console.log(`   - ${certToDelete.id} (issued: ${certToDelete.issuedAt.toISOString()})`)
        await prisma.certificate.delete({
          where: {
            id: certToDelete.id,
          },
        })
        deletedCount++
      }
    }

    console.log(`\n✅ Cleanup complete! Deleted ${deletedCount} duplicate certificate(s).`)

    // Also delete any remaining module-level certificates
    const moduleCertificates = await prisma.certificate.findMany({
      where: {
        moduleId: { not: null },
      },
      include: {
        course: {
          select: {
            title: true,
          },
        },
        user: {
          select: {
            email: true,
          },
        },
      },
    })

    if (moduleCertificates.length > 0) {
      console.log(`\n🗑️  Found ${moduleCertificates.length} module-level certificate(s) to remove:`)
      for (const cert of moduleCertificates) {
        console.log(`   - ${cert.id} (Course: ${cert.course.title}, User: ${cert.user.email || 'N/A'})`)
        await prisma.certificate.delete({
          where: {
            id: cert.id,
          },
        })
      }
      console.log(`✅ Deleted ${moduleCertificates.length} module-level certificate(s).`)
    }

    // Final summary
    const remainingCertificates = await prisma.certificate.findMany({
      where: {
        moduleId: null,
      },
      include: {
        course: {
          select: {
            title: true,
          },
        },
        user: {
          select: {
            email: true,
          },
        },
      },
    })

    console.log(`\n📊 Final count: ${remainingCertificates.length} course-level certificate(s) remaining`)
    console.log('\nCertificate breakdown by course:')
    const courseCounts = new Map<string, number>()
    for (const cert of remainingCertificates) {
      const courseTitle = cert.course.title
      courseCounts.set(courseTitle, (courseCounts.get(courseTitle) || 0) + 1)
    }
    for (const [courseTitle, count] of courseCounts.entries()) {
      console.log(`   - ${courseTitle}: ${count} certificate(s)`)
    }
  } catch (error) {
    console.error('❌ Error during cleanup:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the cleanup
cleanupDuplicateCertificates()
  .then(() => {
    console.log('\n✨ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error)
    process.exit(1)
  })

