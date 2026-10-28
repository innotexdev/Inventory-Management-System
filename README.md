# Inventory — Monorepo

Single repository for the Inventory Management mentee project.

```
repo/
  backend/    Express + Prisma REST API (port 5000)
  frontend/   Next.js App Router + TypeScript strict (port 3000)
```

## Prerequisites

- Node.js 20.19+, 22.12+, or 24+ (the range Prisma 7 requires; see `engines` in each `package.json`)
- Docker Desktop (for PostgreSQL)

### Line Endings

The repository uses LF (`\n`) line endings for text files to maintain
consistent formatting across operating systems. Prettier is configured
with `endOfLine: "lf"`, so CRLF (`\r\n`) line endings may cause
formatting checks to fail.

The `.gitattributes` file enforces LF line endings for text files.
Binary files, such as images and fonts, are excluded from text conversion.

## Quick start 

```bash
# backend
cd backend
cp .env.example .env   # Windows: copy .env.example .env
npm install
npm run db:generate
docker compose up -d --wait
npm run db:migrate
npm run db:seed
npm run dev            # http://localhost:5000/api/health

# frontend (second terminal)
cd ../frontend
cp .env.local.example .env.local   # Windows: copy .env.local.example .env.local 
npm install
npm run dev            # http://localhost:3000
```