# Google Login Setup - Complete Guide

## 🔗 Required URLs for Google Cloud Console

### Authorized Redirect URI (Add this in Google Cloud Console)
```
https://netzero-gecrc.ondigitalocean.app/api/auth/callback/google
```

## 📋 Step-by-Step Setup

### 1. Google Cloud Console Configuration

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Select your project

2. **Enable Required APIs**
   - Navigate to "APIs & Services" > "Library"
   - Enable "Google+ API" or "Google Identity"

3. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" > "OAuth consent screen"
   - Choose "External"
   - Fill in:
     - App name: `Carma Root Training Suite`
     - User support email: Your email
     - Developer contact: Your email
   - Add scopes: `email`, `profile`, `openid`
   - Save and continue

4. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Name: `Carma Root Production`
   - **Authorized redirect URIs** - Add:
     ```
     https://netzero-gecrc.ondigitalocean.app/api/auth/callback/google
     ```
   - Click "Create"
   - **Copy the Client ID and Client Secret**

### 2. DigitalOcean Environment Variables

Go to DigitalOcean App Platform → Settings → App-Level Environment Variables

**Add/Verify these variables:**

```env
NEXTAUTH_URL=https://netzero-gecrc.ondigitalocean.app
NEXTAUTH_SECRET=your-secret-min-32-chars
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret
ALLOWED_GOOGLE_DOMAINS=carma.earth
```

**Critical Notes:**
- `NEXTAUTH_URL` must be exactly `https://netzero-gecrc.ondigitalocean.app` (no trailing slash)
- `NEXTAUTH_SECRET` must be at least 32 characters
- Copy Client ID and Secret exactly from Google Console (no extra spaces)

### 3. Redeploy Application

After setting environment variables:
1. Save changes in DigitalOcean
2. Trigger a new deployment (or wait for auto-deploy)
3. Wait for build to complete

### 4. Test Google Login

1. Visit: https://netzero-gecrc.ondigitalocean.app/
2. Click "Sign in with Google"
3. You should be redirected to Google's consent screen
4. After approval, you'll be redirected back to the app

## 🐛 Troubleshooting

### Issue: Redirect hangs showing `)]}'` JSON response

**Cause:** `NEXTAUTH_URL` not set or incorrect

**Fix:**
1. Verify `NEXTAUTH_URL=https://netzero-gecrc.ondigitalocean.app` in DigitalOcean
2. Ensure no trailing slash
3. Redeploy after changes

### Issue: "redirect_uri_mismatch" error

**Cause:** Redirect URI in Google Console doesn't match

**Fix:**
1. Check Google Console → Credentials → Your OAuth Client
2. Verify redirect URI is exactly: `https://netzero-gecrc.ondigitalocean.app/api/auth/callback/google`
3. No trailing slash, exact match required

### Issue: "access_denied" after Google login

**Cause:** User's email domain not in allowlist

**Fix:**
1. Check `ALLOWED_GOOGLE_DOMAINS` environment variable
2. Add user's domain (e.g., `carma.earth,example.com`)
3. Or add domain to database `AllowedDomain` table

### Issue: "This app isn't verified"

**Cause:** OAuth consent screen not published

**Fix:**
1. Go to Google Cloud Console → OAuth consent screen
2. Click "Publish App" (or add test users)
3. Wait a few minutes for changes to propagate

## ✅ Verification Checklist

- [ ] Google Cloud Console OAuth consent screen configured
- [ ] OAuth 2.0 Client ID created
- [ ] Redirect URI added: `https://netzero-gecrc.ondigitalocean.app/api/auth/callback/google`
- [ ] `NEXTAUTH_URL` set in DigitalOcean: `https://netzero-gecrc.ondigitalocean.app`
- [ ] `NEXTAUTH_SECRET` set (min 32 chars)
- [ ] `GOOGLE_CLIENT_ID` set in DigitalOcean
- [ ] `GOOGLE_CLIENT_SECRET` set in DigitalOcean
- [ ] `ALLOWED_GOOGLE_DOMAINS` set (e.g., `carma.earth`)
- [ ] App redeployed after env var changes
- [ ] Test Google login works

## 📝 Quick Reference

**Production URL:** https://netzero-gecrc.ondigitalocean.app
**Callback URL:** https://netzero-gecrc.ondigitalocean.app/api/auth/callback/google

**Where to add redirect URI:** Google Cloud Console → APIs & Services → Credentials → Your OAuth 2.0 Client ID → Authorized redirect URIs

---

**Last Updated:** 2025-11-19

