# Environment Variables Setup

## ✅ Created `.env.local` File

I've created a `.env.local` file for you. This file is gitignored (won't be committed to git) and contains your local environment variables.

## 🔧 Required Configuration

### 1. Update DATABASE_URL

**IMPORTANT:** You need to replace `YOUR_PASSWORD_HERE` with your actual DigitalOcean database password.

Open `.env.local` and update:
```env
DATABASE_URL="postgresql://doadmin:YOUR_ACTUAL_PASSWORD@db-postgresql-lon1-ccx-do-user-12481992-0.h.db.ondigitalocean.com:25060/netzero?sslmode=require"
```

### 2. Generate NEXTAUTH_SECRET (Optional but Recommended)

For production, generate a secure secret:
```powershell
# Option 1: Using OpenSSL (if installed)
openssl rand -base64 32

# Option 2: Online generator
# Visit: https://generate-secret.vercel.app/32
```

Then update in `.env.local`:
```env
NEXTAUTH_SECRET="your-generated-secret-here"
```

### 3. Google OAuth (Optional)

If you want to enable Google Sign-In:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Add authorized redirect URI:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://your-domain.com/api/auth/callback/google`
6. Copy Client ID and Client Secret to `.env.local`

### 4. OpenAI API Keys (Required for Greenwashing Detection)

For the enhanced greenwashing detection system:

1. Add your OpenAI API keys to `.env.local`:
   ```env
   OPENAI_API_KEY="your-production-openai-api-key-here"
   OPENAI_API_KEY_STAGING="your-staging-openai-api-key-here"
   ```
   
   **Note:** Get your API keys from [OpenAI Platform](https://platform.openai.com/api-keys)

2. The system will use `OPENAI_API_KEY` for production and `OPENAI_API_KEY_STAGING` for staging/testing.

## 📋 Current `.env.local` Contents

```env
DATABASE_URL="postgresql://doadmin:YOUR_PASSWORD_HERE@..."
NEXTAUTH_SECRET="dev-secret-key-change-in-production-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
ALLOWED_GOOGLE_DOMAINS="carma.earth"
NODE_ENV="development"
OPENAI_API_KEY=""
OPENAI_API_KEY_STAGING=""
NEXT_PUBLIC_POSTHOG_KEY=""
NEXT_PUBLIC_POSTHOG_HOST=""
```

## ✅ Next Steps

After updating `.env.local`:

1. **Push schema to database:**
   ```powershell
   npx prisma db push
   ```

2. **Seed the database:**
   ```powershell
   npm run db:seed
   ```

3. **Start dev server:**
   ```powershell
   npm run dev
   ```

## 🔒 Security Notes

- ✅ `.env.local` is gitignored (won't be committed)
- ✅ Never commit `.env.local` to git
- ✅ Use `.env.example` as a template (without secrets)
- ✅ For production (Netlify), set environment variables in Netlify dashboard

