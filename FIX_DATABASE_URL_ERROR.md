# Fix: DATABASE_URL Error - "URL must start with postgresql://"

## The Error
```
Error validating datasource 'db': the URL must start with the protocol `postgresql://' or 'postgres://`
```

This means `DATABASE_URL` in DigitalOcean is either:
- ❌ Not set
- ❌ Has quotes around it (`"postgresql://..."`)
- ❌ Has whitespace before/after
- ❌ Doesn't start with `postgresql://` or `postgres://`

## ✅ Quick Fix

### Step 1: Get Your Correct DATABASE_URL

Your DigitalOcean PostgreSQL connection string should look like:
```
postgresql://doadmin:YOUR_PASSWORD@db-postgresql-lon1-ccx-do-user-12481992-0.h.db.ondigitalocean.com:25060/netzero?sslmode=require
```

**Get it from:** DigitalOcean → Databases → Your PostgreSQL DB → Connection Details

### Step 2: Fix DATABASE_URL in DigitalOcean

1. Go to **DigitalOcean App Platform**
2. Select your app (`netzero-gecrc`)
3. Go to **Settings** → **App-Level Environment Variables**
4. Find `DATABASE_URL` (or add it if missing)
5. **CRITICAL:** Set the value **exactly** like this:

```
postgresql://doadmin:YOUR_PASSWORD@db-postgresql-lon1-ccx-do-user-12481992-0.h.db.ondigitalocean.com:25060/netzero?sslmode=require
```

**Rules:**
- ✅ NO quotes around the value
- ✅ NO spaces before or after
- ✅ Must start with `postgresql://` (not `postgres://` or anything else)
- ✅ Replace `YOUR_PASSWORD` with your actual database password

### Step 3: Common Mistakes to Avoid

**❌ WRONG:**
```
DATABASE_URL="postgresql://..."  (has quotes)
DATABASE_URL= postgresql://...   (has space after =)
DATABASE_URL=postgresql://...     (has space before postgresql)
DATABASE_URL=postgres://...       (wrong protocol)
```

**✅ CORRECT:**
```
DATABASE_URL=postgresql://doadmin:password@host:25060/netzero?sslmode=require
```

### Step 4: Redeploy

After fixing `DATABASE_URL`:
1. **Save** the environment variable
2. **Redeploy** your app (or wait for auto-deploy)
3. The error should be gone!

## 🔍 Verify DATABASE_URL Format

After setting it, you can verify by visiting:
```
https://netzero-gecrc.ondigitalocean.app/api/db-check
```

This will show if `DATABASE_URL` is correctly formatted and if the database is accessible.

## 🐛 Still Not Working?

### Check 1: Verify Format
Make sure `DATABASE_URL`:
- Starts with `postgresql://` (exactly)
- Has no quotes
- Has no spaces
- Includes `?sslmode=require` at the end

### Check 2: Test Connection Locally
```powershell
# Set DATABASE_URL locally
$env:DATABASE_URL="postgresql://doadmin:YOUR_PASSWORD@db-postgresql-lon1-ccx-do-user-12481992-0.h.db.ondigitalocean.com:25060/netzero?sslmode=require"

# Test connection
npm run db:test-do
```

If this works locally, copy the **exact same value** to DigitalOcean.

### Check 3: Check DigitalOcean Logs
After redeploying, check runtime logs for:
- `DATABASE_URL` validation errors
- Connection errors
- Prisma initialization errors

## 📋 Complete Checklist

- [ ] `DATABASE_URL` is set in DigitalOcean App-Level Environment Variables
- [ ] Value starts with `postgresql://` (no quotes, no spaces)
- [ ] Value includes your actual database password
- [ ] Value includes `?sslmode=require` at the end
- [ ] App has been redeployed after setting the variable
- [ ] `/api/db-check` endpoint shows database is accessible

## ✅ After Fixing

Once `DATABASE_URL` is correctly set:
- ✅ Profile page will load without errors
- ✅ Certificates will load (if any earned)
- ✅ Courses will be accessible
- ✅ All database operations will work

