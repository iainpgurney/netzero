# NextAuth URL Debugging Guide

## Issue
Google OAuth is redirecting to `http://localhost:3000/api/auth/callback/google` instead of the production URL.

## Root Cause
NextAuth v4 constructs callback URLs based on the `NEXTAUTH_URL` environment variable. If this variable is not set correctly or not being read at runtime, NextAuth will fall back to detecting the URL from request headers, which may default to localhost.

## Solution Steps

### 1. Verify NEXTAUTH_URL in DigitalOcean

Go to DigitalOcean App Platform → Settings → App-Level Environment Variables

**CRITICAL:** Ensure `NEXTAUTH_URL` is set exactly to:
```
NEXTAUTH_URL=https://netzero-gecrc.ondigitalocean.app
```

**Important:**
- ✅ No trailing slash
- ✅ Must use `https://` not `http://`
- ✅ Must match your exact app URL
- ✅ Case-sensitive

### 2. Check DigitalOcean Logs

After deploying, check the runtime logs in DigitalOcean. You should see:
```
[AUTH CONFIG] NEXTAUTH_URL: https://netzero-gecrc.ondigitalocean.app
[AUTH CONFIG] NODE_ENV: production
[AUTH] NEXTAUTH_URL: https://netzero-gecrc.ondigitalocean.app
```

If you see `undefined` or `http://localhost:3000`, the environment variable is not set correctly.

### 3. Common Issues

#### Issue: Environment Variable Not Set
**Symptom:** Logs show `NEXTAUTH_URL: undefined`
**Fix:** Add `NEXTAUTH_URL` to DigitalOcean environment variables

#### Issue: Wrong Value
**Symptom:** Logs show wrong URL or localhost
**Fix:** Update `NEXTAUTH_URL` to exact production URL

#### Issue: Build-Time vs Runtime
**Symptom:** Variable set but still using localhost
**Fix:** 
- Ensure variable is set at **App-Level** (not component-level)
- Redeploy after setting environment variable
- Environment variables are read at runtime, not build time

### 4. Verify After Deployment

1. Check DigitalOcean logs for the `[AUTH CONFIG]` and `[AUTH]` log messages
2. Verify `NEXTAUTH_URL` shows the production URL
3. Test Google sign-in
4. Check browser network tab - the authorization URL should include `redirect_uri=https://netzero-gecrc.ondigitalocean.app/api/auth/callback/google`

### 5. If Still Not Working

If logs show the correct URL but it still redirects to localhost:

1. **Clear browser cache** - Old redirect URLs may be cached
2. **Check Google Cloud Console** - Ensure redirect URI matches exactly
3. **Verify no hardcoded URLs** - Search codebase for `localhost:3000`
4. **Check for multiple NEXTAUTH_URL variables** - Ensure only one is set at app level

## Debugging Commands

To check environment variables in DigitalOcean:
1. Go to App Platform → Settings → Environment Variables
2. Verify `NEXTAUTH_URL` is listed
3. Check the value matches exactly: `https://netzero-gecrc.ondigitalocean.app`

## Expected Behavior

After correct configuration:
- Authorization URL should be: `https://accounts.google.com/o/oauth2/v2/auth?...&redirect_uri=https://netzero-gecrc.ondigitalocean.app/api/auth/callback/google&...`
- Callback URL should be: `https://netzero-gecrc.ondigitalocean.app/api/auth/callback/google?...`

---

**Last Updated:** After adding logging to verify NEXTAUTH_URL is read correctly

