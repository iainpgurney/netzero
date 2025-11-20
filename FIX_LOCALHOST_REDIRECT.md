# Fix: Google OAuth Redirecting to localhost:3000

## 🔍 Root Cause

NextAuth constructs the OAuth callback URL based on:
1. `NEXTAUTH_URL` environment variable (if set)
2. Request headers (`Host` header) as fallback

If `NEXTAUTH_URL` is not set in DigitalOcean, NextAuth falls back to request headers, which may default to `localhost:3000`.

## ✅ Solution: Set NEXTAUTH_URL in DigitalOcean

### Step 1: Verify Current Environment Variables

1. Go to DigitalOcean App Platform
2. Navigate to your app → **Settings** → **App-Level Environment Variables**
3. Check if `NEXTAUTH_URL` exists

### Step 2: Add/Update NEXTAUTH_URL

**CRITICAL:** Set `NEXTAUTH_URL` exactly as follows:

```
NEXTAUTH_URL=https://netzero-gecrc.ondigitalocean.app
```

**Important Rules:**
- ✅ No quotes around the value
- ✅ No spaces around the `=` sign
- ✅ No trailing slash (`/`)
- ✅ Must use `https://` (not `http://`)
- ✅ Must match your exact production domain

### Step 3: Verify Other Required Variables

Also ensure these are set:
```
NEXTAUTH_SECRET=<your-32+ character secret>
GOOGLE_CLIENT_ID=<your-production-client-id>
GOOGLE_CLIENT_SECRET=<your-production-client-secret>
```

### Step 4: Redeploy

After setting environment variables:
1. **Redeploy your app** (environment variables are read at runtime, not build time)
2. Check the deployment logs for:
   ```
   [AUTH CONFIG] NEXTAUTH_URL: https://netzero-gecrc.ondigitalocean.app
   ```
   If you see `NOT SET`, the variable is not configured correctly.

### Step 5: Test

1. Visit `/api/auth/diagnostics` to verify env vars
2. Try Google sign-in
3. Check that redirect goes to production URL, not localhost

## 🐛 Troubleshooting

### Issue: Still redirecting to localhost after setting NEXTAUTH_URL

**Possible Causes:**
1. Environment variable not saved correctly
2. App not redeployed after setting variable
3. Variable set at wrong level (should be App-Level, not Component-Level)
4. Typo in variable name or value

**Fix:**
1. Double-check variable name is exactly `NEXTAUTH_URL` (case-sensitive)
2. Verify value has no quotes or spaces
3. Redeploy the app
4. Check runtime logs (not build logs) for `[AUTH CONFIG] NEXTAUTH_URL:`

### Issue: Environment variable shows in DigitalOcean but logs show "NOT SET"

**Possible Causes:**
1. Variable set at Component-Level instead of App-Level
2. Variable name has trailing space or typo
3. App needs to be redeployed

**Fix:**
1. Delete and recreate the variable at App-Level
2. Copy-paste the exact value (don't type it)
3. Redeploy the app

## 📋 Checklist

Before testing, verify:
- [ ] `NEXTAUTH_URL` is set in DigitalOcean App-Level Environment Variables
- [ ] Value is exactly `https://netzero-gecrc.ondigitalocean.app` (no quotes, no trailing slash)
- [ ] App has been redeployed after setting the variable
- [ ] Runtime logs show `[AUTH CONFIG] NEXTAUTH_URL: https://netzero-gecrc.ondigitalocean.app`
- [ ] Google Cloud Console redirect URI matches: `https://netzero-gecrc.ondigitalocean.app/api/auth/callback/google`

## 🔍 Verify Environment Variables

After deployment, visit:
```
https://netzero-gecrc.ondigitalocean.app/api/auth/diagnostics
```

This will show you if `NEXTAUTH_URL` is set correctly without exposing secrets.

