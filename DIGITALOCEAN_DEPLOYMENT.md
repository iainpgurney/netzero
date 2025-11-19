# DigitalOcean App Platform Deployment Guide

## Prerequisites

- DigitalOcean account
- DigitalOcean PostgreSQL database (already set up)
- GitHub repository with your code

## Step 1: Create DigitalOcean App

1. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Click **Create App**
3. Connect your GitHub repository
4. Select the repository and branch

## Step 2: Configure Build Settings

DigitalOcean will auto-detect Next.js, but verify these settings:

- **Build Command:** `npm run build`
- **Run Command:** `npm start`
- **Environment:** Node.js 18.x

## Step 3: Set Environment Variables

In DigitalOcean App Platform, go to **Settings** > **App-Level Environment Variables** and add:

```env
DATABASE_URL=postgresql://doadmin:YOUR_PASSWORD@db-postgresql-lon1-ccx-do-user-12481992-0.h.db.ondigitalocean.com:25060/netzero?sslmode=require
NEXTAUTH_SECRET=your-generated-secret-here-min-32-chars
NEXTAUTH_URL=https://your-app-name.ondigitalocean.app
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
ALLOWED_GOOGLE_DOMAINS=carma.earth
NODE_ENV=production
```

### Generate NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

## Step 4: Database Setup

Before deploying, ensure your database schema is set up:

1. **Locally**, with your DATABASE_URL set:
   ```bash
   npx prisma db push
   npm run db:seed
   ```

2. Or connect to your DigitalOcean database and run migrations manually.

## Step 5: Deploy

1. Click **Create Resources** or **Deploy** in DigitalOcean
2. Wait for build to complete
3. Your app will be available at `https://your-app-name.ondigitalocean.app`

## Step 6: Verify Deployment

1. Visit your app URL
2. Test sign-in functionality
3. Verify database connection works
4. Check that modules load correctly

## Troubleshooting

### Build Fails

- Check build logs in DigitalOcean dashboard
- Ensure all environment variables are set
- Verify Node.js version is 18.x

### Database Connection Errors

- Verify DATABASE_URL is correct
- Check database firewall allows connections from App Platform
- Ensure SSL mode is set to `require`

### Authentication Issues

- Verify NEXTAUTH_SECRET is set and at least 32 characters
- Check NEXTAUTH_URL matches your app URL
- Ensure Google OAuth redirect URIs are configured correctly

## Post-Deployment

1. Set up custom domain (optional)
2. Configure SSL certificate (automatic with DigitalOcean)
3. Set up monitoring and alerts
4. Configure backups for database


