# Quick Fix for Login Issues

## ✅ Database is Set Up Correctly
The demo user exists and is ready to use.

## 🔧 Fix Login Issue

### Step 1: Create `.env.local` file

Create a file named `.env.local` in the project root with:

```env
NEXTAUTH_SECRET=dev-secret-key-change-in-production-min-32-chars-long
NEXTAUTH_URL=http://localhost:3001
```

**Windows PowerShell:**
```powershell
@"
NEXTAUTH_SECRET=dev-secret-key-change-in-production-min-32-chars-long
NEXTAUTH_URL=http://localhost:3001
"@ | Out-File -FilePath .env.local -Encoding utf8
```

**Or manually:**
1. Create a new file named `.env.local` in `C:\Users\Iainpg\NetZero\`
2. Copy and paste the content above
3. Save the file

### Step 2: Restart Your Dev Server

**IMPORTANT:** You must restart the server after creating `.env.local`!

1. Stop the current server (Ctrl+C in the terminal)
2. Start it again:
   ```powershell
   npm run dev:3001
   ```

### Step 3: Try Logging In Again

- Email: `demo@netzero.com`
- Password: `demo123`

## 🔍 Debugging

If it still doesn't work:

1. **Check Browser Console** (F12 → Console tab)
   - Look for any error messages
   - Check the "Sign in result:" log

2. **Check Server Terminal**
   - Look for `[AUTH]` log messages
   - Should see: `[AUTH] Attempting login for: demo@netzero.com`
   - Should see: `[AUTH] Demo user authenticated successfully`

3. **Verify User Exists:**
   ```powershell
   npm run test-login
   ```

4. **Clear Browser Cache/Cookies**
   - Try in an incognito/private window
   - Or clear cookies for localhost:3001

## Common Issues

### "CredentialsSignin" Error
- Make sure `.env.local` exists and has `NEXTAUTH_SECRET`
- Restart the dev server after creating `.env.local`
- Check server logs for `[AUTH]` messages

### Server Not Starting
- Make sure port 3001 is not in use
- Try: `npm run dev:3002` instead

### Still Not Working?
Share the error messages from:
1. Browser console (F12)
2. Server terminal logs

