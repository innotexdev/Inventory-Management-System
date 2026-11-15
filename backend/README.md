# Inventory Backend

Express + Prisma (PostgreSQL) REST API.

- Milestone 1 = repository setup, folder structure, database schema,
  migrations, seed script, README.
- Milestone 2 = authentication flow: register, login, logout and me with
  JWT-backed httpOnly cookie sessions, Zod input validation and RBAC.

## Prerequisites

- Node.js 20.19+, 22.12+, or 24+ (the range Prisma 7 requires; see `engines` in `package.json`)
- Docker Desktop (for PostgreSQL), or a local PostgreSQL 15+

## Setup

```bash
cp .env.example .env   # Windows: copy .env.example .env


npm install

# Generate Prisma Client
npm run db:generate

# start the database
docker compose up -d --wait

# create the schema (applies prisma/migrations in order)
npm run db:migrate

# fill with seed data (idempotent: safe to run twice)
npm run db:seed
```

### Generate JWT Secret

Before starting the API, replace the `JWT_SECRET` placeholder in `backend/.env` with a securely generated secret.

Using OpenSSL:

```bash
openssl rand -hex 32
```

If OpenSSL is unavailable (for example, on Windows), use Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the generated value into `JWT_SECRET` in `backend/.env`.

```bash
# run the API
npm run dev
```

API: `http://localhost:5000` — health: `http://localhost:5000/api/health`
Auth API: `http://localhost:5000/api/auth` (register, login, logout, me)
Swagger: `http://localhost:5000/api-docs`

## Authentication

Auth endpoints live under `/api/auth`:

| Method | Route                | Auth   | Description                                    |
| ------ | -------------------- | ------ | ---------------------------------------------- |
| POST   | `/api/auth/register` | Public | Create account (Zod-validated, Argon2 hashing) |
| POST   | `/api/auth/login`    | Public | Verify credentials, set session cookie         |
| POST   | `/api/auth/logout`   | User   | clear the session cookie                       |
| GET    | `/api/auth/me`       | User   | Return current user and role                   |

- Sessions use a stateless JWT stored in an httpOnly cookie, with a seven-day
  expiration.
- CORS allows the configured frontend origin via `CLIENT_URL`.
- Protected routes use the `requireAuth` middleware to verify the user's
  authentication.

## Scripts

| Command                | What it does                                                        |
| ---------------------- | ------------------------------------------------------------------- |
| `npm run dev`          | Start with hot reload (`tsx watch`)                                 |
| `npm run clean`        | Remove the `dist` folder                                            |
| `npm run build`        | Clean, generate Prisma client, compile to `dist`                    |
| `npm start`            | Run the compiled server                                             |
| `npm run db:generate`  | Generate the Prisma Client                                          |
| `npm run db:migrate`   | Create and apply migrations in dev (`prisma migrate dev`)           |
| `npm run db:deploy`    | Apply existing migrations only (`prisma migrate deploy`)            |
| `npm run db:reset`     | Drop the database, re-apply all migrations (`prisma migrate reset`) |
| `npm run db:seed`      | Seed data (`tsx prisma/seed.ts`)                                    |
| `npm run db:studio`    | Open Prisma Studio                                                  |
| `npm run typecheck`    | `tsc --noEmit`                                                      |
| `npm run lint`         | ESLint (zero warnings)                                              |
| `npm run format`       | Prettier check (no changes written)                                 |
| `npm run format:write` | Prettier write (auto-format all files)                              |
| `npm run test`         | Unit tests (`node --import tsx/esm --test src/tests/**/*.test.ts`)  |

`npm run build` compiles with `tsconfig.build.json`, which pins `rootDir` to `src`
so the entry point is emitted at `dist/index.js` (matching `npm start`).
`tsconfig.json` additionally type-checks `prisma/seed.ts` and `prisma.config.ts`,
which live outside `src` and are run directly via `tsx`.

## Environment

See `.env.example`. Variables: `PORT`, `DATABASE_URL`, `LOG_LEVEL`
(`debug|info|warn|error|silent`), `JWT_SECRET`, `BASE_URL`, and `CLIENT_URL`
(the CORS origin for the frontend).

## Database rules

- Database constraints and relationships are defined in the Prisma schema and enforced through migrations.
- Apply schema changes through Prisma migrations rather than modifying the database manually.
- Asset tags: Generated asset tags use the INV- prefix and a numeric sequence padded to at least four digits. Tags are never truncated as the sequence grows.
- User emails: The redundant case-insensitive index users_email_ci_key is removed.
- Referential integrity and uniqueness must be enforced by database constraints where applicable.
- Seed data must remain idempotent so `npm run db:seed` can be run multiple times safely.

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
