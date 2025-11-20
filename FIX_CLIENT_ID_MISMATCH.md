# Fix: redirect_uri_mismatch - Client ID Verification

## Your Current Configuration

**Client ID being used:**
```
149842233322-q6st7k8h1gt5t73amlh8bv37m9sskr61.apps.googleusercontent.com
```

**Expected redirect URI:**
```
https://netzero-gecrc.ondigitalocean.app/api/auth/callback/google
```

## Step-by-Step Fix

### Step 1: Find the OAuth Client in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Look for the OAuth 2.0 Client ID that matches:
   ```
   149842233322-q6st7k8h1gt5t73amlh8bv37m9sskr61
   ```
   (The Client ID starts with `149842233322-`)

### Step 2: Verify Redirect URI

Click on that OAuth client and check the **"Authorized redirect URIs"** section.

**It MUST have exactly this URI:**
```
https://netzero-gecrc.ondigitalocean.app/api/auth/callback/google
```

### Step 3: If Redirect URI is Missing

If the redirect URI is NOT in that OAuth client:

1. Click **"EDIT"** on the OAuth client
2. Scroll to **"Authorized redirect URIs"**
3. Click **"+ ADD URI"**
4. Add exactly:
   ```
   https://netzero-gecrc.ondigitalocean.app/api/auth/callback/google
   ```
5. Click **"SAVE"**
6. Wait 1-2 minutes for Google to propagate changes

### Step 4: If You Have Multiple OAuth Clients

If you have multiple OAuth clients and the redirect URI is in a **different** one:

**Option A:** Add redirect URI to the correct client (the one with Client ID `149842233322-...`)

**Option B:** Update DigitalOcean to use the Client ID that already has the redirect URI:
1. Copy the Client ID from the OAuth client that HAS the redirect URI
2. Update `GOOGLE_CLIENT_ID` in DigitalOcean to match
3. Update `GOOGLE_CLIENT_SECRET` to match as well
4. Redeploy

## After Fixing

Once the redirect URI matches:
1. You'll be able to see Google's account selection screen
2. You can choose **any Google account** (including your carma account)
3. The app will check if your email domain is allowed (based on `ALLOWED_GOOGLE_DOMAINS`)

## About Account Selection

The `redirect_uri_mismatch` error prevents you from even seeing the account selection screen. Once fixed:
- Google will show you all your Google accounts
- You can select `iainpgurney@gmail.com` or your carma account
- The app will then check if your domain is allowed

## Quick Checklist

- [ ] Found OAuth client with Client ID `149842233322-q6st7k8h1gt5t73amlh8bv37m9sskr61`
- [ ] Verified it has redirect URI: `https://netzero-gecrc.ondigitalocean.app/api/auth/callback/google`
- [ ] If missing, added the redirect URI
- [ ] Saved changes in Google Console
- [ ] Waited 1-2 minutes for propagation
- [ ] Tried signing in again
- [ ] Can now see account selection screen
- [ ] Can select carma account

