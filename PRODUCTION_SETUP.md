# Production Database Setup Guide

## Problem
SQLite doesn't work on Netlify because the filesystem is read-only. We need a hosted PostgreSQL database.

## Solution: Use a Free PostgreSQL Database

### Option 1: Supabase (Recommended - Free Tier)

1. **Sign up at [Supabase](https://supabase.com)**
   - Go to https://supabase.com
   - Create a free account
   - Create a new project

2. **Get your database URL**
   - Go to Project Settings > Database
   - Copy the "Connection string" under "Connection pooling"
   - It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

3. **Set up Netlify Environment Variables**
   - Go to your Netlify site dashboard
   - Navigate to Site settings > Environment variables
   - Add:
     - Key: `DATABASE_URL`
     - Value: Your Supabase connection string

4. **Run migrations on production**
   - After setting DATABASE_URL, Netlify will automatically run `prisma generate` during build
   - You'll need to run migrations manually the first time:
     ```bash
     # Install Netlify CLI if you haven't
     npm install -g netlify-cli
     
     # Run migration
     npx prisma migrate deploy
     ```
   - Or use Supabase SQL Editor to run the schema manually

### Option 2: Neon (Free Tier)

1. **Sign up at [Neon](https://neon.tech)**
   - Go to https://neon.tech
   - Create a free account
   - Create a new project

2. **Get your database URL**
   - Copy the connection string from your Neon dashboard
   - It looks like: `postgresql://[user]:[password]@[host]/[dbname]?sslmode=require`

3. **Set up Netlify Environment Variables**
   - Same as Option 1, step 3

### Option 3: Railway (Free Tier with Credit Card)

1. **Sign up at [Railway](https://railway.app)**
   - Go to https://railway.app
   - Create a free account
   - Create a new PostgreSQL database

2. **Get your database URL**
   - Copy the connection string from Railway dashboard

3. **Set up Netlify Environment Variables**
   - Same as Option 1, step 3

## Initial Database Setup

After setting DATABASE_URL in Netlify:

1. **Create a migration** (run locally with DATABASE_URL set):
   ```bash
   npx prisma migrate dev --name init
   ```

2. **Seed the database**:
   ```bash
   npm run db:seed
   ```

   Or manually run the seed script with production DATABASE_URL:
   ```bash
   DATABASE_URL="your-production-url" npm run db:seed
   ```

## Local Development

For local development, you can still use SQLite by creating a `.env.local` file:

```env
# For local SQLite (development)
DATABASE_URL="file:./prisma/dev.db"
```

Or use the same PostgreSQL database for both local and production.

## Troubleshooting

### "Unable to open the database file" error
- This means DATABASE_URL is not set or SQLite is being used
- Make sure DATABASE_URL is set in Netlify environment variables
- Make sure the connection string is correct

### Migration errors
- Make sure your DATABASE_URL has the correct permissions
- Check that the database exists and is accessible
- Verify SSL mode is set correctly (usually `?sslmode=require` for hosted databases)

