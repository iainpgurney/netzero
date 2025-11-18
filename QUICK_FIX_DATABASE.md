# ⚠️ QUICK FIX: DATABASE_URL Error

## The Problem
You're seeing: `Environment variable not found: DATABASE_URL`

This means Netlify doesn't have your database connection string configured.

## ✅ Solution (3 Steps)

### Step 1: Get Neon Connection String

1. Go to https://console.neon.tech
2. Click your project
3. Click **Connection Details** or find **Connection String**
4. Copy the **full connection string** - it should look like:
   ```
   postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```

### Step 2: Add to Netlify (CRITICAL)

1. **Go to:** https://app.netlify.com
2. **Click your site name**
3. **Click:** Site settings (⚙️ gear icon at top)
4. **Click:** Environment variables (left sidebar)
5. **Click:** Add a variable (button)
6. **Enter:**
   - **Key:** `DATABASE_URL` (exactly this, case-sensitive)
   - **Value:** Paste your Neon connection string
7. **Click:** Save

### Step 3: Redeploy

**IMPORTANT:** After adding DATABASE_URL, you MUST redeploy:

1. Go to **Deploys** tab in Netlify
2. Click **Trigger deploy** → **Deploy site**
3. Wait for build to complete

OR push a commit to trigger automatic deploy.

## ⚠️ Common Mistakes

- ❌ Setting it but forgetting to redeploy
- ❌ Wrong variable name (must be exactly `DATABASE_URL`)
- ❌ Incomplete connection string (missing password or sslmode)
- ❌ Setting it in the wrong scope (should be "All scopes" or "Production")

## ✅ Verify It's Set

After redeploying, check the build logs:
1. Go to **Deploys** tab
2. Click the latest deploy
3. Check if you see `DATABASE_URL` in the environment variables section
4. The error should be gone

## 🧪 Test Locally First (Optional)

Before deploying, test locally:

```powershell
# Create .env.local file
echo 'DATABASE_URL="your-neon-connection-string"' > .env.local

# Test connection
npm run db:setup-prod
```

If this works locally, then set the same value in Netlify.

