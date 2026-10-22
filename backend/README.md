# Inventory Backend

Express + Prisma (PostgreSQL) skeleton. No auth, no business logic yet.
Milestone 1 = repository setup, folder structure, database schema,
migrations, seed script, README.

## Prerequisites

- Node.js 20.19+, 22.12+, or 24+ (the range Prisma 7 requires; see `engines` in `package.json`)
- Docker Desktop (for PostgreSQL), or a local PostgreSQL 15+

## Setup

```bash
cp .env.example .env   # Windows: copy .env.example .env
npm install

# start the database
docker compose up -d --wait

# create the schema (applies prisma/migrations in order)
npm run db:migrate

# fill with seed data (idempotent: safe to run twice)
npm run db:seed

# run the API
npm run dev
```

API: `http://localhost:5000` — health: `http://localhost:5000/api/health`

## Scripts

| Command              | What it does                               |
| -------------------- | ------------------------------------------ |
| `npm run dev`        | Start with hot reload (`tsx watch`)        |
| `npm run clean`      | Remove the `dist` folder                   |
| `npm run build`      | Generate Prisma client + compile to `dist` |
| `npm start`          | Run the compiled server                    |
| `npm run db:migrate` | Apply migrations (`prisma migrate dev`)    |
| `npm run db:seed`    | Seed data (`tsx prisma/seed.ts`)           |
| `npm run db:studio`  | Open Prisma Studio                         |
| `npm run typecheck`  | `tsc --noEmit`                             |
| `npm run lint`       | ESLint (zero warnings)                     |
| `npm run format`     | Prettier check                             |

`npm run build` compiles with `tsconfig.build.json`, which pins `rootDir` to `src`
so the entry point is emitted at `dist/index.js` (matching `npm start`).
`tsconfig.json` additionally type-checks `prisma/seed.ts` and `prisma.config.ts`,
which live outside `src` and are run directly via `tsx`.

## Environment

See `.env.example`. Variables: `PORT`, `DATABASE_URL`, `LOG_LEVEL`
(`debug|info|warn|error|silent`), `LOG_FORMAT` (`pretty|json`).

## Seed accounts

Shared password for all seed accounts: **`Start1234`**

| Email                      | Role     | Team     | Notes                                   |
| -------------------------- | -------- | -------- | --------------------------------------- |
| `admin@company.com`        | ADMIN    | —        | First admin, no team                    |
| `mia.frontend@company.com` | MANAGER  | Frontend | Holds 2 items                           |
| `omar.backend@company.com` | MANAGER  | Backend  | Holds 2 items                           |
| `finn.fe@company.com`      | EMPLOYEE | Frontend | Holds 6 items                           |
| `sara.fe@company.com`      | EMPLOYEE | Frontend | Holds 4 items                           |
| `leo.fe@company.com`       | EMPLOYEE | Frontend | Holds 3 items                           |
| `nina.be@company.com`      | EMPLOYEE | Backend  | Holds 3 items                           |
| `tom.be@company.com`       | EMPLOYEE | Backend  | Holds 2 items                           |
| `ivy.design@company.com`   | EMPLOYEE | Design   | Holds 2 items                           |
| `zoe.design@company.com`   | EMPLOYEE | Design   | Deactivated, holds nothing, has history |
| `max.noteam@company.com`   | EMPLOYEE | —        | Holds nothing (empty state)             |
