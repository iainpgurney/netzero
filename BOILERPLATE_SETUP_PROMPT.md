# Boilerplate Setup Prompt for AI Agent

Copy and paste this prompt to an AI agent to set up a new project with the same tech stack:

---

## Project Setup: Next.js Full-Stack Application Boilerplate

Please create a new Next.js application with the following tech stack and configuration:

### Core Technologies

1. **Framework**: Next.js 14.1.0 with App Router (TypeScript)
2. **Database**: PostgreSQL with Prisma ORM (v5.9.0)
3. **Authentication**: NextAuth.js v4.24.7 with:
   - Google OAuth provider
   - Credentials provider (email/password with bcryptjs)
   - JWT session strategy
   - Domain allowlist for Google OAuth
4. **API Layer**: tRPC v10.45.0 with React Query v4.36.1
5. **Styling**: Tailwind CSS v3.4.1 with shadcn/ui components
6. **Analytics**: PostHog (posthog-js v1.296.1, posthog-node v5.12.0)
7. **Additional Libraries**:
   - SuperJSON for serialization
   - Zod for validation
   - Lucide React for icons
   - Class Variance Authority + clsx + tailwind-merge for styling utilities

### Project Structure

Create the following directory structure:

```
project-name/
├── app/
│   ├── (auth)/
│   │   └── error/
│   │       └── page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   └── trpc/
│   │       └── [trpc]/
│   │           └── route.ts
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   ├── providers.tsx
│   └── error.tsx
├── components/
│   ├── ui/          # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── label.tsx
│   ├── sign-in-button.tsx
│   ├── sign-out-button.tsx
│   ├── sign-up-button.tsx
│   └── posthog-provider.tsx
├── lib/
│   ├── utils.ts
│   ├── trpc.ts
│   └── posthog.ts
├── server/
│   ├── auth.ts
│   ├── db/
│   │   └── prisma.ts
│   ├── db.ts
│   └── trpc/
│       ├── context.ts
│       ├── trpc.ts
│       └── routers/
│           └── app.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── types/
│   └── next-auth.d.ts
├── .env.example
├── .gitignore
├── components.json
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
└── tsconfig.json
```

### Configuration Files

#### 1. package.json
Include these dependencies:
- `next@14.1.0`
- `react@^18.2.0` and `react-dom@^18.2.0`
- `typescript@^5`
- `@prisma/client@^5.9.0` and `prisma@^5.9.0`
- `next-auth@^4.24.7` and `@auth/prisma-adapter@^2.4.2`
- `@trpc/server@^10.45.0`, `@trpc/client@^10.45.0`, `@trpc/react-query@^10.45.0`
- `@tanstack/react-query@^4.36.1`
- `tailwindcss@^3.4.1`, `postcss@^8.4.35`, `autoprefixer@^10.4.18`
- `posthog-js@^1.296.1` and `posthog-node@^5.12.0`
- `superjson@^2.2.1`, `zod@^3.22.4`, `bcryptjs@^3.0.3`
- `@radix-ui/react-dialog@^1.0.5`, `@radix-ui/react-label@^2.0.2`, `@radix-ui/react-slot@^1.0.2`
- `lucide-react@^0.344.0`
- `class-variance-authority@^0.7.0`, `clsx@^2.1.0`, `tailwind-merge@^2.2.1`, `tailwindcss-animate@^1.0.7`

Dev dependencies:
- `@types/node@^20`, `@types/react@^18`, `@types/react-dom@^18`, `@types/bcryptjs@^2.4.6`
- `eslint@^8`, `eslint-config-next@14.1.0`
- `tsx@^4.7.1`

Scripts:
- `dev`: `next dev`
- `build`: `prisma generate && next build --no-lint`
- `start`: `next start`
- `db:generate`: `prisma generate`
- `db:push`: `prisma db push`
- `db:migrate`: `prisma migrate dev`
- `db:studio`: `prisma studio`
- `db:seed`: `tsx prisma/seed.ts`

Set Node engine to `18.x`.

#### 2. tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

#### 3. next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
  },
  output: 'standalone',
  reactStrictMode: true,
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
}

module.exports = nextConfig
```

#### 4. tailwind.config.ts
Configure with:
- Dark mode: `["class"]`
- Content paths: `./pages/**/*.{ts,tsx}`, `./components/**/*.{ts,tsx}`, `./app/**/*.{ts,tsx}`, `./src/**/*.{ts,tsx}`
- CSS variables for theming (background, foreground, primary, secondary, etc.)
- Border radius variables
- tailwindcss-animate plugin

#### 5. postcss.config.js
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

#### 6. components.json (shadcn/ui config)
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

### Prisma Schema

Set up a basic schema with:
- PostgreSQL datasource
- User model (with id, email, name, password, emailVerified, image, createdAt, updatedAt)
- Account model (for OAuth providers)
- Session model
- VerificationToken model

Include proper relations and indexes.

### Authentication Setup (server/auth.ts)

Configure NextAuth with:
- Google Provider (with environment variable checks)
- Credentials Provider (email/password with bcrypt hashing)
- JWT session strategy
- Domain allowlist for Google OAuth (check ALLOWED_GOOGLE_DOMAINS env var)
- Proper callbacks for signIn, jwt, session, and redirect
- Error handling and logging
- Build-time placeholder for NEXTAUTH_SECRET

### tRPC Setup

1. **server/trpc/trpc.ts**: Initialize tRPC with superjson transformer
2. **server/trpc/context.ts**: Create context with session and database
3. **server/trpc/routers/app.ts**: Create app router with example procedures
4. **lib/trpc.ts**: Create React tRPC client
5. **app/api/trpc/[trpc]/route.ts**: API route handler for tRPC

### Providers Setup (app/providers.tsx)

Create providers component with:
- React Query QueryClient
- tRPC React Provider
- PostHog Provider
- Proper base URL detection (NEXTAUTH_URL, VERCEL_URL, or localhost)

### Environment Variables (.env.example)

Create `.env.example` with:
```
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
ALLOWED_GOOGLE_DOMAINS="example.com,another.com"

# PostHog (optional)
NEXT_PUBLIC_POSTHOG_KEY="your-posthog-key"
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"
```

### Key Files to Create

1. **app/layout.tsx**: Root layout with Providers and SessionProvider
2. **app/page.tsx**: Landing page with sign-in/sign-up buttons
3. **app/dashboard/page.tsx**: Protected dashboard page
4. **app/dashboard/layout.tsx**: Dashboard layout with navigation
5. **components/sign-in-button.tsx**: Sign-in component
6. **components/sign-out-button.tsx**: Sign-out component
7. **lib/utils.ts**: Utility functions (cn helper for className merging)
8. **lib/posthog.ts**: PostHog initialization
9. **types/next-auth.d.ts**: TypeScript types for NextAuth session

### Styling

- Set up Tailwind CSS with CSS variables in `app/globals.css`
- Include shadcn/ui base styles
- Configure proper color scheme with CSS variables

### Additional Requirements

1. Set up proper TypeScript types for NextAuth session
2. Create a basic seed file for Prisma
3. Add proper error boundaries
4. Include .gitignore for Node.js/Next.js projects
5. Set up ESLint configuration
6. Create a basic README.md with setup instructions

### Important Notes

- Use JWT sessions (not database sessions) for NextAuth
- Handle environment variable trimming to avoid whitespace issues
- Include proper error handling and logging
- Set up timeout handling for database operations
- Use standalone output mode for deployment
- Configure proper path aliases (@/*)

Please create all these files with proper implementations, following Next.js 14 App Router conventions and best practices.

