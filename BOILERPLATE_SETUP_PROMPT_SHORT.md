# Quick Boilerplate Setup Prompt

Copy this shorter version to quickly set up the boilerplate:

---

Create a Next.js 14.1.0 App Router project with TypeScript, using this tech stack:

**Stack:**
- Next.js 14.1.0 (App Router) + TypeScript
- PostgreSQL + Prisma ORM v5.9.0
- NextAuth.js v4.24.7 (Google OAuth + Credentials, JWT sessions)
- tRPC v10.45.0 + React Query v4.36.1
- Tailwind CSS v3.4.1 + shadcn/ui
- PostHog analytics
- SuperJSON, Zod, bcryptjs

**Required Structure:**
```
app/ (App Router)
├── api/auth/[...nextauth]/route.ts
├── api/trpc/[trpc]/route.ts
├── dashboard/ (protected routes)
├── layout.tsx, page.tsx, providers.tsx
server/
├── auth.ts (NextAuth config)
├── db/prisma.ts
├── trpc/ (context, trpc, routers)
components/ (UI components + shadcn/ui)
lib/ (utils, trpc client, posthog)
prisma/ (schema.prisma, seed.ts)
```

**Key Config:**
- TypeScript with path aliases (@/*)
- Tailwind with CSS variables + shadcn/ui
- Prisma with PostgreSQL
- NextAuth with domain allowlist
- tRPC with superjson transformer
- Standalone output mode

**Env Vars Needed:**
- DATABASE_URL
- NEXTAUTH_URL, NEXTAUTH_SECRET
- GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
- ALLOWED_GOOGLE_DOMAINS
- NEXT_PUBLIC_POSTHOG_KEY (optional)

**Features:**
- Google OAuth with domain allowlist
- Email/password auth with bcrypt
- Protected dashboard routes
- tRPC API layer
- PostHog analytics integration
- Error boundaries and proper error handling

Create all files with proper implementations following Next.js 14 best practices.

