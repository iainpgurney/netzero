# Seed Script Safety — User Progress Preserved

## Training Module Seeds (Safe — Never Delete)

These scripts **never delete** courses or modules. They preserve all user progress, badges, and certificates:

- `npm run db:seed-new-starter` — Upserts course and Module 1
- `npm run db:seed-product-walkthrough` — Creates Module 2 only if it doesn't exist
- `npm run db:seed-systems-training` — Creates Module 3 only if it doesn't exist
- `npm run db:seed-security-training` — Creates Module 4 only if it doesn't exist
- `npm run db:seed-carbon-trees-kelp` — Creates Carbon | Trees | Kelp only if it doesn't exist
- `npm run db:seed-social-impact-veterans` — Creates Social Impact module only if it doesn't exist

**Behaviour:** If a module already exists, the script skips it and logs "Skipping to preserve user progress."

## Main Seed (Full Reset — Use With Caution)

`npm run db:seed` runs `prisma/seed.ts` which **deletes all courses, modules, progress, badges, and certificates**. Use only for:

- Fresh database setup
- Development reset
- When you explicitly want to wipe learning data

**Never run `db:seed` on production** if you want to keep user progress.

## RAG Seed (Safe)

`prisma/seed-rag.ts` only seeds when no RAG history exists. It never overwrites existing RAG data.
