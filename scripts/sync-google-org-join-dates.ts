/**
 * Sync googleOrgJoinDate for all users with email (from Google Admin API creationTime).
 * Run: npx tsx scripts/sync-google-org-join-dates.ts
 */
import { PrismaClient } from '@prisma/client'
import { syncUserGoogleOrgJoinDate, isGoogleAdminConfigured } from '../server/google-admin'

const prisma = new PrismaClient()

async function main() {
  if (!isGoogleAdminConfigured()) {
    console.error('Google Admin SDK not configured. Set GOOGLE_SA_CLIENT_EMAIL and GOOGLE_SA_PRIVATE_KEY.')
    process.exit(1)
  }

  const users = await prisma.user.findMany({
    where: { email: { not: null } },
    select: { id: true, name: true, email: true, googleOrgJoinDate: true },
  })

  console.log(`Found ${users.length} users with email. Syncing googleOrgJoinDate from Google...\n`)

  let synced = 0
  let skipped = 0
  let errors = 0

  for (const user of users) {
    const email = user.email!
    if (user.googleOrgJoinDate) {
      console.log(`  ${user.name} (${email}): already has ${user.googleOrgJoinDate.toISOString().slice(0, 10)}`)
      skipped++
      continue
    }

    try {
      const result = await syncUserGoogleOrgJoinDate(user.id, email)
      if (result) {
        const twoYearsAgo = new Date()
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)
        const getsBonus = result <= twoYearsAgo ? 'YES (+2 days)' : 'no'
        console.log(`  ${user.name} (${email}): synced ${result.toISOString().slice(0, 10)} - Carma bonus: ${getsBonus}`)
        synced++
      } else {
        console.log(`  ${user.name} (${email}): not found in Google or no creationTime`)
        skipped++
      }
    } catch (e) {
      console.error(`  ${user.name} (${email}): ERROR`, e)
      errors++
    }
  }

  console.log(`\nDone: ${synced} synced, ${skipped} skipped, ${errors} errors`)
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
