# Fix: redirect_uri_mismatch Error

## ✅ Good News!
NextAuth is working correctly! The error is just that Google doesn't recognize your redirect URI.

## 🔧 Quick Fix (5 minutes)

### Step 1: Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/
2. Select your project
3. Navigate to: **APIs & Services** → **Credentials**

### Step 2: Find Your OAuth 2.0 Client ID
- Look for your production OAuth client (the one with the Client ID you're using in DigitalOcean)
- Click on it to edit

### Step 3: Add the Redirect URI
In the **"Authorized redirect URIs"** section, click **"+ ADD URI"** and add:

```
https://netzero-gecrc.ondigitalocean.app/api/auth/callback/google
```

**CRITICAL:** 
- ✅ Copy the URL exactly as shown above
- ✅ No trailing slash
- ✅ Must use `https://` (not `http://`)
- ✅ Must match exactly (case-sensitive)

### Step 4: Save
- Click **"SAVE"** at the bottom
- Wait 1-2 minutes for Google to propagate the changes

### Step 5: Test Again
1. Go to: https://netzero-gecrc.ondigitalocean.app/
2. Click "Sign in with Google"
3. Should now work! 🎉

## 📋 Complete Checklist

Make sure you have BOTH redirect URIs if you want to test locally too:

**For Production:**
```
https://netzero-gecrc.ondigitalocean.app/api/auth/callback/google
```

**For Local Development (optional):**
```
http://localhost:3000/api/auth/callback/google
```

## 🐛 Still Not Working?

### Check 1: Verify the Exact URL
The error message shows:
```
redirect_uri=https://netzero-gecrc.ondigitalocean.app/api/auth/callback/google
```

Make sure this EXACT URL is in Google Console (copy-paste it, don't type it).

### Check 2: Verify You're Using the Right OAuth Client
- Make sure you're editing the **production** OAuth client (not a dev/test one)
- The Client ID should match what's in DigitalOcean environment variables

### Check 3: Check for Typos
Common mistakes:
- ❌ `http://` instead of `https://`
- ❌ Trailing slash: `/api/auth/callback/google/`
- ❌ Wrong domain: `netzero-gecrc.ondigitalocean.com` (should be `.app`)
- ❌ Extra spaces before/after the URL

### Check 4: Wait for Propagation
Google changes can take 1-5 minutes to propagate. Wait a few minutes and try again.

## ✅ Verification

After adding the redirect URI, you should be able to:
1. Click "Sign in with Google" on your production site
2. See Google's consent screen
3. Be redirected back to your app after approval
4. Successfully log in!

---

**Production URL:** https://netzero-gecrc.ondigitalocean.app  
**Callback URL:** https://netzero-gecrc.ondigitalocean.app/api/auth/callback/google

