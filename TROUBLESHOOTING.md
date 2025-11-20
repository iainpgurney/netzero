# Troubleshooting Guide

## Environment Variables Are Set Correctly But Still Having Issues?

If `/api/auth/diagnostics` shows all variables are set correctly but you're still experiencing issues, check the following:

## 1. What Specific Error Are You Seeing?

### A. Still Redirecting to localhost:3000?

**Check:**
1. Visit: `https://netzero-gecrc.ondigitalocean.app/api/auth/providers`
   - Should return JSON with Google provider
   - If it redirects to localhost, NextAuth isn't reading NEXTAUTH_URL correctly

2. Check Runtime Logs (not Build Logs) for:
   ```
   [AUTH CONFIG] NEXTAUTH_URL: https://netzero-gecrc.ondigitalocean.app
   ```
   - If you see `localhost:3000`, the variable isn't being read at runtime

**Fix:**
- Delete `NEXTAUTH_URL` from DigitalOcean
- Re-add it with exact value: `https://netzero-gecrc.ondigitalocean.app`
- Redeploy

### B. 500 Error on `/auth/error` Page?

**Check Runtime Logs for:**
- Database connection errors
- Missing imports
- Component errors

**Test the error page directly:**
```
https://netzero-gecrc.ondigitalocean.app/auth/error?error=Callback
```

If this works but NextAuth redirects fail, the issue is in NextAuth configuration.

### C. Google OAuth Not Working?

**Check:**
1. Google Cloud Console → OAuth 2.0 Client IDs
2. Verify Authorized Redirect URI is exactly:
   ```
   https://netzero-gecrc.ondigitalocean.app/api/auth/callback/google
   ```
3. Verify you're using the **production** OAuth client (not dev)

**Test:**
1. Try signing in with Google
2. Check browser console for errors
3. Check Runtime Logs for OAuth errors

## 2. Verify NextAuth is Using Correct URL

Add this temporary test endpoint to see what NextAuth thinks the URL is:

```typescript
// app/api/test-auth-url/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NODE_ENV: process.env.NODE_ENV,
    // Try to get from NextAuth
    message: 'Check if NextAuth is using correct URL'
  })
}
```

Visit: `https://netzero-gecrc.ondigitalocean.app/api/test-auth-url`

## 3. Check Runtime Logs

**Important:** Check **Runtime Logs** (not Build Logs) in DigitalOcean:

1. Go to DigitalOcean → Your App → Runtime Logs
2. Look for:
   - `[AUTH CONFIG]` messages
   - `[AUTH ROUTE]` messages
   - `🔄 redirect callback called` messages
   - Any error messages

## 4. Common Issues

### Issue: Variables Set But Not Being Read

**Symptoms:**
- Diagnostics shows variables are set
- But runtime logs show "NOT SET"

**Fix:**
- Variables might be set at Component-Level instead of App-Level
- Delete and recreate at App-Level
- Redeploy

### Issue: Cached Build

**Symptoms:**
- Updated variables but still seeing old values

**Fix:**
- Force a new deployment
- Clear build cache if available
- Wait a few minutes for changes to propagate

### Issue: Multiple NEXTAUTH_URL Variables

**Symptoms:**
- Conflicting values

**Fix:**
- Check if variable exists multiple times
- Delete all instances
- Add single correct value
- Redeploy

## 5. Test Checklist

Run these tests in order:

1. ✅ `/api/auth/diagnostics` - Shows all variables set correctly
2. ✅ `/api/auth/providers` - Returns JSON (not redirects to localhost)
3. ✅ `/auth/error?error=Test` - Error page loads without 500 error
4. ✅ Try Google sign-in - Should redirect to Google, then back to production URL

## 6. Still Not Working?

If all above checks pass but it's still not working:

1. **Check Runtime Logs** for specific error messages
2. **Check Browser Console** for client-side errors
3. **Verify Google Cloud Console** redirect URI matches exactly
4. **Test with a fresh browser session** (incognito mode)

## Need More Help?

Provide:
1. What specific error you're seeing
2. Runtime Logs output (last 50 lines)
3. Browser console errors (if any)
4. What happens when you try to sign in

