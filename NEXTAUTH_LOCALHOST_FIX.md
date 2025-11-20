# NextAuth Localhost Redirect Fix

## 🔍 Issue Found

Google OAuth was redirecting to `http://localhost:3000/api/auth/callback/google` instead of the production URL `https://netzero-gecrc.ondigitalocean.app/api/auth/callback/google`.

## 📋 Search Results

### 1. NEXTAUTH_URL References
- ✅ Found in documentation files (expected)
- ✅ Found in environment variable examples (expected)
- ✅ Used correctly in `server/auth.ts` (now explicitly set)

### 2. localhost:3000 References Found

#### ❌ **Issue 1: `app/providers.tsx` (Line 13)**
**Problem:** Hardcoded localhost fallback for tRPC base URL
```typescript
// BEFORE:
function getBaseUrl() {
  if (typeof window !== 'undefined') return ''
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return `http://localhost:${process.env.PORT ?? 3000}`  // ❌ Hardcoded localhost
}
```

**Fix:** Added `NEXTAUTH_URL` check before localhost fallback
```typescript
// AFTER:
function getBaseUrl() {
  if (typeof window !== 'undefined') return ''
  // Use NEXTAUTH_URL in production, fallback to VERCEL_URL or localhost for development
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL  // ✅ Check NEXTAUTH_URL first
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return `http://localhost:${process.env.PORT ?? 3000}`  // Only for local dev
}
```

#### ❌ **Issue 2: `server/auth.ts` - Missing explicit `url` option**
**Problem:** NextAuth wasn't explicitly using `NEXTAUTH_URL` environment variable

**Fix:** Added explicit `url` option to `authOptions`
```typescript
// BEFORE:
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      // ...
    }),
  ],
  // ...
}

// AFTER:
export const authOptions: NextAuthOptions = {
  // Explicitly set the base URL to ensure correct callback URL generation
  url: process.env.NEXTAUTH_URL,  // ✅ Explicitly use NEXTAUTH_URL
  providers: [
    GoogleProvider({
      // ...
    }),
  ],
  // ...
}
```

### 3. NextAuth Configuration Verification

✅ **`app/api/auth/[...nextauth]/route.ts`** - Correctly imports and uses `authOptions`
✅ **`server/auth.ts`** - Uses `process.env.GOOGLE_CLIENT_ID` and `process.env.GOOGLE_CLIENT_SECRET` (no hardcoding)
✅ **`components/sign-in-button.tsx`** - Uses `signIn('google', { callbackUrl: '/courses' })` correctly (relative URL, not hardcoded)

### 4. No Hardcoded OAuth URLs Found

✅ No code constructs OAuth URLs with hardcoded localhost
✅ All redirects use relative paths or environment variables
✅ `callbackUrl` parameters use relative paths (e.g., `/courses`)

## ✅ Changes Made

### File 1: `server/auth.ts`
**Location:** Line 20
**Change:** Added explicit `url: process.env.NEXTAUTH_URL` to `authOptions`

**Why:** NextAuth v4 should automatically use `NEXTAUTH_URL`, but explicitly setting it ensures the base URL is correctly used for callback URL generation in production.

### File 2: `app/providers.tsx`
**Location:** Lines 10-15
**Change:** Updated `getBaseUrl()` to check `NEXTAUTH_URL` before falling back to localhost

**Why:** While this function is primarily for tRPC, ensuring it respects `NEXTAUTH_URL` prevents any potential issues and maintains consistency.

## 🔧 How Base URL is Now Derived

### NextAuth (OAuth Callbacks)
```typescript
// server/auth.ts
export const authOptions: NextAuthOptions = {
  url: process.env.NEXTAUTH_URL,  // Explicitly set from environment
  // ...
}
```

**Flow:**
1. NextAuth reads `url: process.env.NEXTAUTH_URL` from `authOptions`
2. In production: `NEXTAUTH_URL=https://netzero-gecrc.ondigitalocean.app`
3. Callback URLs are constructed as: `${NEXTAUTH_URL}/api/auth/callback/google`

### tRPC Client (API Calls)
```typescript
// app/providers.tsx
function getBaseUrl() {
  if (typeof window !== 'undefined') return ''  // Client-side: relative URLs
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL  // Production
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`  // Vercel
  return `http://localhost:${process.env.PORT ?? 3000}`  // Local dev only
}
```

**Flow:**
1. Client-side: Returns empty string (uses relative URLs)
2. Server-side production: Uses `NEXTAUTH_URL` if set
3. Server-side Vercel: Falls back to `VERCEL_URL`
4. Server-side local dev: Falls back to `localhost:3000`

## 📝 Summary

### Where localhost was referenced:
1. ✅ **`app/providers.tsx`** - Fixed: Now checks `NEXTAUTH_URL` first
2. ✅ **`server/auth.ts`** - Fixed: Added explicit `url` option

### Edits made:
1. Added `url: process.env.NEXTAUTH_URL` to `authOptions` in `server/auth.ts`
2. Updated `getBaseUrl()` in `app/providers.tsx` to prioritize `NEXTAUTH_URL`

### How base URL is now derived:
- **NextAuth:** Uses `process.env.NEXTAUTH_URL` explicitly set in `authOptions.url`
- **tRPC:** Uses `process.env.NEXTAUTH_URL` if available, falls back to localhost only in local development

## 🚀 Next Steps

1. **Verify Environment Variable:**
   - Ensure `NEXTAUTH_URL=https://netzero-gecrc.ondigitalocean.app` is set in DigitalOcean
   - No trailing slash

2. **Redeploy:**
   - After these changes are deployed, NextAuth will use the production URL
   - Google OAuth callbacks will redirect to: `https://netzero-gecrc.ondigitalocean.app/api/auth/callback/google`

3. **Test:**
   - Try Google sign-in after deployment
   - Verify redirect goes to production URL, not localhost

---

**Files Modified:**
- `server/auth.ts` - Added explicit `url` option
- `app/providers.tsx` - Updated `getBaseUrl()` to check `NEXTAUTH_URL` first

