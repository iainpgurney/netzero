# Netlify Setup Guide - DATABASE_URL Configuration

## ⚠️ IMPORTANT: Set DATABASE_URL in Netlify

The error "Environment variable not found: DATABASE_URL" means you need to configure your Neon database connection in Netlify.

## Step-by-Step Instructions

### 1. Get Your Neon Database URL

1. Go to your [Neon Dashboard](https://console.neon.tech)
2. Select your project
3. Go to **Connection Details** or **Settings** > **Connection String**
4. Copy the connection string
   - It should look like: `postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`
   - Make sure to copy the **full connection string** including the password

### 2. Set DATABASE_URL in Netlify

1. Go to your Netlify site dashboard: https://app.netlify.com
2. Select your site
3. Go to **Site settings** (gear icon in the top menu)
4. Click **Environment variables** in the left sidebar
5. Click **Add a variable** button
6. Fill in:
   - **Key:** `DATABASE_URL`
   - **Value:** Paste your Neon connection string
   - **Scopes:** Leave as "All scopes" (or select specific scopes if needed)
7. Click **Save**

### 3. Set Up Your Database Schema

After setting DATABASE_URL, you need to create the database tables. Run these commands **locally** with your Neon DATABASE_URL:

```powershell
# Set your Neon DATABASE_URL (Windows PowerShell)
$env:DATABASE_URL="your-neon-connection-string-here"

# Push the schema to create all tables
npx prisma db push

# Seed the database (creates demo user and modules)
npm run db:seed
```

### 4. Redeploy on Netlify

After setting DATABASE_URL:
- Go to your Netlify site dashboard
- Click **Deploys** tab
- Click **Trigger deploy** > **Deploy site**
- Or push a new commit to trigger automatic deployment

## Verify Setup

After deployment, test:
1. Go to your live site
2. Try to create an account
3. It should work now!

## Troubleshooting

### Still getting "Environment variable not found: DATABASE_URL"
- Double-check that DATABASE_URL is set in Netlify Environment Variables
- Make sure you saved it (click Save button)
- Try redeploying after setting the variable
- Check that the variable name is exactly `DATABASE_URL` (case-sensitive)

### "Unable to open the database file" error
- This means DATABASE_URL is not set or incorrect
- Verify the connection string is correct
- Make sure it includes `?sslmode=require` at the end

### Connection timeout
- Check that your Neon database is active (not paused)
- Verify the connection string is correct
- Make sure you're using the correct region

## Local Development

For local development, create a `.env.local` file:

```env
DATABASE_URL="your-neon-connection-string-here"
```

Or use SQLite locally (you'll need to change the schema provider back to `sqlite`).

