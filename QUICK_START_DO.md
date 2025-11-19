# ⚡ Quick Start - DigitalOcean Database Setup

## Your Connection String

```
postgresql://doadmin:YOUR_PASSWORD@db-postgresql-lon1-ccx-do-user-12481992-0.h.db.ondigitalocean.com:25060/netzero?sslmode=require
```

## Step 1: Create .env.local File

Create a file named `.env.local` in the root directory:

```env
DATABASE_URL="postgresql://doadmin:YOUR_PASSWORD@db-postgresql-lon1-ccx-do-user-12481992-0.h.db.ondigitalocean.com:25060/netzero?sslmode=require"
NEXTAUTH_SECRET="your-random-secret-key-at-least-32-characters-long"
NEXTAUTH_URL="http://localhost:3000"
```

**Replace `YOUR_PASSWORD` with your actual DigitalOcean database password.**

## Step 2: Run Complete Setup

```powershell
npm run db:setup-complete
```

This will:
- ✅ Test database connection
- ✅ Create all tables (User, Module, Quiz, UserProgress, QuizAttempt, Badge, Certificate, etc.)
- ✅ Seed with demo user and 7 modules
- ✅ Verify user tracking is configured

## Step 3: Verify It Worked

You should see:
- ✅ Connected successfully!
- ✅ Created X tables
- ✅ Database seeded successfully!
- ✅ User tracking verified

## Step 4: Set DATABASE_URL in Netlify

1. Go to https://app.netlify.com
2. Select your site
3. Go to **Site settings** > **Environment variables**
4. Add:
   - **Key:** `DATABASE_URL`
   - **Value:** Your connection string (same as .env.local)
5. Click **Save**

## Step 5: Redeploy

After setting DATABASE_URL:
- Go to **Deploys** tab
- Click **Trigger deploy** > **Deploy site**

## ✅ User Tracking Confirmed

The database tracks:
- ✅ **User accounts** (email, name, password, createdAt)
- ✅ **User progress** (modules completed, quiz scores, time spent, quiz attempts)
- ✅ **Quiz attempts** (each answer, correct/incorrect, timestamp)
- ✅ **Badges** (earned badges with timestamps)
- ✅ **Certificates** (completion certificates)

All user data is stored in PostgreSQL and can be queried directly.

## Test Your Live Site

After deployment:
1. Go to your live site
2. Create an account
3. Complete a module
4. Check your DigitalOcean database - you'll see all the data!

