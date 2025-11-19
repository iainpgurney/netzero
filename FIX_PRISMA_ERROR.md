# Fix Prisma Error: Cannot read properties of undefined (reading 'findMany')

## Problem
The error `Cannot read properties of undefined (reading 'findMany')` occurs because the Prisma client hasn't been regenerated after adding the `Course` model to the schema.

## Quick Fix (Recommended)

Run the automated script:
```powershell
.\scripts\regenerate-prisma.ps1
```

This will:
1. Stop all Node.js processes
2. Wait for file locks to release
3. Regenerate Prisma client
4. Verify success

## Manual Fix

### Step 1: Stop the Dev Server
Stop your Next.js dev server (Ctrl+C in the terminal where it's running).

### Step 2: Regenerate Prisma Client
```powershell
npx prisma generate
```

### Step 3: Push Schema to Database (if not done already)
```powershell
npx prisma db push
```

### Step 4: Seed the Database (if not done already)
```powershell
npm run db:seed
```

### Step 5: Restart Dev Server
```powershell
npm run dev
```

## If File Lock Persists

If you still get `EPERM: operation not permitted` errors:

1. **Close VS Code/Cursor completely**
2. **Close all terminals**
3. **Kill Node processes**:
   ```powershell
   taskkill /F /IM node.exe
   ```
4. **Wait 5 seconds**
5. **Open a fresh terminal** and run:
   ```powershell
   npx prisma generate
   ```
6. **Restart your editor**
7. **Restart dev server**

## Verification

After regenerating, the Prisma client should include:
- `prisma.course` ✅
- `prisma.allowedDomain` ✅
- Updated `prisma.module` with `courseId` relation ✅

The error should be resolved!

