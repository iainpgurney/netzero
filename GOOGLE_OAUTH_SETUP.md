# Google OAuth Setup Guide

## 🔗 Authorized Redirect URIs for Google Cloud Console

To enable Google Sign-In, you need to add the following **Authorized redirect URIs** in your Google Cloud Console:

### Production URL
```
https://netzero-gecrc.ondigitalocean.app/api/auth/callback/google
```

### Development URL (for local testing)
```
http://localhost:3000/api/auth/callback/google
```

## 📋 Step-by-Step Setup

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Select your project (or create a new one)

2. **Enable Google+ API**
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google+ API" or "Google Identity"
   - Click "Enable"

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - If prompted, configure the OAuth consent screen first

4. **Configure OAuth Consent Screen**
   - Choose "External" (unless you have a Google Workspace)
   - Fill in required fields:
     - App name: "Carma Root Training Suite"
     - User support email: Your email
     - Developer contact: Your email
   - Add scopes: `email`, `profile`
   - Save and continue

5. **Add Authorized Redirect URIs**
   - In the OAuth 2.0 Client ID creation/edit form
   - Under "Authorized redirect URIs", click "Add URI"
   - Add both URLs:
     ```
     https://netzero-gecrc.ondigitalocean.app/api/auth/callback/google
     http://localhost:3000/api/auth/callback/google
     ```
   - Click "Save"

6. **Copy Credentials**
   - After creating, you'll see:
     - **Client ID** (e.g., `123456789-abcdefg.apps.googleusercontent.com`)
     - **Client Secret** (e.g., `GOCSPX-abcdefghijklmnopqrstuvwxyz`)
   - Copy these values

7. **Add to DigitalOcean Environment Variables**
   - Go to your DigitalOcean App Platform
   - Navigate to "Settings" > "App-Level Environment Variables"
   - Add:
     ```
     GOOGLE_CLIENT_ID=your-client-id-here
     GOOGLE_CLIENT_SECRET=your-client-secret-here
     ```
   - Save and redeploy

## ✅ Verification

After setup:
1. Visit: https://netzero-gecrc.ondigitalocean.app/
2. Click "Sign in with Google"
3. You should be redirected to Google's consent screen
4. After approval, you'll be redirected back to the app

## 🔒 Domain Restrictions

The app currently allows Google sign-in only for approved domains:
- Default: `carma.earth`
- Configured via `ALLOWED_GOOGLE_DOMAINS` environment variable

To add more domains:
- Add comma-separated domains: `carma.earth,example.com`
- Or add domains to the database `AllowedDomain` table

## 🐛 Troubleshooting

**Error: "redirect_uri_mismatch"**
- Verify the redirect URI in Google Console matches exactly: `https://netzero-gecrc.ondigitalocean.app/api/auth/callback/google`
- Check for trailing slashes or typos
- Ensure you're using the correct environment (production vs development)

**Error: "access_denied"**
- Check domain allowlist in environment variables
- Verify user's email domain is in `ALLOWED_GOOGLE_DOMAINS`
- Check database `AllowedDomain` table if configured

**Error: "invalid_client"**
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set correctly
- Check for extra spaces or quotes in environment variables
- Ensure credentials are from the correct Google Cloud project

---

**Last Updated:** 2025-11-19
**Production URL:** https://netzero-gecrc.ondigitalocean.app

