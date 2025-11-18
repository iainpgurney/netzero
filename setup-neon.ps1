# Neon Database Setup Script
# Run this script to create all tables in your Neon database

Write-Host "🚀 Neon Database Setup" -ForegroundColor Green
Write-Host ""

# Check if DATABASE_URL is set
if (-not $env:DATABASE_URL) {
    Write-Host "❌ DATABASE_URL is not set!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please set your Neon connection string:" -ForegroundColor Yellow
    Write-Host '  $env:DATABASE_URL="postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require"' -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Get your connection string from: https://console.neon.tech" -ForegroundColor Yellow
    exit 1
}

# Check if it's a Neon URL (not SQLite)
if ($env:DATABASE_URL -like "file:*") {
    Write-Host "❌ DATABASE_URL points to SQLite file!" -ForegroundColor Red
    Write-Host "Please use your Neon PostgreSQL connection string." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ DATABASE_URL is set" -ForegroundColor Green
Write-Host ""

# Step 1: Create tables
Write-Host "📦 Creating database tables..." -ForegroundColor Yellow
try {
    npx prisma db push --skip-generate
    Write-Host "✅ Tables created successfully!" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Error creating tables: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Seed database
Write-Host "🌱 Seeding database with initial data..." -ForegroundColor Yellow
try {
    npm run db:seed
    Write-Host "✅ Database seeded successfully!" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Error seeding database: $_" -ForegroundColor Red
    Write-Host "Tables were created, but seeding failed. You can run 'npm run db:seed' manually." -ForegroundColor Yellow
    exit 1
}

Write-Host "🎉 Database setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Your Neon database is now ready to use." -ForegroundColor Cyan
Write-Host "Try creating an account on your live site now!" -ForegroundColor Cyan

