# Environment Variables Setup Guide

## 🔒 Security First

**NEVER commit `.env.local` to git** - It's already in `.gitignore` and contains secrets.

## 📁 File Structure

- **`.env.example`** - Template file (safe to commit, no secrets)
- **`.env.local`** - Your local development file (gitignored, contains secrets)
- **DigitalOcean Environment Variables** - Production settings (set in DigitalOcean dashboard)

## 🏠 Local Development Setup

### Step 1: Create `.env.local`

Copy the example file:
```powershell
Copy-Item .env.example .env.local
```

Or manually create `.env.local` with these values:

```env
# LOCAL DEVELOPMENT SETTINGS
DATABASE_URL="postgresql://doadmin:YOUR_PASSWORD@db-postgresql-lon1-ccx-do-user-12481992-0.h.db.ondigitalocean.com:25060/netzero?sslmode=require"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-key-change-in-production-min-32-chars"
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-your-google-client-secret"
ALLOWED_GOOGLE_DOMAINS="carma.earth"
NODE_ENV="development"
OPENAI_API_KEY="your-openai-api-key-here"
OPENAI_API_KEY_STAGING="your-staging-openai-api-key-here"
NEXT_PUBLIC_POSTHOG_KEY=""
NEXT_PUBLIC_POSTHOG_HOST=""
```

### Step 2: Update Required Values

1. **DATABASE_URL**: Replace `YOUR_PASSWORD` with your actual DigitalOcean database password
2. **GOOGLE_CLIENT_ID** and **GOOGLE_CLIENT_SECRET**: Get from Google Cloud Console
3. **NEXTAUTH_SECRET**: Generate a new secret for local dev:
   ```powershell
   openssl rand -base64 32
   ```

### Step 3: Google Cloud Console Setup

For local development, add this redirect URI in Google Cloud Console:
```
http://localhost:3000/api/auth/callback/google
```

## 🚀 Production Setup (DigitalOcean)

**DO NOT** set these in `.env.local` - they are set in DigitalOcean App Platform.

Go to DigitalOcean App Platform → Settings → App-Level Environment Variables:

```env
DATABASE_URL=postgresql://doadmin:YOUR_PASSWORD@db-postgresql-lon1-ccx-do-user-12481992-0.h.db.ondigitalocean.com:25060/netzero?sslmode=require
NEXTAUTH_URL=https://netzero-gecrc.ondigitalocean.app
NEXTAUTH_SECRET=your-production-secret-min-32-chars
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-google-client-secret
ALLOWED_GOOGLE_DOMAINS=carma.earth
NODE_ENV=production
OPENAI_API_KEY=your-production-openai-api-key
OPENAI_API_KEY_STAGING=your-staging-openai-api-key
```

### Google Cloud Console - Production Redirect URI

Add this redirect URI in Google Cloud Console:
```
https://netzero-gecrc.ondigitalocean.app/api/auth/callback/google
```

## 🔍 Key Differences: Development vs Production

| Variable | Development (`.env.local`) | Production (DigitalOcean) |
|----------|---------------------------|----------------------------|
| `NEXTAUTH_URL` | `http://localhost:3000` | `https://netzero-gecrc.ondigitalocean.app` |
| `NODE_ENV` | `development` | `production` |
| `NEXTAUTH_SECRET` | Dev secret (can be simple) | Production secret (must be secure) |
| `DATABASE_URL` | Same as production | Same as development |

## ✅ Verification Checklist

### Local Development
- [ ] `.env.local` exists (not committed to git)
- [ ] `NEXTAUTH_URL=http://localhost:3000` in `.env.local`
- [ ] Google redirect URI `http://localhost:3000/api/auth/callback/google` added in Google Console
- [ ] `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` set in `.env.local`
- [ ] Can sign in with Google locally

### Production
- [ ] `NEXTAUTH_URL=https://netzero-gecrc.ondigitalocean.app` set in DigitalOcean
- [ ] Google redirect URI `https://netzero-gecrc.ondigitalocean.app/api/auth/callback/google` added in Google Console
- [ ] All environment variables set in DigitalOcean App Platform
- [ ] Can sign in with Google in production

## 🐛 Troubleshooting

### Issue: Can't sign in locally with Google

**Check:**
1. `.env.local` has `NEXTAUTH_URL="http://localhost:3000"` (no trailing slash)
2. Google Cloud Console has `http://localhost:3000/api/auth/callback/google` as authorized redirect URI
3. `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set correctly in `.env.local`
4. Restart dev server after changing `.env.local`

### Issue: Can't sign in in production

**Check:**
1. DigitalOcean has `NEXTAUTH_URL=https://netzero-gecrc.ondigitalocean.app` set
2. Google Cloud Console has `https://netzero-gecrc.ondigitalocean.app/api/auth/callback/google` as authorized redirect URI
3. All environment variables are set in DigitalOcean
4. App has been redeployed after setting environment variables

### Issue: Environment variables getting mixed up

**Solution:**
- ✅ `.env.local` is gitignored (won't be committed)
- ✅ Production variables are set in DigitalOcean (not in code)
- ✅ `.env.example` is the template (no secrets)
- ✅ Never commit `.env.local` to git

## 📝 Notes

- **`.env.local`** is automatically loaded by Next.js in development
- **DigitalOcean environment variables** are automatically loaded in production
- **Never** put production secrets in `.env.local`
- **Always** use `.env.example` as a template for new developers

