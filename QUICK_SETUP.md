# ⚡ QUICK SETUP - Fix "Table does not exist" Error

## The Problem
Your Neon database is connected but **empty** - no tables exist yet.

## ✅ Solution (Copy & Paste These Commands)

### Step 1: Open PowerShell in your project folder

Navigate to: `C:\Users\Iainpg\NetZero`

### Step 2: Set your Neon DATABASE_URL

**Get your connection string from:** https://console.neon.tech

Then run this (replace with YOUR actual connection string):

```powershell
$env:DATABASE_URL="postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require"
```

### Step 3: Run the setup script

```powershell
.\setup-neon.ps1
```

**OR** run these commands manually:

```powershell
# Create all tables
npx prisma db push

# Seed the database
npm run db:seed
```

## ✅ Verify It Worked

After running, you should see:
- ✅ "Database schema pushed successfully"
- ✅ "Created demo user"
- ✅ "Created 7 modules"

Then test your live site - the error should be gone!

## 🆘 Still Not Working?

1. **Check your DATABASE_URL:**
   ```powershell
   echo $env:DATABASE_URL
   ```
   Make sure it shows your Neon connection string (not SQLite)

2. **Verify connection:**
   ```powershell
   npm run db:setup-prod
   ```
   This will test if you can connect to Neon

3. **Check Neon dashboard:**
   - Go to https://console.neon.tech
   - Check if tables were created
   - Make sure database is active (not paused)

## 📝 Important Notes

- ⚠️ You MUST run these commands **locally** (on your computer)
- ⚠️ Use the **same** Neon connection string you set in Netlify
- ⚠️ After running, your live site will work immediately

