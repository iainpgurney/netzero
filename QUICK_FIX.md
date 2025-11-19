# 🚨 Quick Fix for Prisma Error

## The Error
```
❌ tRPC failed on learning.getCourses: Cannot read properties of undefined (reading 'findMany')
```

## Why This Happens
The Prisma client needs to be regenerated after we added the `Course` model to the schema.

## ⚡ FASTEST FIX

**Option 1: Use the script (if dev server is stopped)**
```powershell
.\scripts\regenerate-prisma.ps1
```

**Option 2: Manual steps (if file lock persists)**

1. **Stop your dev server** (Ctrl+C in terminal)

2. **Close Cursor/VS Code completely**

3. **Open a NEW PowerShell window** (not in Cursor)

4. **Navigate to project:**
   ```powershell
   cd C:\Users\Iainpg\NetZero
   ```

5. **Regenerate Prisma:**
   ```powershell
   npx prisma generate
   ```

6. **Push schema to database:**
   ```powershell
   npx prisma db push
   ```

7. **Seed database:**
   ```powershell
   npm run db:seed
   ```

8. **Reopen Cursor and start dev server:**
   ```powershell
   npm run dev
   ```

## ✅ Verification

After regenerating, check that `node_modules/.prisma/client/index.d.ts` includes:
- `course: CourseDelegate`
- `allowedDomain: AllowedDomainDelegate`

The error should be gone! 🎉
