# DigitalOcean Deployment Checklist

## Pre-Deployment Review ✅

### 1. Code Quality
- [x] All Netlify-specific code removed
- [x] Environment variables properly configured
- [x] Build scripts verified
- [x] Database schema up to date
- [x] No hardcoded credentials

### 2. Dependencies
- [x] Node.js version: 18.x (specified in package.json engines)
- [x] All dependencies compatible with Node 18
- [x] Prisma client generated correctly
- [x] No deprecated packages in critical paths

### 3. Environment Variables Required

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - At least 32 characters
- `NEXTAUTH_URL` - Production URL

**Optional:**
- `GOOGLE_CLIENT_ID` - For Google OAuth
- `GOOGLE_CLIENT_SECRET` - For Google OAuth
- `ALLOWED_GOOGLE_DOMAINS` - Comma-separated domains
- `NODE_ENV` - Set to "production"

### 4. Build Configuration
- [x] Build command: `npm run build`
- [x] Start command: `npm start`
- [x] Prisma generate runs before build
- [x] No Netlify-specific build steps

### 5. Database Setup
- [x] PostgreSQL database created on DigitalOcean
- [x] Connection string format correct
- [x] SSL mode set to `require`
- [x] Database schema pushed
- [x] Seed data loaded (if needed)

### 6. Security
- [x] No secrets in code
- [x] Environment variables properly scoped
- [x] SSL/TLS configured
- [x] Authentication working
- [x] CORS configured (if needed)

## Deployment Steps

### Step 1: Prepare Repository
```bash
# Ensure all changes are committed
git add .
git commit -m "Prepare for DigitalOcean deployment"
git push origin main
```

### Step 2: Create DigitalOcean App
1. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Click **Create App**
3. Connect GitHub repository
4. Select branch (usually `main`)

### Step 3: Configure Build Settings
- **Build Command:** `npm run build`
- **Run Command:** `npm start`
- **Environment:** Node.js 18.x

### Step 4: Set Environment Variables
Add all required environment variables in DigitalOcean dashboard:
- Settings > App-Level Environment Variables

### Step 5: Deploy
1. Review configuration
2. Click **Create Resources**
3. Monitor build logs
4. Verify deployment success

### Step 6: Post-Deployment Verification
- [ ] App loads correctly
- [ ] Authentication works
- [ ] Database connection successful
- [ ] Modules load properly
- [ ] Certificates generate correctly
- [ ] Greenwashing checker works

## Troubleshooting

### Build Fails
- Check build logs in DigitalOcean
- Verify Node.js version is 18.x
- Ensure all environment variables are set
- Check Prisma client generation

### Database Connection Errors
- Verify DATABASE_URL format
- Check database firewall settings
- Ensure SSL mode is `require`
- Test connection locally first

### Runtime Errors
- Check application logs
- Verify environment variables
- Ensure database schema is up to date
- Check NextAuth configuration

## Rollback Plan

If deployment fails:
1. Check deployment logs
2. Fix issues locally
3. Push fixes
4. Redeploy

## Monitoring

After deployment:
- Set up monitoring alerts
- Configure log aggregation
- Set up database backups
- Monitor performance metrics


