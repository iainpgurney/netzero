# Force Regenerate Prisma Client - Aggressive Version
# This script forcefully stops all Node processes and regenerates Prisma

Write-Host "🔧 Force Regenerating Prisma Client..." -ForegroundColor Cyan
Write-Host "⚠️  This will stop ALL Node.js processes!" -ForegroundColor Yellow
Write-Host ""

# Step 1: Kill ALL Node processes forcefully
Write-Host "📋 Step 1: Stopping ALL Node.js processes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "   Found $($nodeProcesses.Count) Node.js process(es)" -ForegroundColor Yellow
    foreach ($proc in $nodeProcesses) {
        Write-Host "   Stopping PID $($proc.Id)..." -ForegroundColor Gray
        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 3
    Write-Host "   ✅ Node processes stopped" -ForegroundColor Green
} else {
    Write-Host "   ✅ No Node processes running" -ForegroundColor Green
}

# Step 2: Kill any processes locking the Prisma file
Write-Host "`n🔍 Step 2: Checking for file locks..." -ForegroundColor Yellow
$prismaFile = "node_modules\.prisma\client\query_engine-windows.dll.node"
if (Test-Path $prismaFile) {
    Write-Host "   Prisma file exists: $prismaFile" -ForegroundColor Gray
    
    # Try to unlock by removing read-only attribute
    try {
        $file = Get-Item $prismaFile -Force -ErrorAction SilentlyContinue
        if ($file) {
            $file.IsReadOnly = $false
            Write-Host "   ✅ Removed read-only attribute" -ForegroundColor Green
        }
    } catch {
        Write-Host "   ⚠️  Could not modify file attributes" -ForegroundColor Yellow
    }
}

# Step 3: Wait longer for locks to release
Write-Host "`n⏳ Step 3: Waiting for file locks to release..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Step 4: Try to delete temp files
Write-Host "`n🧹 Step 4: Cleaning up temp files..." -ForegroundColor Yellow
$tempFiles = Get-ChildItem "node_modules\.prisma\client\*.tmp*" -ErrorAction SilentlyContinue
if ($tempFiles) {
    foreach ($file in $tempFiles) {
        try {
            Remove-Item $file.FullName -Force -ErrorAction SilentlyContinue
            Write-Host "   Deleted: $($file.Name)" -ForegroundColor Gray
        } catch {
            Write-Host "   Could not delete: $($file.Name)" -ForegroundColor Yellow
        }
    }
}

# Step 5: Generate Prisma client
Write-Host "`n🔧 Step 5: Generating Prisma client..." -ForegroundColor Yellow
$env:DATABASE_URL = "postgresql://dummy:dummy@localhost:5432/dummy"  # Dummy URL for generation
try {
    $output = npx prisma generate 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Prisma client generated successfully!" -ForegroundColor Green
        Write-Host "`n✅ SUCCESS! You can now restart your dev server." -ForegroundColor Green
    } else {
        Write-Host "   ❌ Error during generation" -ForegroundColor Red
        Write-Host $output -ForegroundColor Red
        Write-Host "`n💡 If this still fails, you MUST:" -ForegroundColor Yellow
        Write-Host "   1. Close Cursor/VS Code COMPLETELY" -ForegroundColor Yellow
        Write-Host "   2. Close ALL terminal windows" -ForegroundColor Yellow
        Write-Host "   3. Open a NEW PowerShell window (outside Cursor)" -ForegroundColor Yellow
        Write-Host "   4. Run: cd C:\Users\Iainpg\NetZero" -ForegroundColor Yellow
        Write-Host "   5. Run: npx prisma generate" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "   ❌ Exception: $_" -ForegroundColor Red
    exit 1
} finally {
    Remove-Item Env:\DATABASE_URL -ErrorAction SilentlyContinue
}

