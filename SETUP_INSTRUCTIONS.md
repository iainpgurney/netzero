# Quick Setup Instructions

## ✅ Database Already Set Up!

The database has been automatically configured using SQLite - no external database server needed!

## Step 1: (Optional) Create `.env.local` file

Create a file named `.env.local` in the root directory with:

```env
NEXTAUTH_SECRET="your-random-secret-key-at-least-32-characters-long"
NEXTAUTH_URL="http://localhost:3001"
```

**Note:** The app will work without this file, but it's recommended for production.

### Generate NEXTAUTH_SECRET:

**Windows PowerShell:**
```powershell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString()))
```

**Or use any random string:**
```env
NEXTAUTH_SECRET="your-random-secret-key-at-least-32-characters-long"
```

## Step 2: Database is Ready!

The SQLite database (`prisma/dev.db`) has been created and seeded with:
- ✅ Demo user (demo@netzero.com)
- ✅ All 7 learning modules
- ✅ 35 quiz questions

If you need to reset the database:
```powershell
npm run db:push      # Reset schema
npm run db:seed      # Re-seed with demo user and modules
```

## Step 4: Start the server

```powershell
npm run dev:3001
```

## Step 5: Login

Go to http://localhost:3001 and login with:
- **Email:** `demo@netzero.com`
- **Password:** `demo123`

## Troubleshooting

### "User not found" or "CredentialsSignin" error
- Run `npm run create-demo-user` to create the demo user
- Or run `npm run db:seed` to create demo user + all modules
- Check server logs for detailed error messages

### Database file issues
- The database file is at `prisma/dev.db`
- If you need to reset: delete `prisma/dev.db` and run `npm run db:push` then `npm run db:seed`
- Make sure the `prisma` folder has write permissions

