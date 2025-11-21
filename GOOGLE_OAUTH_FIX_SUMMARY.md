# Google OAuth Fix Summary

## ✅ What Has Been Fixed

### 1. Environment File Separation
- ✅ Created `.env.example` template (safe to commit, no secrets)
- ✅ Created `ENV_SETUP.md` comprehensive guide
- ✅ Updated `.gitignore` to ensure `.env.local` is never committed
- ✅ Clear separation between development (`.env.local`) and production (DigitalOcean env vars)

### 2. Enhanced Logging
- ✅ Added logging to show `NEXTAUTH_URL` value at module load time
- ✅ Added warning if `NEXTAUTH_URL` is missing in production
- ✅ Logs will show "NOT SET" if environment variable is undefined

### 3. Code Changes
- ✅ Removed invalid `url` option from `authOptions` (NextAuth v4 uses `NEXTAUTH_URL` automatically)
- ✅ Added production warnings for missing environment variables

## 🔍 How to Debug the Google OAuth Issue

### Step 1: Check DigitalOcean Logs

After deployment, check the runtime logs. You should see:

```
[AUTH CONFIG] NEXTAUTH_URL: https://netzero-gecrc.ondigitalocean.app
[AUTH CONFIG] NODE_ENV: production
[AUTH CONFIG] GOOGLE_CLIENT_ID: Set
[AUTH ROUTE] NEXTAUTH_URL: https://netzero-gecrc.ondigitalocean.app
```

**If you see:**
```
[AUTH CONFIG] NEXTAUTH_URL: NOT SET
[AUTH CONFIG] ⚠️ WARNING: NEXTAUTH_URL is not set in production!
```

**Then:** The environment variable is not set correctly in DigitalOcean.

### Step 2: Verify DigitalOcean Environment Variables

Go to DigitalOcean App Platform → Settings → App-Level Environment Variables

**CRITICAL:** Ensure these are set:

```env
NEXTAUTH_URL=https://netzero-gecrc.ondigitalocean.app
NEXTAUTH_SECRET=your-secret-min-32-chars
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret
ALLOWED_GOOGLE_DOMAINS=carma.earth
NODE_ENV=production
```

**Important:**
- ✅ `NEXTAUTH_URL` must be exactly `https://netzero-gecrc.ondigitalocean.app` (no trailing slash)
- ✅ Must use `https://` not `http://`
- ✅ Case-sensitive

### Step 3: Verify Google Cloud Console

In Google Cloud Console → APIs & Services → Credentials → Your OAuth 2.0 Client ID

**Authorized redirect URIs must include:**
```
https://netzero-gecrc.ondigitalocean.app/api/auth/callback/google
```

**For local development, also add:**
```
http://localhost:3000/api/auth/callback/google
```

### Step 4: Redeploy After Changes

**IMPORTANT:** After setting/updating environment variables in DigitalOcean:
1. Save changes
2. Trigger a new deployment (or wait for auto-deploy)
3. Wait for build to complete
4. Check logs to verify `NEXTAUTH_URL` is set correctly

## 🏠 Local Development Setup

### Create `.env.local` File

Copy `.env.example` to `.env.local`:

```powershell
Copy-Item .env.example .env.local
```

### Required Values for Local Development

```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-key-change-in-production-min-32-chars"
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-your-google-client-secret"
ALLOWED_GOOGLE_DOMAINS="carma.earth"
NODE_ENV="development"
DATABASE_URL="your-database-url"
```

### Verify Local Setup

1. Ensure `.env.local` exists (it's gitignored, won't be committed)
2. Restart dev server: `npm run dev`
3. Check console logs - should show:
   ```
   [AUTH CONFIG] NEXTAUTH_URL: http://localhost:3000
   [AUTH CONFIG] NODE_ENV: development
   ```
4. Try Google sign-in locally

## 🚨 Common Issues

### Issue: Still redirecting to localhost in production

**Cause:** `NEXTAUTH_URL` not set or incorrect in DigitalOcean

**Fix:**
1. Check DigitalOcean logs for `[AUTH CONFIG] NEXTAUTH_URL: NOT SET`
2. Set `NEXTAUTH_URL=https://netzero-gecrc.ondigitalocean.app` in DigitalOcean
3. Redeploy
4. Verify logs show correct URL

### Issue: Can't sign in locally

**Cause:** `.env.local` not set up correctly

**Fix:**
1. Create `.env.local` from `.env.example`
2. Set `NEXTAUTH_URL="http://localhost:3000"`
3. Add `http://localhost:3000/api/auth/callback/google` to Google Console
4. Restart dev server

### Issue: Environment variables getting mixed up

**Solution:**
- ✅ `.env.local` is gitignored (never committed)
- ✅ Production variables set in DigitalOcean (not in code)
- ✅ `.env.example` is template (no secrets)
- ✅ Use `ENV_SETUP.md` as reference

## 📝 Next Steps

1. **Check DigitalOcean Logs** - Verify `NEXTAUTH_URL` is set correctly
2. **Verify Environment Variables** - Ensure all required vars are set in DigitalOcean
3. **Test After Deployment** - Try Google sign-in and check network tab for redirect URL
4. **Check Browser Network Tab** - Authorization URL should include `redirect_uri=https://netzero-gecrc.ondigitalocean.app/api/auth/callback/google`

## 🔗 Reference Files

- `ENV_SETUP.md` - Complete environment variable setup guide
- `.env.example` - Template file (safe to commit)
- `GOOGLE_LOGIN_SETUP.md` - Google OAuth setup instructions

---

**Last Updated:** After adding enhanced logging and environment variable separation

