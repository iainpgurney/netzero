import { google } from 'googleapis'
import { prisma } from './db'

// ==========================================
// Google Admin SDK - Directory API Integration
//
// Fetches a user's Organizational Unit (OU) from Google Workspace
// and maps it to a platform department.
//
// Setup Requirements:
// 1. Create a Service Account in Google Cloud Console
// 2. Enable the Admin SDK API
// 3. Grant domain-wide delegation to the service account
// 4. In Google Admin Console, authorise the service account with scope:
//    https://www.googleapis.com/auth/admin.directory.user.readonly
// 5. Set these environment variables:
//    - GOOGLE_SA_CLIENT_EMAIL  (service account email)
//    - GOOGLE_SA_PRIVATE_KEY   (service account private key, with \n for newlines)
//    - GOOGLE_ADMIN_EMAIL      (admin email to impersonate, e.g., iain.gurney@carma.earth)
// ==========================================

const SA_CLIENT_EMAIL = process.env.GOOGLE_SA_CLIENT_EMAIL?.trim()
const SA_PRIVATE_KEY = process.env.GOOGLE_SA_PRIVATE_KEY?.replace(/\\n/g, '\n')?.trim()
const ADMIN_EMAIL = process.env.GOOGLE_ADMIN_EMAIL?.trim() || 'iain.gurney@carma.earth'

// Check if Google Admin SDK is configured
export function isGoogleAdminConfigured(): boolean {
  return !!(SA_CLIENT_EMAIL && SA_PRIVATE_KEY)
}

// Create an authenticated Admin SDK client
function getAdminClient() {
  if (!SA_CLIENT_EMAIL || !SA_PRIVATE_KEY) {
    return null
  }

  const auth = new google.auth.JWT({
    email: SA_CLIENT_EMAIL,
    key: SA_PRIVATE_KEY,
    scopes: ['https://www.googleapis.com/auth/admin.directory.user.readonly'],
    subject: ADMIN_EMAIL, // Impersonate admin user for domain-wide delegation
  })

  return google.admin({ version: 'directory_v1', auth })
}

/**
 * Fetch a user's Organizational Unit path from Google Workspace
 * Returns the OU path string (e.g., "/C-Suite", "/Finance") or null
 */
export async function fetchGoogleUserOU(email: string): Promise<string | null> {
  try {
    const admin = getAdminClient()
    if (!admin) {
      console.log('[GOOGLE ADMIN] Service account not configured, skipping OU lookup')
      return null
    }

    const response = await admin.users.get({
      userKey: email,
      projection: 'basic',
    })

    const ouPath = response.data.orgUnitPath || null
    console.log(`[GOOGLE ADMIN] OU for ${email}: ${ouPath}`)
    return ouPath
  } catch (error: any) {
    if (error?.code === 404) {
      console.log(`[GOOGLE ADMIN] User not found in Google Workspace: ${email}`)
    } else if (error?.code === 403) {
      console.error('[GOOGLE ADMIN] Permission denied. Check service account delegation and scopes.')
    } else {
      console.error('[GOOGLE ADMIN] Error fetching user OU:', error?.message || error)
    }
    return null
  }
}

/**
 * Map a Google OU path to a platform Department.
 * 
 * Matching strategy:
 * 1. Exact match on googleOUPath field
 * 2. OU path ends with department name (e.g., "/UK/Finance" matches "Finance")
 * 3. Case-insensitive slug match on the last segment of the OU path
 */
export async function mapOUToDepartment(ouPath: string): Promise<string | null> {
  if (!ouPath || ouPath === '/') {
    return null // Root OU, no specific department
  }

  try {
    // 1. Try exact match on googleOUPath
    const exactMatch = await prisma.department.findFirst({
      where: {
        googleOUPath: ouPath,
        isActive: true,
      },
    })
    if (exactMatch) {
      console.log(`[GOOGLE ADMIN] Exact OU match: ${ouPath} → ${exactMatch.name}`)
      return exactMatch.id
    }

    // 2. Try matching the last segment of the OU path
    // e.g., "/UK/C-Suite" → "C-Suite", "/Marketing" → "Marketing"
    const segments = ouPath.split('/').filter(Boolean)
    const lastSegment = segments[segments.length - 1]
    if (!lastSegment) return null

    // Normalise for comparison
    const normalised = lastSegment.toLowerCase().replace(/[\s_]+/g, '-')

    // Try slug match
    const slugMatch = await prisma.department.findFirst({
      where: {
        slug: normalised,
        isActive: true,
      },
    })
    if (slugMatch) {
      console.log(`[GOOGLE ADMIN] Slug match: ${ouPath} (${normalised}) → ${slugMatch.name}`)
      return slugMatch.id
    }

    // Try case-insensitive name match
    const allDepts = await prisma.department.findMany({
      where: { isActive: true },
    })
    const nameMatch = allDepts.find(
      (d) => d.name.toLowerCase() === lastSegment.toLowerCase()
    )
    if (nameMatch) {
      console.log(`[GOOGLE ADMIN] Name match: ${ouPath} (${lastSegment}) → ${nameMatch.name}`)
      return nameMatch.id
    }

    // Try partial match (e.g., "Customer Services" vs "CustomerServices" or "Customer-Services")
    const fuzzyMatch = allDepts.find((d) => {
      const deptNorm = d.name.toLowerCase().replace(/[\s_-]+/g, '')
      const ouNorm = lastSegment.toLowerCase().replace(/[\s_-]+/g, '')
      return deptNorm === ouNorm
    })
    if (fuzzyMatch) {
      console.log(`[GOOGLE ADMIN] Fuzzy match: ${ouPath} → ${fuzzyMatch.name}`)
      return fuzzyMatch.id
    }

    console.log(`[GOOGLE ADMIN] No department match for OU: ${ouPath}`)
    return null
  } catch (error) {
    console.error('[GOOGLE ADMIN] Error mapping OU to department:', error)
    return null
  }
}

/**
 * Full pipeline: Fetch a user's Google OU and assign them to the matching department.
 * Returns the department ID if assigned, null otherwise.
 */
export async function syncUserDepartmentFromGoogle(
  userId: string,
  email: string
): Promise<{ departmentId: string | null; departmentName: string | null }> {
  try {
    // Fetch OU from Google Admin
    const ouPath = await fetchGoogleUserOU(email)
    if (!ouPath) {
      return { departmentId: null, departmentName: null }
    }

    // Map OU to department
    const departmentId = await mapOUToDepartment(ouPath)
    if (!departmentId) {
      return { departmentId: null, departmentName: null }
    }

    // Update user's department
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { departmentId },
      include: {
        department: {
          select: { name: true },
        },
      },
    })

    console.log(
      `[GOOGLE ADMIN] Synced ${email}: OU="${ouPath}" → Department="${updatedUser.department?.name}"`
    )

    return {
      departmentId,
      departmentName: updatedUser.department?.name || null,
    }
  } catch (error) {
    console.error('[GOOGLE ADMIN] Error syncing user department:', error)
    return { departmentId: null, departmentName: null }
  }
}

/**
 * Fetch all users from Google Workspace directory.
 * Returns an array of Google user objects with email, name, OU, and photo.
 */
async function fetchAllGoogleWorkspaceUsers() {
  const admin = getAdminClient()
  if (!admin) {
    console.log('[GOOGLE ADMIN] Service account not configured, cannot list users')
    return []
  }

  const allUsers: any[] = []
  let pageToken: string | undefined

  try {
    do {
      const response = await admin.users.list({
        domain: ADMIN_EMAIL?.split('@')[1] || 'carma.earth',
        maxResults: 200,
        projection: 'basic',
        pageToken,
      })

      if (response.data.users) {
        allUsers.push(...response.data.users)
      }
      pageToken = response.data.nextPageToken || undefined
    } while (pageToken)

    console.log(`[GOOGLE ADMIN] Fetched ${allUsers.length} users from Google Workspace`)
    return allUsers
  } catch (error: any) {
    console.error('[GOOGLE ADMIN] Error listing Google Workspace users:', error?.message || error)
    return []
  }
}

/**
 * Bulk sync all Google Workspace users:
 * 1. Fetches ALL users from Google Workspace directory
 * 2. Creates new users in the database if they don't exist
 * 3. Maps their Google OU to a platform department
 */
export async function syncAllGoogleUserDepartments(): Promise<{
  synced: number
  created: number
  skipped: number
  errors: number
}> {
  const stats = { synced: 0, created: 0, skipped: 0, errors: 0 }

  try {
    // Step 1: Fetch all users from Google Workspace
    const googleUsers = await fetchAllGoogleWorkspaceUsers()

    if (googleUsers.length === 0) {
      console.log('[GOOGLE ADMIN] No users found in Google Workspace, falling back to existing users')
      // Fallback: sync only existing users with Google accounts
      const usersWithGoogle = await prisma.account.findMany({
        where: { provider: 'google' },
        include: {
          user: {
            select: { id: true, email: true, departmentId: true },
          },
        },
      })

      for (const account of usersWithGoogle) {
        if (!account.user?.email) {
          stats.skipped++
          continue
        }
        try {
          const result = await syncUserDepartmentFromGoogle(account.user.id, account.user.email)
          if (result.departmentId) {
            stats.synced++
          } else {
            stats.skipped++
          }
        } catch (error) {
          stats.errors++
          console.error(`[GOOGLE ADMIN] Error syncing ${account.user.email}:`, error)
        }
      }
      return stats
    }

    // Step 2: Process each Google Workspace user
    for (const gUser of googleUsers) {
      const email = gUser.primaryEmail?.toLowerCase()
      if (!email) {
        stats.skipped++
        continue
      }

      // Skip suspended users
      if (gUser.suspended) {
        console.log(`[GOOGLE ADMIN] Skipping suspended user: ${email}`)
        stats.skipped++
        continue
      }

      try {
        // Find or create user in our database
        let dbUser = await prisma.user.findUnique({
          where: { email },
        })

        if (!dbUser) {
          // Create new user from Google Workspace
          const fullName = gUser.name
            ? `${gUser.name.givenName || ''} ${gUser.name.familyName || ''}`.trim()
            : email.split('@')[0]

          dbUser = await prisma.user.create({
            data: {
              email,
              name: fullName || null,
              image: gUser.thumbnailPhotoUrl || null,
              emailVerified: new Date(),
            },
          })
          console.log(`[GOOGLE ADMIN] Created new user: ${email} (${fullName})`)
          stats.created++
        }

        // Step 3: Map OU to department
        const ouPath = gUser.orgUnitPath || null
        if (ouPath && ouPath !== '/') {
          const departmentId = await mapOUToDepartment(ouPath)
          if (departmentId && departmentId !== dbUser.departmentId) {
            const updatedUser = await prisma.user.update({
              where: { id: dbUser.id },
              data: { departmentId },
              include: { department: { select: { name: true } } },
            })
            console.log(
              `[GOOGLE ADMIN] Synced ${email}: OU="${ouPath}" → Department="${updatedUser.department?.name}"`
            )
            stats.synced++
          } else if (departmentId) {
            // Already in correct department
            stats.skipped++
          } else {
            console.log(`[GOOGLE ADMIN] No department match for ${email}: OU="${ouPath}"`)
            stats.skipped++
          }
        } else {
          stats.skipped++
        }
      } catch (error) {
        stats.errors++
        console.error(`[GOOGLE ADMIN] Error processing ${email}:`, error)
      }
    }
  } catch (error) {
    console.error('[GOOGLE ADMIN] Error in bulk sync:', error)
  }

  return stats
}
