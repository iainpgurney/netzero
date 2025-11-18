# 🚨 URGENT: Create Database Tables NOW

## The Error
`The table 'public.User' does not exist` means your Neon database is empty - no tables have been created yet.

## ✅ Fix This Right Now (3 Steps)

### Step 1: Get Your Neon Connection String

1. Go to https://console.neon.tech
2. Click your project
3. Copy the **Connection String** (it should look like):
   ```
   postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```

### Step 2: Run These Commands Locally

Open PowerShell in your project folder and run:

```powershell
# Set your Neon DATABASE_URL (replace with YOUR actual connection string)
$env:DATABASE_URL="postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require"

# Create all tables
npx prisma db push

# Seed the database (creates demo user and modules)
npm run db:seed
```

### Step 3: Verify It Worked

After running the commands, you should see:
- ✅ "Database schema pushed successfully"
- ✅ "Created demo user"
- ✅ "Created 7 modules"

## ⚠️ Common Issues

### "Can't reach database server"
- Check your Neon connection string is correct
- Make sure your Neon database is active (not paused)
- Verify the connection string includes `?sslmode=require`

### "Permission denied"
- Make sure you're using the correct username/password from Neon
- Check that the connection string is complete

### Still getting the error after running commands?
- Make sure DATABASE_URL is set correctly (check with `echo $env:DATABASE_URL`)
- Try running `npx prisma db push` again
- Check Neon dashboard to see if tables were created

## 🧪 Test Locally First

Before deploying, test locally:

```powershell
# Set DATABASE_URL
$env:DATABASE_URL="your-neon-connection-string"

# Test connection
npm run db:setup-prod
```

If this works locally, your Neon database is set up correctly!

