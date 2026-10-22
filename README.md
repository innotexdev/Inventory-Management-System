# Inventory — Monorepo

Single repository for the Inventory Management mentee project.

```
repo/
  backend/    Express + Prisma REST API (port 5000)
  frontend/   Next.js App Router + TypeScript strict (port 3000)
```

Each milestone is one pull request against this repo, in order:
1. Foundations (this commit) — repo setup, lint/format, schema, migrations, seed, README
2. Authentication — register/login/logout, session cookie, route guards, 403/404
3. Profile + My inventory
4. Inventory list/detail, create/edit, repair/retire
5. Assign/unassign, users list/detail, history
6. Teams, admin actions, dashboard, hardening

## Prerequisites

- Node.js 20+
- Docker Desktop (for PostgreSQL)

## Quick start 

```bash
# backend
cd backend
cp .env.example .env   # Windows: copy .env.example .env
npm install
docker compose up -d
npm run db:migrate
npm run db:seed
npm run dev            # http://localhost:5000/api/health

# frontend (second terminal)
cd ../frontend
npm install
npm run dev            # http://localhost:3000
```