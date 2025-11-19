# DigitalOcean PostgreSQL Setup Guide

## Database Connection Details

- **Host:** `db-postgresql-lon1-ccx-do-user-12481992-0.h.db.ondigitalocean.com`
- **Port:** `25060`
- **Database:** `netzero`
- **SSL Mode:** `require`

## Connection String Format

```
postgresql://username:password@db-postgresql-lon1-ccx-do-user-12481992-0.h.db.ondigitalocean.com:25060/netzero?sslmode=require
```

## Step-by-Step Setup

### Step 1: Get Your Database Credentials

1. Go to your DigitalOcean dashboard
2. Navigate to **Databases** > Your PostgreSQL database
3. Click **Connection Details** or **Users & Databases**
4. Copy your **username** and **password**

### Step 2: Test Connection Locally

```powershell
# Set your DATABASE_URL (replace username and password)
$env:DATABASE_URL="postgresql://username:password@db-postgresql-lon1-ccx-do-user-12481992-0.h.db.ondigitalocean.com:25060/netzero?sslmode=require"

# Test connection
npm run db:test-do
```

You should see: ✅ Connected successfully!

### Step 3: Set Up Database Schema

```powershell
# Make sure DATABASE_URL is still set
# Then run setup script
npm run db:setup-do
```

This will:
- ✅ Create all database tables
- ✅ Seed with demo user and modules
- ✅ Verify everything is set up correctly

### Step 4: Set DATABASE_URL in Netlify

1. Go to https://app.netlify.com
2. Select your site
3. Go to **Site settings** > **Environment variables**
4. Add:
   - **Key:** `DATABASE_URL`
   - **Value:** Your DigitalOcean connection string (same as Step 2)
5. Click **Save**

### Step 5: Redeploy on Netlify

After setting DATABASE_URL:
- Go to **Deploys** tab
- Click **Trigger deploy** > **Deploy site**
- Wait for build to complete

## Verify Everything Works

After deployment:
1. Go to your live site
2. Try creating an account
3. Try logging in with demo account: `demo@netzero.com` / `demo123`

## Troubleshooting

### Connection Refused
- Check DigitalOcean firewall settings
- Make sure your IP is allowed (or use "Allow all IPs" for testing)
- Verify port 25060 is open

### Authentication Failed
- Double-check username and password
- Make sure credentials are correct in DigitalOcean dashboard

### Database Not Found
- Verify database name is `netzero`
- Check database exists in DigitalOcean

### SSL Error
- Make sure connection string includes `?sslmode=require`
- Verify SSL is enabled on DigitalOcean database

## User Tracking

The database tracks:
- ✅ User accounts (email, name, password)
- ✅ User progress (modules completed, quiz scores)
- ✅ Badges earned
- ✅ Time spent learning
- ✅ Quiz attempts
- ✅ Certificates earned

All user data is stored in the PostgreSQL database and can be queried directly.

