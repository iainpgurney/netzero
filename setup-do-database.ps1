# DigitalOcean PostgreSQL Database Setup Script
# This script will test connection, create tables, and seed data

Write-Host "🚀 DigitalOcean PostgreSQL Database Setup" -ForegroundColor Green
Write-Host ""

# Database connection details
$host = "db-postgresql-lon1-ccx-do-user-12481992-0.h.db.ondigitalocean.com"
$port = "25060"
$database = "netzero"

Write-Host "📋 Database Details:" -ForegroundColor Cyan
Write-Host "   Host: $host"
Write-Host "   Port: $port"
Write-Host "   Database: $database"
Write-Host ""

# Get credentials
Write-Host "🔐 Please enter your database credentials:" -ForegroundColor Yellow
$username = Read-Host "   Username"
$password = Read-Host "   Password" -AsSecureString
$passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

# Build connection string
$connectionString = "postgresql://${username}:${passwordPlain}@${host}:${port}/${database}?sslmode=require"

# Set environment variable
$env:DATABASE_URL = $connectionString

Write-Host ""
Write-Host "⏳ Testing connection..." -ForegroundColor Yellow

# Test connection
try {
    npm run db:test-do
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "❌ Connection test failed!" -ForegroundColor Red
        Write-Host "   Please check your credentials and try again." -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "❌ Error testing connection: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "⏳ Setting up database schema and seeding data..." -ForegroundColor Yellow

# Setup database
try {
    npm run db:setup-do
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "❌ Database setup failed!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "❌ Error setting up database: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Database setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Set DATABASE_URL in Netlify environment variables:" -ForegroundColor White
Write-Host "      $connectionString" -ForegroundColor Gray
Write-Host "   2. Redeploy your site on Netlify" -ForegroundColor White
Write-Host "   3. Test account creation on your live site" -ForegroundColor White
Write-Host ""

