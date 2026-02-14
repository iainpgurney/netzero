import { PrismaClient } from '@prisma/client'
import { prisma } from '../server/db/prisma'

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
}

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logSection(title: string) {
  console.log('\n' + '='.repeat(60))
  log(title, 'bold')
  console.log('='.repeat(60))
}

function logTest(name: string, passed: boolean, details?: string) {
  const icon = passed ? '✅' : '❌'
  const color = passed ? 'green' : 'red'
  log(`${icon} ${name}`, color)
  if (details) {
    console.log(`   ${details}`)
  }
}

interface TestResult {
  name: string
  passed: boolean
  details?: string
  error?: string
}

const results: TestResult[] = []

async function testDatabaseConnection(): Promise<TestResult> {
  try {
    logSection('1. Database Connection Test')
    
    logTest('Checking DATABASE_URL environment variable...', true)
    
    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) {
      return {
        name: 'DATABASE_URL environment variable',
        passed: false,
        error: 'DATABASE_URL is not set',
        details: 'Set DATABASE_URL in .env.local or environment variables',
      }
    }
    
    logTest('DATABASE_URL is set', true)
    log(`   URL preview: ${dbUrl.substring(0, 30)}...`, 'cyan')
    
    // Validate URL format
    if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
      return {
        name: 'DATABASE_URL format',
        passed: false,
        error: 'Invalid DATABASE_URL format',
        details: 'DATABASE_URL must start with postgresql:// or postgres://',
      }
    }
    
    logTest('DATABASE_URL format is valid', true)
    
    // Test actual connection

    logTest('Testing database connection...', true)
    const startTime = Date.now()
    await prisma.$queryRaw`SELECT 1 as test`
    const connectionTime = Date.now() - startTime
    
    logTest('Database connection successful', true, `Connected in ${connectionTime}ms`)
    
    return {
      name: 'Database Connection',
      passed: true,
      details: `Connected successfully in ${connectionTime}ms`,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return {
      name: 'Database Connection',
      passed: false,
      error: errorMessage,
      details: 'Failed to connect to database. Check DATABASE_URL and network connectivity.',
    }
  }
}

async function testDatabaseSchema(): Promise<TestResult[]> {
  const schemaResults: TestResult[] = []
  
  try {
    logSection('2. Database Schema Integrity Test')
    
    // Test all main tables exist and are accessible
    // Map schema model names to Prisma Client camelCase names
    const tableMap: Record<string, string> = {
      'User': 'user',
      'Course': 'course',
      'Module': 'module',
      'Quiz': 'quiz',
      'UserProgress': 'userProgress',
      'Badge': 'badge',
      'Certificate': 'certificate',
      'QuizAttempt': 'quizAttempt',
      'GreenwashingSearch': 'greenwashingSearch',
      'GreenwashingFeedback': 'greenwashingFeedback',
    }
    
    for (const [tableName, modelName] of Object.entries(tableMap)) {
      try {
        // Try to query each table using Prisma Client camelCase names
        const model = modelName as keyof PrismaClient
        if (model in prisma) {
          const count = await (prisma[model] as any).count()
          logTest(`Table ${tableName}`, true, `Found ${count} records`)
          schemaResults.push({
            name: `Table ${tableName}`,
            passed: true,
            details: `${count} records`,
          })
        } else {
          logTest(`Table ${tableName}`, false, 'Model not found in Prisma Client')
          schemaResults.push({
            name: `Table ${tableName}`,
            passed: false,
            error: 'Model not found',
          })
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        logTest(`Table ${tableName}`, false, errorMessage)
        schemaResults.push({
          name: `Table ${tableName}`,
          passed: false,
          error: errorMessage,
        })
      }
    }
    
    return schemaResults
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return [
      {
        name: 'Database Schema Test',
        passed: false,
        error: errorMessage,
      },
    ]
  }
}

async function testDataIntegrity(): Promise<TestResult[]> {
  const dataResults: TestResult[] = []
  
  try {
    logSection('3. Data Integrity Test')
    
    // Check courses
    const courses = await prisma.course.findMany({
      include: {
        modules: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    })
    
    logTest(`Courses found: ${courses.length}`, courses.length > 0, `${courses.length} total courses`)
    dataResults.push({
      name: 'Courses exist',
      passed: courses.length > 0,
      details: `${courses.length} courses found`,
    })
    
    // Check for Net Zero course specifically
    const netZeroCourse = courses.find((c) => c.slug === 'netzero')
    logTest(
      'Net Zero course exists',
      !!netZeroCourse,
      netZeroCourse ? `Found: ${netZeroCourse.title}` : 'Net Zero course not found',
    )
    dataResults.push({
      name: 'Net Zero course exists',
      passed: !!netZeroCourse,
      details: netZeroCourse ? netZeroCourse.title : 'Not found',
    })
    
    // Check active courses
    const activeCourses = courses.filter((c) => c.isActive)
    logTest(
      `Active courses: ${activeCourses.length}`,
      activeCourses.length > 0,
      `${activeCourses.length} of ${courses.length} courses are active`,
    )
    dataResults.push({
      name: 'Active courses',
      passed: activeCourses.length > 0,
      details: `${activeCourses.length} active`,
    })
    
    if (netZeroCourse) {
      // Check modules for Net Zero course
      const modules = await prisma.module.findMany({
        where: { courseId: netZeroCourse.id },
        orderBy: { order: 'asc' },
      })
      
      logTest(
        `Net Zero modules: ${modules.length}`,
        modules.length > 0,
        `${modules.length} modules found`,
      )
      dataResults.push({
        name: 'Net Zero modules',
        passed: modules.length > 0,
        details: `${modules.length} modules`,
      })
      
      // Check quizzes
      const quizzes = await prisma.quiz.findMany({
        where: {
          moduleId: { in: modules.map((m) => m.id) },
        },
      })
      
      logTest(
        `Quizzes found: ${quizzes.length}`,
        quizzes.length > 0,
        `${quizzes.length} quizzes across all modules`,
      )
      dataResults.push({
        name: 'Quizzes exist',
        passed: quizzes.length > 0,
        details: `${quizzes.length} quizzes`,
      })
      
      // Check module order integrity
      const moduleOrders = modules.map((m) => m.order).sort((a, b) => a - b)
      const hasSequentialOrder = moduleOrders.every((order, index) => order === index + 1)
      logTest(
        'Module order integrity',
        hasSequentialOrder,
        hasSequentialOrder
          ? 'All modules have sequential order'
          : `Missing orders: ${moduleOrders}`,
      )
      dataResults.push({
        name: 'Module order integrity',
        passed: hasSequentialOrder,
        details: hasSequentialOrder ? 'Sequential' : 'Non-sequential',
      })
    }
    
    // Check users
    const userCount = await prisma.user.count()
    logTest(`Users: ${userCount}`, true, `${userCount} users in database`)
    dataResults.push({
      name: 'Users exist',
      passed: true,
      details: `${userCount} users`,
    })
    
    // Check for demo user
    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo@netzero.com' },
    })
    logTest(
      'Demo user exists',
      !!demoUser,
      demoUser ? 'Found demo@netzero.com' : 'Demo user not found',
    )
    dataResults.push({
      name: 'Demo user exists',
      passed: !!demoUser,
      details: demoUser ? 'Found' : 'Not found',
    })
    
    return dataResults
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return [
      {
        name: 'Data Integrity Test',
        passed: false,
        error: errorMessage,
      },
    ]
  }
}

async function testRelationships(): Promise<TestResult[]> {
  const relationResults: TestResult[] = []
  
  try {
    logSection('4. Database Relationships Test')
    
    // Test Course -> Module relationship
    const coursesWithModules = await prisma.course.findMany({
      include: {
        modules: true,
      },
    })
    
    const coursesWithModulesCount = coursesWithModules.filter((c) => c.modules.length > 0).length
    logTest(
      'Course-Module relationships',
      coursesWithModulesCount > 0,
      `${coursesWithModulesCount} courses have modules`,
    )
    relationResults.push({
      name: 'Course-Module relationships',
      passed: coursesWithModulesCount > 0,
      details: `${coursesWithModulesCount} courses with modules`,
    })
    
    // Test Module -> Quiz relationship
    const modulesWithQuizzes = await prisma.module.findMany({
      include: {
        quizzes: true,
      },
    })
    
    const modulesWithQuizzesCount = modulesWithQuizzes.filter((m) => m.quizzes.length > 0).length
    logTest(
      'Module-Quiz relationships',
      modulesWithQuizzesCount > 0,
      `${modulesWithQuizzesCount} modules have quizzes`,
    )
    relationResults.push({
      name: 'Module-Quiz relationships',
      passed: modulesWithQuizzesCount > 0,
      details: `${modulesWithQuizzesCount} modules with quizzes`,
    })
    
    // Check for orphaned records
    const allModules = await prisma.module.findMany()
    const orphanedModules = allModules.filter((m) => {
      return !coursesWithModules.some((c) => c.id === m.courseId)
    })
    
    logTest(
      'No orphaned modules',
      orphanedModules.length === 0,
      orphanedModules.length === 0
        ? 'All modules belong to courses'
        : `${orphanedModules.length} orphaned modules found`,
    )
    relationResults.push({
      name: 'No orphaned modules',
      passed: orphanedModules.length === 0,
      details: orphanedModules.length === 0 ? 'OK' : `${orphanedModules.length} orphaned`,
    })
    
    return relationResults
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return [
      {
        name: 'Relationships Test',
        passed: false,
        error: errorMessage,
      },
    ]
  }
}

async function testAPEndpoints(): Promise<TestResult[]> {
  const apiResults: TestResult[] = []
  
  try {
    logSection('5. API Endpoints Test')
    
    // Note: These tests assume the server is running
    // In a real scenario, you might want to start the server or test against a running instance
    
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
    
    logTest('Checking if server is accessible...', true, `Base URL: ${baseUrl}`)
    
    // Test health endpoint
    try {
      const healthResponse = await fetch(`${baseUrl}/api/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
      
      const healthData = await healthResponse.json()
      const healthOk = healthResponse.ok && healthData.status === 'healthy'
      
      logTest(
        'Health endpoint',
        healthOk,
        healthOk
          ? `Status: ${healthData.status}, Database: ${healthData.database}`
          : `Status: ${healthResponse.status}`,
      )
      apiResults.push({
        name: 'Health endpoint',
        passed: healthOk,
        details: healthOk ? healthData.database : `HTTP ${healthResponse.status}`,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logTest('Health endpoint', false, `Server may not be running: ${errorMessage}`)
      apiResults.push({
        name: 'Health endpoint',
        passed: false,
        error: errorMessage,
        details: 'Server may not be running. Start with: npm run dev',
      })
    }
    
    // Test db-check endpoint
    try {
      const dbCheckResponse = await fetch(`${baseUrl}/api/db-check`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
      
      const dbCheckData = await dbCheckResponse.json()
      const dbCheckOk = dbCheckResponse.ok && dbCheckData.success === true
      
      logTest(
        'DB-Check endpoint',
        dbCheckOk,
        dbCheckOk
          ? `Status: ${dbCheckData.status}`
          : `Status: ${dbCheckResponse.status}`,
      )
      apiResults.push({
        name: 'DB-Check endpoint',
        passed: dbCheckOk,
        details: dbCheckOk ? dbCheckData.status : `HTTP ${dbCheckResponse.status}`,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logTest('DB-Check endpoint', false, `Error: ${errorMessage}`)
      apiResults.push({
        name: 'DB-Check endpoint',
        passed: false,
        error: errorMessage,
      })
    }
    
    return apiResults
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return [
      {
        name: 'API Endpoints Test',
        passed: false,
        error: errorMessage,
      },
    ]
  }
}

async function testPrismaClient(): Promise<TestResult[]> {
  const prismaResults: TestResult[] = []
  
  try {
    logSection('6. Prisma Client Test')
    
    // Test that Prisma Client is properly initialized
    logTest('Prisma Client initialized', true, 'Client instance created')
    prismaResults.push({
      name: 'Prisma Client initialized',
      passed: true,
    })
    
    // Test a complex query
    try {
      const complexQuery = await prisma.course.findMany({
        where: { isActive: true },
        include: {
          modules: {
            include: {
              quizzes: true,
            },
          },
        },
      })
      
      logTest(
        'Complex query execution',
        true,
        `Executed query returning ${complexQuery.length} courses`,
      )
      prismaResults.push({
        name: 'Complex query execution',
        passed: true,
        details: `${complexQuery.length} courses`,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logTest('Complex query execution', false, errorMessage)
      prismaResults.push({
        name: 'Complex query execution',
        passed: false,
        error: errorMessage,
      })
    }
    
    // Test transaction capability
    try {
      await prisma.$transaction(async (tx) => {
        await tx.course.findMany({ take: 1 })
      })
      
      logTest('Transaction support', true, 'Transactions working')
      prismaResults.push({
        name: 'Transaction support',
        passed: true,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logTest('Transaction support', false, errorMessage)
      prismaResults.push({
        name: 'Transaction support',
        passed: false,
        error: errorMessage,
      })
    }
    
    return prismaResults
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return [
      {
        name: 'Prisma Client Test',
        passed: false,
        error: errorMessage,
      },
    ]
  }
}

async function main() {
  console.clear()
  log('\n🚀 Starting End-to-End System Test\n', 'bold')
  log('Testing database connectivity and system operational status...\n', 'cyan')
  
  const startTime = Date.now()
  
  try {
    // Run all tests
    const connectionTest = await testDatabaseConnection()
    results.push(connectionTest)
    
    // Only continue if database connection works
    if (!connectionTest.passed) {
      log('\n⚠️  Database connection failed. Skipping remaining tests.\n', 'yellow')
    } else {
      const schemaTests = await testDatabaseSchema()
      results.push(...schemaTests)
      
      const dataTests = await testDataIntegrity()
      results.push(...dataTests)
      
      const relationTests = await testRelationships()
      results.push(...relationTests)
      
      const prismaTests = await testPrismaClient()
      results.push(...prismaTests)
    }
    
    // API tests (may fail if server not running)
    const apiTests = await testAPEndpoints()
    results.push(...apiTests)
    
    // Summary
    const endTime = Date.now()
    const duration = ((endTime - startTime) / 1000).toFixed(2)
    
    logSection('Test Summary')
    
    const passed = results.filter((r) => r.passed).length
    const failed = results.filter((r) => !r.passed).length
    const total = results.length
    
    log(`Total Tests: ${total}`, 'bold')
    log(`✅ Passed: ${passed}`, 'green')
    log(`❌ Failed: ${failed}`, failed > 0 ? 'red' : 'green')
    log(`� Duration: ${duration}s\n`, 'cyan')
    
    if (failed > 0) {
      log('\n❌ Failed Tests:\n', 'red')
      results
        .filter((r) => !r.passed)
        .forEach((r) => {
          log(`  ❌ ${r.name}`, 'red')
          if (r.error) {
            log(`     Error: ${r.error}`, 'yellow')
          }
          if (r.details) {
            log(`     ${r.details}`, 'yellow')
          }
        })
    }
    
    // Overall status
    const allCriticalPassed =
      connectionTest.passed &&
      results.filter((r) => r.name.includes('Courses exist') || r.name.includes('Net Zero')).every((r) => r.passed)
    
    logSection('Overall Status')
    
    if (allCriticalPassed && failed === 0) {
      log('✅ SYSTEM IS FULLY OPERATIONAL', 'green')
      log('   All critical tests passed. System is ready for use.\n', 'green')
      process.exit(0)
    } else if (allCriticalPassed) {
      log('⚠️  SYSTEM IS OPERATIONAL WITH WARNINGS', 'yellow')
      log('   Critical functionality works, but some tests failed.\n', 'yellow')
      process.exit(0)
    } else {
      log('❌ SYSTEM HAS CRITICAL ISSUES', 'red')
      log('   Critical tests failed. Please fix issues before using the system.\n', 'red')
      process.exit(1)
    }
  } catch (error) {
    log('\n❌ Fatal error during testing:', 'red')
    console.error(error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error('❌ Unhandled error:', error)
  process.exit(1)
})
