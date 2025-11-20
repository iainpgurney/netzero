# Debug: redirect_uri_mismatch Error

## The Problem
Even though the redirect URI is configured in Google Console, you're still getting `redirect_uri_mismatch`. This means **the Client ID in DigitalOcean doesn't match the Client ID of the OAuth client that has the redirect URI**.

## Step-by-Step Debugging

### Step 1: Check Which Client ID is Being Used
After deployment, visit:
```
https://netzero-gecrc.ondigitalocean.app/api/oauth-check
```

This will show you the **exact Client ID** that your app is using.

### Step 2: Find the Matching OAuth Client in Google Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Look through all your OAuth 2.0 Client IDs
4. Find the one whose Client ID **exactly matches** what you saw in Step 1

### Step 3: Verify the Redirect URI
In the OAuth client from Step 2, check if it has this redirect URI:
```
https://netzero-gecrc.ondigitalocean.app/api/auth/callback/google
```

**Common Issues:**
- ❌ The redirect URI is in a **different** OAuth client (not the one being used)
- ❌ There's a typo in the redirect URI
- ❌ Missing `https://` or has `http://` instead
- ❌ Has a trailing slash: `/api/auth/callback/google/`

### Step 4: Fix It
**Option A:** If the redirect URI is missing from the correct OAuth client:
- Add it to the OAuth client that matches your Client ID

**Option B:** If you want to use a different OAuth client:
- Update `GOOGLE_CLIENT_ID` in DigitalOcean to match the OAuth client that has the redirect URI
- Update `GOOGLE_CLIENT_SECRET` to match as well

## About NODE_ENV

**DO NOT manually set `NODE_ENV` in DigitalOcean.** Next.js automatically sets it:
- `production` during `next build`
- `development` during `next dev`

If you have `NODE_ENV` set in DigitalOcean, **remove it**. It can cause unexpected behavior.

## Quick Checklist

- [ ] Visit `/api/oauth-check` to see the Client ID being used
- [ ] Find that Client ID in Google Cloud Console
- [ ] Verify that OAuth client has the redirect URI: `https://netzero-gecrc.ondigitalocean.app/api/auth/callback/google`
- [ ] If not, either add the redirect URI OR update DigitalOcean to use a different Client ID
- [ ] Remove `NODE_ENV` from DigitalOcean if it's set manually
- [ ] Redeploy after making changes

