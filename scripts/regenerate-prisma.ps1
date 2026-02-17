# Regenerate Prisma client
# Run this when the dev server is NOT running (stop with Ctrl+C first)
# The dev server locks the query engine file on Windows, causing EPERM during generate

Write-Host "Regenerating Prisma client..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -eq 0) {
    Write-Host "Done. You can now run 'npm run dev' again." -ForegroundColor Green
} else {
    Write-Host "Failed. Make sure the dev server is stopped (Ctrl+C in the terminal running npm run dev)." -ForegroundColor Red
}
