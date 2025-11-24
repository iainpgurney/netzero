# 🚀 Seed Production Database - Quick Guide

## The Problem
Your production database on DigitalOcean is empty or missing courses. The app works locally but shows no courses in production because the database hasn't been seeded.

## ✅ Quick Fix (5 minutes)

### Step 1: Get Production DATABASE_URL

1. Go to **DigitalOcean App Platform**
2. Select your app: `carma-root-hm54o`
3. Go to **Settings** → **App-Level Environment Variables**
4. Find `DATABASE_URL` and copy the entire value
   - Should look like: `postgresql://doadmin:PASSWORD@db-postgresql-lon1-ccx-do-user-12481992-0.h.db.ondigitalocean.com:25060/netzero?sslmode=require`

### Step 2: Set DATABASE_URL Locally

Open PowerShell in your project folder (`C:\Users\Iainpg\NetZero`) and run:

```powershell
# Replace with YOUR actual DATABASE_URL from Step 1
$env:DATABASE_URL="postgresql://doadmin:YOUR_PASSWORD@db-postgresql-lon1-ccx-do-user-12481992-0.h.db.ondigitalocean.com:25060/netzero?sslmode=require"
```

### Step 3: Check Current Database State

```powershell
npm run check-production-db
```

This will show you:
- How many courses exist
- Whether Net Zero course is present
- What needs to be seeded

### Step 4: Seed the Database

```powershell
npm run db:seed
```

You should see output like:
```
✅ Created course: Net Zero
✅ Created course: Greenwashing
✅ Created course: Carbon Credit Integrity
✅ Created module: ...
```

### Step 5: Verify It Worked

```powershell
npm run check-production-db
```

Should show:
- ✅ 3 courses (Net Zero, Greenwashing, Carbon Credit Integrity)
- ✅ Net Zero course found with 7 modules

### Step 6: Check Your Live Site

1. Visit: https://carma-root-hm54o.ondigitalocean.app/dashboard
2. You should now see all courses!

## 🔄 Alternative: Complete Setup Script

If you want to do everything in one go:

```powershell
# Set DATABASE_URL first (from Step 1)
$env:DATABASE_URL="your-production-database-url"

# Run complete setup (tests connection, creates schema, seeds data)
npm run db:setup-do
```

## 🐛 Troubleshooting

### "Can't reach database server"
- Check your DATABASE_URL is correct
- Verify DigitalOcean database is active
- Make sure connection string includes `?sslmode=require`
- Check if your IP needs to be whitelisted in DigitalOcean firewall

### "Permission denied"
- Verify username/password in DATABASE_URL
- Check DigitalOcean database user permissions

### Seed runs but courses still don't show
1. Verify courses exist: `npm run check-production-db`
2. Check DigitalOcean app logs for errors
3. Make sure app is using the correct DATABASE_URL
4. Try redeploying the app after seeding

## 📋 What Gets Created

The seed script creates:
- **3 Courses:**
  - Net Zero Fundamentals (slug: `netzero`) - 7 modules
  - Greenwashing Awareness (slug: `greenwashing`) - 7 modules  
  - Carbon Credit Integrity (slug: `carbon-credit-integrity`) - 4 modules
- **18+ Modules** with content, quizzes, and badges
- **Demo user:** `demo@netzero.com`
- **Allowed domain:** `carma.earth`

**Note:** Seeding will delete existing courses/modules but preserves users and their progress.

