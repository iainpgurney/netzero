# Neon Database Setup for Netlify

## Quick Setup Steps

### 1. Get your Neon Database URL

From your Neon dashboard:
- Copy your connection string
- It should look like: `postgresql://[user]:[password]@[host]/[dbname]?sslmode=require`

### 2. Set DATABASE_URL in Netlify

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** > **Environment variables**
3. Click **Add a variable**
4. Add:
   - **Key:** `DATABASE_URL`
   - **Value:** Your Neon connection string
5. Click **Save**

### 3. Run Database Migrations

You need to set up the database schema. You have two options:

#### Option A: Using Prisma Migrate (Recommended)

Run this locally with your Neon DATABASE_URL:

```bash
# Set your Neon DATABASE_URL (Windows PowerShell)
$env:DATABASE_URL="your-neon-connection-string"

# Create and apply migration
npx prisma migrate dev --name init

# Seed the database
npm run db:seed
```

#### Option B: Using Prisma DB Push (Faster for initial setup)

```bash
# Set your Neon DATABASE_URL
$env:DATABASE_URL="your-neon-connection-string"

# Push schema to database
npx prisma db push

# Seed the database
npm run db:seed
```

### 4. Verify Setup

Test your production database connection:

```bash
# Set DATABASE_URL
$env:DATABASE_URL="your-neon-connection-string"

# Run verification script
npm run db:setup-prod
```

### 5. Redeploy on Netlify

After setting DATABASE_URL and running migrations:
- Netlify will automatically detect the new environment variable
- Trigger a new deploy (or push a commit)
- The build should now work with PostgreSQL

## Troubleshooting

### "Unable to open the database file" error
- ✅ This is fixed! The schema now uses PostgreSQL
- Make sure DATABASE_URL is set in Netlify environment variables
- Make sure you've run migrations to create the tables

### "Relation does not exist" error
- You need to run migrations first (see Step 3 above)
- Make sure DATABASE_URL is correct and accessible

### Connection timeout
- Check that your Neon database is active (not paused)
- Verify the connection string is correct
- Make sure SSL mode is set: `?sslmode=require`

## Local Development

For local development, you can:

**Option 1:** Use the same Neon database (recommended for testing)
```env
# .env.local
DATABASE_URL="your-neon-connection-string"
```

**Option 2:** Use SQLite locally (if you prefer)
```env
# .env.local
DATABASE_URL="file:./prisma/dev.db"
```
Note: You'll need to change the schema provider back to `sqlite` for this to work.

