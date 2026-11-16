# Inventory — Monorepo

Single repository for the Inventory Management mentee project.

```text
repo/
  backend/    Express + Prisma REST API (port 5000)
  frontend/   Next.js App Router + TypeScript strict (port 3000)
```

## Milestones

The project is built in six milestones, in order. Each milestone ends with a
pull request, a demo and a review before the next one starts.

- Milestone 1 — repository setup, database schema, migrations, seed script,
  tooling (ESLint, Prettier, TypeScript strict).
- Milestone 2 — authentication: register, log in, log out, session in an
  httpOnly cookie, route protection, role guard, 403 and 404 pages.
- Milestone 3 — profile and my inventory: `/profile` (view account details,
  edit name, change password) and `/my-inventory` (current assigned items
  with assigned dates, assignment history, empty states). Navigation shows
  role-appropriate links for every signed-in user.
- Milestone 4 — inventory: item list with search, filters, sort and pagination
  in the URL, create and edit item, item detail with current holder and full
  history, repair/back-from-repair/retire status changes, categories and
  dashboard totals. Restricted to Manager and Admin on the server; retire is
  Admin-only. The backend API and the frontend screens for the inventory list,
  create, edit, item detail and dashboard totals are implemented. Assign and
  unassign await their backend endpoints (Milestone 5).

Milestones 1–3 are implemented in both apps. Milestone 4 is implemented in the
backend and in the frontend for every API operation the backend exposes.

See `backend/README.md` for the API surface and `frontend/README.md` for the
pages built so far.

## Prerequisites

- Node.js 20.19+, 22.12+, or 24+ (the range Prisma 7 requires; see `engines` in each `package.json`)
- Docker Desktop (for PostgreSQL)

## Line Endings

The repository uses LF (`\n`) line endings for text files to maintain consistent formatting across operating systems. Prettier is configured with `endOfLine: "lf"`, so CRLF (`\r\n`) line endings may cause formatting checks to fail.

The `.gitattributes` file enforces LF line endings for text files. Binary files, such as images and fonts, are excluded from text conversion.

## Quick Start

### Backend

```bash
cd backend
cp .env.example .env  # Windows: copy .env.example .env
npm install
npm run db:generate
docker compose up -d --wait
npm run db:migrate
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

Do not commit your actual `.env` file or share your JWT secret.

### Start the Backend

```bash
npm run dev
```

API health: [http://localhost:5000/api/health](http://localhost:5000/api/health)
Swagger docs: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

### Frontend

Open a second terminal from the repository root:

```bash
cd frontend
cp .env.local.example .env.local  # Windows: copy .env.local.example .env.local
npm install
npm run dev
```

Frontend: [http://localhost:3000](http://localhost:3000)
