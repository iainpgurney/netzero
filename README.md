# NetZero

A production-ready Next.js application with TypeScript, Prisma, NextAuth, and tRPC.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (DigitalOcean PostgreSQL recommended)
- Environment variables configured (see `.env.example`)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
- `DATABASE_URL`: Your PostgreSQL connection string (DigitalOcean PostgreSQL)
- `NEXTAUTH_SECRET`: Generate a secret key (e.g., `openssl rand -base64 32`)
- `NEXTAUTH_URL`: Your application URL (e.g., `http://localhost:3000`)
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: For Google OAuth (optional)
- `ALLOWED_GOOGLE_DOMAINS`: Comma-separated list of allowed domains (e.g., `carma.earth`)

3. Set up the database:
```bash
npm run db:push
npm run db:seed
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Protected routes
│   │   └── learning/      # Learning Hub pages
│   │       ├── modules/   # Module pages with quizzes
│   │       └── certificate/ # Certificate generation
│   └── (auth)/           # Auth-related pages
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── lib/                  # Utility functions
├── server/               # Server-side code
│   ├── auth.ts          # NextAuth configuration
│   ├── db/              # Prisma client
│   └── trpc/            # tRPC setup
│       └── routers/      # tRPC routers
│           ├── learning.ts # Learning Hub API
│           └── user.ts   # User API
├── prisma/               # Database schema
│   └── seed.ts          # Seed data with 7 modules
└── types/                # TypeScript type definitions
```

## 📚 Net Zero Learning Hub

The Learning Hub is an interactive educational platform based on BSI's Little Book of Net Zero (2023). It features:

### 7 Learning Modules:
1. **Net Zero Fundamentals** (8 min) - Understanding net zero, climate change, and SME's role
2. **The UK's Net Zero Journey** (6 min) - UK's legal commitment and strategy
3. **Energy Efficiency Wins** (10 min) - Practical energy reduction strategies
4. **Managing Your Transition** (12 min) - Rounded approach, innovation, and collaboration
5. **Standards & Certification** (10 min) - ISO standards and certification benefits
6. **Case Study - Real Impact** (8 min) - Avara Foods success story
7. **Your Action Plan** (15 min) - Creating personalized net zero roadmap

### Features:
- ✅ Interactive module content with progress tracking
- ✅ Quiz system with instant feedback (5 questions per module)
- ✅ Badge system (earn badges for 70%+ quiz scores)
- ✅ Progress dashboard with completion percentage
- ✅ Certificate generation upon completion
- ✅ Time tracking and knowledge points
- ✅ Module locking (must complete previous module)
- ✅ Downloadable certificates

### Access:
Navigate to `/dashboard/learning` after signing in to access the Learning Hub.

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed the database

## 🔐 Authentication

The app uses NextAuth v4 with Credentials provider and a demo account.

**Demo Account Credentials:**
- Email: `demo@netzero.com`
- Password: `demo123`

The demo user is automatically created when you run `npm run db:seed` or `npm run create-demo-user`.

**Troubleshooting Login Issues:**

If you cannot login, make sure:
1. You have `DATABASE_URL` set in your `.env.local` file
2. Run `npm run db:push` to create the database schema
3. Run `npm run create-demo-user` to create the demo user
4. Or run `npm run db:seed` to create the demo user and all learning modules
5. Check the browser console and server logs for error messages

## 🔌 API

- Health check: `/api/health`
- NextAuth: `/api/auth/[...nextauth]`
- tRPC: `/api/trpc/[trpc]`

## 📝 Tech Stack

- **Framework**: Next.js 14.1.0 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL (DigitalOcean) + Prisma
- **Authentication**: NextAuth v4 (Credentials Provider + Google OAuth)
- **API**: tRPC + React Query
- **Validation**: Zod
- **Deployment**: DigitalOcean App Platform

## 🎯 Features

- ✅ Type-safe APIs with tRPC
- ✅ Authentication with NextAuth
- ✅ Protected routes
- ✅ Database with Prisma
- ✅ Modern UI with Tailwind CSS
- ✅ Production-ready error handling
- ✅ Health check endpoint
- ✅ **Net Zero Learning Hub** - Interactive educational platform with 7 modules, quizzes, badges, and certificates

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth Documentation](https://next-auth.js.org)
- [tRPC Documentation](https://trpc.io)
- [shadcn/ui Documentation](https://ui.shadcn.com)

