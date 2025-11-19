# Regenerate Prisma Client Script
# This script stops Node processes and regenerates Prisma client

Write-Host "🔄 Regenerating Prisma Client..." -ForegroundColor Cyan

# Step 1: Kill all Node processes
Write-Host "`n📋 Step 1: Stopping Node.js processes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "   Found $($nodeProcesses.Count) Node.js process(es)" -ForegroundColor Yellow
    Stop-Process -Name node -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "   ✅ Node processes stopped" -ForegroundColor Green
} else {
    Write-Host "   ✅ No Node processes running" -ForegroundColor Green
}

# Step 2: Wait a moment for file locks to release
Write-Host "`n⏳ Waiting for file locks to release..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Step 3: Generate Prisma client
Write-Host "`n🔧 Step 2: Generating Prisma client..." -ForegroundColor Yellow
$generateResult = npx prisma generate 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Prisma client generated successfully!" -ForegroundColor Green
} else {
    Write-Host "   ❌ Error generating Prisma client" -ForegroundColor Red
    Write-Host $generateResult -ForegroundColor Red
    Write-Host "`n💡 File lock detected. Please:" -ForegroundColor Yellow
    Write-Host "   1. Close VS Code/Cursor completely" -ForegroundColor Yellow
    Write-Host "   2. Close all terminals" -ForegroundColor Yellow
    Write-Host "   3. Open a NEW terminal/PowerShell window" -ForegroundColor Yellow
    Write-Host "   4. Navigate to project: cd C:\Users\Iainpg\NetZero" -ForegroundColor Yellow
    Write-Host "   5. Run: npx prisma generate" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n✅ Done! You can now restart your dev server with: npm run dev" -ForegroundColor Green

