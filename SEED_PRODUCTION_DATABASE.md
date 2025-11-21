# Seed Production Database - Fix Missing Courses

## The Problem
Your production database is empty - no courses, modules, or data. The app works but shows no courses because the database hasn't been seeded.

## ✅ Quick Fix (Run Locally)

You need to seed the production database from your local machine. The seed script will create:
- 2 courses (Net Zero Fundamentals, Greenwashing Awareness)
- Multiple modules with content and quizzes
- Demo user
- Allowed domains

### Step 1: Get Your Production DATABASE_URL

From DigitalOcean App Platform → Settings → App-Level Environment Variables, copy your `DATABASE_URL`. It should look like:
```
postgresql://doadmin:YOUR_PASSWORD@db-postgresql-lon1-ccx-do-user-12481992-0.h.db.ondigitalocean.com:25060/netzero?sslmode=require
```

### Step 2: Set DATABASE_URL Locally

Open PowerShell in your project folder (`C:\Users\Iainpg\NetZero`) and run:

```powershell
# Replace with YOUR actual DATABASE_URL from DigitalOcean
$env:DATABASE_URL="postgresql://doadmin:YOUR_PASSWORD@db-postgresql-lon1-ccx-do-user-12481992-0.h.db.ondigitalocean.com:25060/netzero?sslmode=require"
```

### Step 3: Run the Seed Script

```powershell
npm run db:seed
```

**OR** use the complete setup script (which also verifies):

```powershell
npm run db:setup-do
```

### Step 4: Verify It Worked

After seeding, you should see:
```
✅ Created course: Net Zero
✅ Created course: Greenwashing
✅ Created module: ...
```

Then check your live site - courses should appear!

## 🔍 Verify Database Has Data

Run this to check:

```powershell
npm run db:verify
```

This will show:
- Number of courses
- Number of modules
- Number of users
- Whether data exists

## 🐛 Troubleshooting

### "Can't reach database server"
- Check your DATABASE_URL is correct
- Verify DigitalOcean database is active
- Make sure connection string includes `?sslmode=require`

### "Permission denied"
- Verify username/password in DATABASE_URL
- Check DigitalOcean database user permissions

### Seed runs but no courses appear
1. Check if courses were created:
   ```powershell
   npm run db:verify
   ```
2. If courses exist but don't show in app:
   - Check `isActive: true` on courses
   - Verify app is connecting to correct database
   - Check DigitalOcean logs for errors

### Still having issues?

Run the complete setup script which does everything:
```powershell
npm run db:setup-complete
```

This will:
- Test connection
- Create schema (if needed)
- Seed data (if empty)
- Verify everything

## 📋 What Gets Created

The seed script creates:

**Courses:**
- Net Zero Fundamentals (slug: `netzero`)
- Greenwashing Awareness (slug: `greenwashing`)

**Modules:**
- Multiple modules per course with content, quizzes, and badges

**Users:**
- Demo user: `demo@netzero.com` (password: `demo123`)

**Domains:**
- Allowed domain: `carma.earth`

## ✅ After Seeding

1. Visit your live site: https://netzero-gecrc.ondigitalocean.app
2. Sign in with Google (carma account)
3. Go to Dashboard or Courses page
4. You should see both courses available!

## 🔄 Re-seeding

If you need to re-seed (clears existing courses/modules):

```powershell
# Set DATABASE_URL
$env:DATABASE_URL="your-production-database-url"

# Run seed (it clears and recreates courses/modules)
npm run db:seed
```

**Note:** Re-seeding will delete existing courses and modules, but preserves users and their progress.

