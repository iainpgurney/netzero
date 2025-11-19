# Google OAuth Redirect Issue Fix

## Problem
Getting stuck on redirect page showing Google JSON response: `)]}'` 

This happens when:
1. **NEXTAUTH_URL is not set correctly** in DigitalOcean environment variables
2. **Redirect URI mismatch** between Google Console and NextAuth
3. **Missing or incorrect callback handler**

## ✅ Solution

### 1. Verify NEXTAUTH_URL in DigitalOcean

Go to DigitalOcean App Platform → Settings → App-Level Environment Variables

**CRITICAL:** Ensure `NEXTAUTH_URL` is set to:
```
NEXTAUTH_URL=https://netzero-gecrc.ondigitalocean.app
```

**Important Notes:**
- Must be exactly `https://netzero-gecrc.ondigitalocean.app` (no trailing slash)
- Must match your actual app URL
- Case-sensitive

### 2. Verify Google Cloud Console Redirect URI

In Google Cloud Console → APIs & Services → Credentials → Your OAuth 2.0 Client ID

**Authorized redirect URIs must include:**
```
https://netzero-gecrc.ondigitalocean.app/api/auth/callback/google
```

**Check:**
- ✅ Exact match (no trailing slash)
- ✅ Uses `https://` not `http://`
- ✅ Full path: `/api/auth/callback/google`
- ✅ No extra spaces or characters

### 3. Verify Environment Variables in DigitalOcean

All these must be set:
```
NEXTAUTH_URL=https://netzero-gecrc.ondigitalocean.app
NEXTAUTH_SECRET=your-secret-here-min-32-chars
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret
ALLOWED_GOOGLE_DOMAINS=carma.earth
```

### 4. Redeploy After Changes

After updating environment variables:
1. Save changes in DigitalOcean
2. Trigger a new deployment
3. Wait for build to complete
4. Test Google sign-in again

## 🔍 Debugging Steps

### Check DigitalOcean Logs

1. Go to DigitalOcean App Platform → Runtime Logs
2. Look for errors related to:
   - `NEXTAUTH_URL`
   - `redirect_uri_mismatch`
   - Authentication errors

### Test the Callback URL Directly

Try visiting:
```
https://netzero-gecrc.ondigitalocean.app/api/auth/callback/google
```

If you see an error page, that's normal (needs OAuth flow).
If you see a blank page or JSON, there's a configuration issue.

### Verify Google OAuth Credentials

1. Check Google Cloud Console → Credentials
2. Verify Client ID and Secret match what's in DigitalOcean
3. Check "Authorized redirect URIs" list
4. Ensure OAuth consent screen is published (if required)

## 🚨 Common Issues

### Issue 1: NEXTAUTH_URL Not Set
**Symptom:** Redirect hangs, shows JSON response
**Fix:** Add `NEXTAUTH_URL=https://netzero-gecrc.ondigitalocean.app` to DigitalOcean env vars

### Issue 2: Redirect URI Mismatch
**Symptom:** Google shows "redirect_uri_mismatch" error
**Fix:** Ensure Google Console has exact URL: `https://netzero-gecrc.ondigitalocean.app/api/auth/callback/google`

### Issue 3: Domain Not Allowed
**Symptom:** Login works but user is rejected
**Fix:** Add user's email domain to `ALLOWED_GOOGLE_DOMAINS` or database `AllowedDomain` table

### Issue 4: OAuth Consent Screen Not Published
**Symptom:** Google shows "This app isn't verified"
**Fix:** In Google Cloud Console → OAuth consent screen → Publish app (or add test users)

## 📝 Quick Checklist

- [ ] `NEXTAUTH_URL` set to `https://netzero-gecrc.ondigitalocean.app` in DigitalOcean
- [ ] `NEXTAUTH_SECRET` is at least 32 characters
- [ ] `GOOGLE_CLIENT_ID` is set correctly
- [ ] `GOOGLE_CLIENT_SECRET` is set correctly
- [ ] Google Console redirect URI matches exactly: `https://netzero-gecrc.ondigitalocean.app/api/auth/callback/google`
- [ ] OAuth consent screen is configured
- [ ] App redeployed after env var changes
- [ ] User's email domain is in `ALLOWED_GOOGLE_DOMAINS`

---

**Production URL:** https://netzero-gecrc.ondigitalocean.app
**Callback URL:** https://netzero-gecrc.ondigitalocean.app/api/auth/callback/google

