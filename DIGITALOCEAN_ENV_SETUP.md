# DigitalOcean Environment Variables Setup Guide

## ⚠️ IMPORTANT: .env Files Are NOT Deployed

**Environment variables are NOT stored in files in production.** They must be set in DigitalOcean's web interface.

- ❌ `.env.local` - Only for local development, NOT deployed
- ❌ `.env` - Only for local development, NOT deployed  
- ✅ **DigitalOcean App Settings** - This is where production env vars are set

## Step-by-Step: Set Environment Variables in DigitalOcean

### Step 1: Access Your App Settings

1. Log in to [DigitalOcean](https://cloud.digitalocean.com/)
2. Go to **Apps** → Select your app (`netzero-gecrc`)
3. Click on **Settings** tab
4. Scroll down to **App-Level Environment Variables** section

### Step 2: Add/Update Required Variables

Click **Edit** or **Add Variable** and set these **exactly**:

#### 1. NEXTAUTH_URL (CRITICAL - Fixes localhost redirect)
```
Key: NEXTAUTH_URL
Value: https://netzero-gecrc.ondigitalocean.app
```
**Rules:**
- ✅ No quotes around the value
- ✅ No spaces around the `=` sign
- ✅ No trailing slash (`/`)
- ✅ Must use `https://` (not `http://`)
- ✅ Must match your exact app URL

#### 2. NEXTAUTH_SECRET (Required for sessions)
```
Key: NEXTAUTH_SECRET
Value: <your-32+ character secret>
```
**How to generate:**
```bash
openssl rand -base64 32
```
Or use an online generator (must be 32+ characters)

#### 3. GOOGLE_CLIENT_ID (Your production OAuth client ID)
```
Key: GOOGLE_CLIENT_ID
Value: <your-production-client-id-from-google-cloud-console>
```
**Important:** Use your **production** OAuth client ID, not the dev one

#### 4. GOOGLE_CLIENT_SECRET (Your production OAuth client secret)
```
Key: GOOGLE_CLIENT_SECRET
Value: <your-production-client-secret-from-google-cloud-console>
```
**Important:** Use your **production** OAuth client secret, not the dev one

#### 5. DATABASE_URL (If using Prisma)
```
Key: DATABASE_URL
Value: <your-database-connection-string>
```

#### 6. Optional: ALLOWED_GOOGLE_DOMAINS
```
Key: ALLOWED_GOOGLE_DOMAINS
Value: carma.earth
```
(Comma-separated list of allowed email domains)

### Step 3: Verify Variables Are Set

After adding/updating variables:

1. **Check the list** - You should see all variables listed
2. **Verify spelling** - Variable names are case-sensitive:
   - ✅ `NEXTAUTH_URL` (correct)
   - ❌ `NEXTAUTH_Url` (wrong)
   - ❌ `nextauth_url` (wrong)

### Step 4: Redeploy Your App

**CRITICAL:** After setting environment variables, you MUST redeploy:

1. Go to **Deployments** tab
2. Click **Create Deployment** or **Redeploy**
3. Wait for deployment to complete

**Why?** Environment variables are read at **runtime**, not build time. The app needs to restart to pick up new variables.

### Step 5: Verify Variables Are Loaded

After deployment, check the **Runtime Logs** (not build logs):

1. Go to **Runtime Logs** tab
2. Look for these log messages:
   ```
   [AUTH CONFIG] NEXTAUTH_URL: https://netzero-gecrc.ondigitalocean.app
   [AUTH CONFIG] NODE_ENV: production
   [AUTH CONFIG] GOOGLE_CLIENT_ID: Set
   ✅ Google OAuth credentials loaded: {...}
   ```

**If you see:**
- `NEXTAUTH_URL: NOT SET` → Variable not set correctly
- `NEXTAUTH_URL: http://localhost:3000` → Wrong value, update it
- `GOOGLE_CLIENT_ID: Missing` → Variable not set

### Step 6: Test the Diagnostic Endpoint

Visit this URL after deployment:
```
https://netzero-gecrc.ondigitalocean.app/api/auth/diagnostics
```

This will show you:
- Which variables are set
- Which variables are missing
- Common issues (quotes, whitespace, etc.)

## Common Issues & Fixes

### Issue 1: Variables Not Showing Up After Setting

**Symptoms:**
- Set variable in DigitalOcean
- Logs still show "NOT SET"
- App still uses wrong values

**Fix:**
1. Verify variable name is spelled correctly (case-sensitive)
2. **Redeploy the app** after setting variables
3. Check **Runtime Logs** (not Build Logs) - variables are read at runtime

### Issue 2: Still Redirecting to localhost

**Symptoms:**
- OAuth redirects to `http://localhost:3000`
- Build logs show `NEXTAUTH_URL: http://localhost:3000`

**Fix:**
1. Check DigitalOcean environment variables
2. Find `NEXTAUTH_URL` - if it's set to `http://localhost:3000`, **delete it**
3. Add new `NEXTAUTH_URL` with value: `https://netzero-gecrc.ondigitalocean.app`
4. **Redeploy** the app
5. Verify in Runtime Logs that it shows the production URL

### Issue 3: 500 Error on Error Page

**Symptoms:**
- `/api/auth/error` returns HTTP 500
- App crashes when OAuth fails

**Possible Causes:**
1. Error page component has issues
2. Missing environment variables causing crashes
3. Database connection issues

**Fix:**
1. Check Runtime Logs for error messages
2. Verify all required environment variables are set
3. Check if database is accessible (if using Prisma)

### Issue 4: "Invalid Client" or "Unauthorized" Errors

**Symptoms:**
- Google OAuth returns "invalid_client" error
- Authentication fails

**Fix:**
1. Verify `GOOGLE_CLIENT_ID` matches your production OAuth client
2. Verify `GOOGLE_CLIENT_SECRET` matches your production OAuth client
3. Check Google Cloud Console - ensure redirect URI matches:
   `https://netzero-gecrc.ondigitalocean.app/api/auth/callback/google`

## Verification Checklist

Before considering setup complete, verify:

- [ ] `NEXTAUTH_URL` is set to `https://netzero-gecrc.ondigitalocean.app` (no localhost)
- [ ] `NEXTAUTH_SECRET` is set and is 32+ characters
- [ ] `GOOGLE_CLIENT_ID` is set (production client ID)
- [ ] `GOOGLE_CLIENT_SECRET` is set (production client secret)
- [ ] `DATABASE_URL` is set (if using database)
- [ ] App has been **redeployed** after setting variables
- [ ] Runtime Logs show correct values (not "NOT SET" or localhost)
- [ ] `/api/auth/diagnostics` endpoint shows all variables set correctly
- [ ] Google Cloud Console redirect URI matches production URL

## Quick Reference: Variable Names

Copy-paste these exact names (case-sensitive):

```
NEXTAUTH_URL
NEXTAUTH_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
DATABASE_URL
ALLOWED_GOOGLE_DOMAINS
```

## Need Help?

If you're still having issues:

1. Check **Runtime Logs** (not Build Logs) for error messages
2. Visit `/api/auth/diagnostics` to see what variables are loaded
3. Verify Google Cloud Console redirect URIs match exactly
4. Ensure you're using **production** OAuth credentials (not dev)

---

**Remember:** Environment variables in DigitalOcean are separate from your local `.env.local` file. They must be set in the DigitalOcean web interface and the app must be redeployed for changes to take effect.

