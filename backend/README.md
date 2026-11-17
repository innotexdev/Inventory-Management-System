# Inventory Backend

Express + Prisma (PostgreSQL) REST API.

- Milestone 1 = repository setup, folder structure, database schema,
  migrations, seed script, README.
- Milestone 2 = authentication flow: register, login, logout and me with
  JWT-backed httpOnly cookie sessions, Zod input validation and RBAC.
- Milestone 3 = profile and My inventory: edit own name, change own password,
  list own current items and own assignment history.
- Milestone 4 = inventory for Manager and Admin: category list, item list with
  search/filters/sort/pagination, create and edit item, item detail with
  current holder and history, repair/back-from-repair/retire status changes,
  and dashboard totals.
- Milestone 5 = assignments: assign and unassign items, users list/detail with
  current items and history, a read-only teams list for filtering, and API
  integration tests for every row of the assign/unassign rules table.

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
User API: `http://localhost:5000/api/users` (own profile, all users, detail, items, assignments)
Inventory API: `http://localhost:5000/api/items`, `/api/categories`, `/api/stats/inventory`
Teams API: `http://localhost:5000/api/teams` (read-only list for filters)
Swagger: `http://localhost:5000/api-docs`

## Authentication

Auth endpoints live under `/api/auth`:

| Method | Route                | Auth   | Description                                    |
| ------ | -------------------- | ------ | ---------------------------------------------- |
| POST   | `/api/auth/register` | Public | Create account (Zod-validated, Argon2 hashing) |
| POST   | `/api/auth/login`    | Public | Verify credentials, set session cookie         |
| POST   | `/api/auth/logout`   | User   | Clear the session cookie                       |
| GET    | `/api/auth/me`       | User   | Return current user and role                   |

- Sessions use a stateless JWT stored in an httpOnly cookie, with a seven-day
  expiration.
- CORS allows the configured frontend origin via `CLIENT_URL`.
- Protected routes use the `requireAuth` middleware to verify the user's
  authentication.

## Profile and My inventory

Endpoints for the signed-in user live under `/api/users/me`. They are available
to every role (Employee, Manager, Admin) and always act on the caller's own
data: there is no user id in the path, so one user cannot read or change
another user's data through these routes.

| Method | Route                       | Auth | Description                                       |
| ------ | --------------------------- | ---- | ------------------------------------------------- |
| PATCH  | `/api/users/me`             | User | Update own first and last name                    |
| PATCH  | `/api/users/me/password`    | User | Change own password (current + new password)      |
| GET    | `/api/users/me/items`       | User | Items currently assigned to the caller            |
| GET    | `/api/users/me/assignments` | User | The caller's assignment history (active and past) |

Rules:

- **Edit profile:** only `firstName` and `lastName` can be changed. Both are
  trimmed and validated server-side (2 to 50 characters; letters, spaces,
  hyphens and apostrophes). Email, role and team are read-only here, and any
  other field in the request body is ignored or rejected, never saved.
- **Change password:** requires the old password, which must be correct.
  The new password must be 8 to 64 characters with at least one lowercase
  letter, one uppercase letter and one digit, must match the confirmation, and
  must differ from the current password. The new password is hashed with
  Argon2.
- **My items:** returns the items whose active assignment (`returnedAt` is
  null) belongs to the caller. Each row includes asset tag, name, category,
  serial number and the date it was assigned.
- **My assignment history:** returns every assignment for the caller, with
  assigned and returned dates. Past assignments stay visible even after the
  item is retired.
- **Managers and Admins** also hold equipment, and their own items appear in
  these endpoints like anyone else's.
- Responses never include `passwordHash` or any other internal field.

## Inventory (Milestone 4)

All inventory endpoints require a signed-in **Manager or Admin**. An Employee
gets `403`, and a request without a session gets `401`. Retiring an item is
**Admin-only**; a Manager attempting it gets `403`. The role is read from the
database on every request, so a demotion or deactivation takes effect on the
next call.

| Method | Route                        | Auth           | Description                                      |
| ------ | ---------------------------- | -------------- | ------------------------------------------------ |
| GET    | `/api/categories`            | Manager, Admin | Read-only categories from the seed               |
| GET    | `/api/items`                 | Manager, Admin | Paginated item list with filters and sorting     |
| POST   | `/api/items`                 | Manager, Admin | Create item (server-generated asset tag)         |
| GET    | `/api/items/:id`             | Manager, Admin | Item detail with current holder                  |
| PATCH  | `/api/items/:id`             | Manager, Admin | Edit item fields                                 |
| POST   | `/api/items/:id/status`      | Manager, Admin | Repair, back from repair, retire (retire: Admin) |
| GET    | `/api/items/:id/assignments` | Manager, Admin | Full assignment history, newest first            |
| GET    | `/api/stats/inventory`       | Manager, Admin | Dashboard totals per status and category         |

### Item list query

`GET /api/items` accepts `search`, `status`, `categoryId`, `teamId`,
`holderId`, `sort`, `order`, `page` and `pageSize`.

- `search` matches name, asset tag and serial number, case-insensitively.
- `teamId` and `holderId` filter by the team/user of the **current holder**
  (the user on the active assignment), because items do not belong to teams
  directly.
- `sort` is `name`, `assetTag` or `createdAt`; `order` is `asc` or `desc`.
  Defaults: `name` ascending.
- `page` defaults to `1` and `pageSize` to `20`; `pageSize` is capped at `100`.
  Invalid values fall back to the defaults. A page past the last one returns
  an empty `data` array with correct `meta`, not an error.
- Retired items are hidden unless the status filter explicitly asks for them.

### Item status

The database enum holds `AVAILABLE`, `IN_REPAIR` and `RETIRED`. The API also
reports `ASSIGNED`, derived from the presence of an active assignment
(`returnedAt` is null). An item is never stored with a second copy of its
holder or assigned status. The seeded data therefore reports:

| Status    | Count |
| --------- | ----- |
| AVAILABLE | 11    |
| ASSIGNED  | 24    |
| IN_REPAIR | 3     |
| RETIRED   | 2     |

`GET /api/items?status=AVAILABLE` is the "Unassigned" view: it returns only
items with no active assignment. `status=ASSIGNED` returns items with an
active assignment. Retired items appear only with `status=RETIRED`.

### Status transitions

`POST /api/items/:id/status` takes `{ "status": "<target>" }`. Allowed targets
are `AVAILABLE`, `IN_REPAIR` and `RETIRED`. Assigning is a separate endpoint
(`POST /api/items/:id/assign`) because the status is derived from the presence
of an active assignment and is never set directly.

| From      | To        | Who            |
| --------- | --------- | -------------- |
| AVAILABLE | IN_REPAIR | Manager, Admin |
| IN_REPAIR | AVAILABLE | Manager, Admin |
| AVAILABLE | RETIRED   | Admin          |
| IN_REPAIR | RETIRED   | Admin          |

Every other transition returns `409`, including any transition from an
`ASSIGNED` item (it must be unassigned first) and any transition from
`RETIRED`, which is final. `PATCH /api/items/:id` cannot change status or
asset tag; those fields are ignored in the request body.

### Create and edit validation

- Name: required, 2 to 100 characters.
- Category: required, must exist (a missing category is a `400` with
  `fields.categoryId`).
- Brand and model: optional, at most 50 characters each.
- Serial number: optional, 3 to 64 characters (letters, digits and hyphens),
  unique case-insensitively. A duplicate returns `409` with
  `fields.serialNumber`.
- Purchase date: optional, valid date, not in the future.
- Notes: optional, at most 500 characters.
- Text is trimmed; whitespace-only optional values become `null`. Unknown
  fields are ignored, never saved, and ids in the URL must be UUIDs (a
  malformed id returns `400`).

### Response shapes

Errors always use `{ "error": { "code", "message", "fields"? } }`; `fields`
appears only for validation errors and field-level conflicts. Lists use
`{ "data": [], "meta": { "page", "pageSize", "total", "totalPages" } }`.
Single resources are wrapped in `{ "data": ... }`. Status codes follow the
project scope: `200`/`201`/`204` success, `400` validation or malformed input,
`401` no session, `403` wrong role, `404` missing resource, `409` conflict,
`500` unexpected error (without a stack trace or SQL in the response).

### Where the code lives

The milestone follows the existing layering rather than introducing a new
structure:

- `src/validation/inventory.validation.ts` — shared Zod schemas for bodies and
  the list query.
- `src/lib/item-status.ts` and `src/lib/inventory-errors.ts` — derived status,
  transition rules and conflict errors.
- `src/middleware/validate-uuid-param.ts` — UUID path validation.
- `src/services/inventory.service.ts` — Prisma queries, mapping and rules.
- `src/controllers/inventory.controller.ts` and `src/routes/inventory.ts` —
  handlers and the three routers mounted in `src/app.ts`.
- `src/docs/inventory.docs.ts` — Swagger fragment registered in
  `src/lib/swagger.ts`.
- `src/types/inventory.ts` — shared response types.
- `src/tests/inventory/` — validation, status-rule and route tests.
- `src/validation/assignment.validation.ts` and `src/validation/user.validation.ts`
  — assign/unassign bodies, note rules and the users list query.
- `src/services/user.service.ts` and `src/services/team.service.ts` — user
  list/detail queries and the read-only teams list.
- `src/services/inventory.service.ts` — `assignItem` and `unassignItem`
  transactions alongside the existing item operations.
- `src/routes/user.ts`, `src/routes/team.ts` and `src/docs/*.docs.ts` — the new
  Manager-gated routes and their OpenAPI fragments.
- `src/tests/assignment/` and `src/tests/users/user.list.test.ts` — assignment
  rules and users list integration tests.

## Assignments and users (Milestone 5)

All endpoints in this section require a signed-in **Manager or Admin**; an
Employee gets `403` and a request without a session gets `401`.

| Method | Route                        | Auth           | Description                                    |
| ------ | ---------------------------- | -------------- | ---------------------------------------------- |
| GET    | `/api/users`                 | Manager, Admin | List users with search, filters and pagination |
| GET    | `/api/users/:id`             | Manager, Admin | User detail with team and held item count      |
| GET    | `/api/users/:id/items`       | Manager, Admin | Items currently held by that user              |
| GET    | `/api/users/:id/assignments` | Manager, Admin | That user's full assignment history            |
| GET    | `/api/teams`                 | Manager, Admin | Read-only team list used by the users filter   |
| POST   | `/api/items/:id/assign`      | Manager, Admin | Assign an available item to an active user     |
| POST   | `/api/items/:id/unassign`    | Manager, Admin | Return an assigned item                        |

### Assign and unassign rules

`POST /api/items/:id/assign` takes `{ "userId": "<uuid>", "note"?: "<text>" }`.
`POST /api/items/:id/unassign` takes `{ "note"?: "<text>" }`; an empty body is
fine. Both return the updated item with its current holder and create or close
the assignment row in one transaction.

| Situation                                 | Result                      |
| ----------------------------------------- | --------------------------- |
| Item is not Available                     | 409 "Item is not available" |
| Target user is deactivated                | 409 "User is not active"    |
| Target user or item does not exist        | 404                         |
| Item has no active assignment on unassign | 409 "Item is not assigned"  |
| Two requests assign the same item at once | one `200`, one `409`        |
| The same request is sent twice            | one assignment              |
| Caller is an Employee                     | 403                         |

A Manager may assign an item to themselves. The optional note is at most 250
characters and is trimmed; a return note replaces the stored note only when one
is provided. Every assignment stays in history with assigned and returned
dates, who performed each action, and the note. Malformed ids return `400`.

### Users list

`GET /api/users` accepts `search`, `teamId`, `role`, `isActive`, `page` and
`pageSize`. Search matches first name, last name and email case-insensitively.
`isActive` accepts `true`/`false` strings; invalid values fall back to the
defaults. Each row includes `heldItemsCount`, the number of items the user
currently holds. `passwordHash` is never returned.

### Tests

`src/tests/assignment/` covers both validation schemas and every row of the
assign/unassign rules table through the HTTP API. The concurrency and
double-click tests create their own items and users and clean them up, proving
that the database constraint produces exactly one active assignment.
`src/tests/users/user.list.test.ts` covers the users list and detail endpoints
and their role enforcement.

## Key decisions

- **Backend:** Express 5 with Prisma 7 and the `@prisma/adapter-pg` adapter,
  exposing REST JSON under `/api`. Zod schemas are defined once and reused for
  request validation and Swagger generation. Code is organised by layer
  (`validation`, `middleware`, `services`, `controllers`, `routes`, `docs`,
  `tests`) with shared response types in `src/types`.
- **Auth:** a stateless JWT is stored in an `httpOnly`, `SameSite=Lax` cookie
  (Secure in production) with a seven-day lifetime. Passwords are hashed with
  Argon2 and hashes never leave the server. `requireAuth` re-reads the user
  from the database on every request, so a changed role, team or active flag
  takes effect immediately; `authorize(minRole)` reuses one rank-based helper
  for all role checks.
- **One active assignment:** guaranteed by the database, not only by
  application code. Migration `0001_items_and_assignments` adds the partial
  unique index `assignments_one_active_per_item` on `itemId` where
  `returnedAt IS NULL`. Item status is derived from that active assignment
  instead of storing a second copy on the item. `assignItem` checks availability
  and inserts the assignment in one transaction; a racing insert fails on the
  unique index and is translated to `409 "Item is not available"`. `unassignItem`
  closes the row with a conditional `updateMany` on `returnedAt IS NULL`, so a
  second concurrent return gets `409 "Item is not assigned"`.

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
| `npm run test`         | Tests (`tsx --test --test-reporter=spec "src/tests/**/*.test.ts"`)  |

`npm run build` compiles with `tsconfig.build.json`, which pins `rootDir` to `src`
so the entry point is emitted at `dist/index.js` (matching `npm start`).
`tsconfig.json` additionally type-checks `prisma/seed.ts` and `prisma.config.ts`,
which live outside `src` and are run directly via `tsx`.

## Environment

See `.env.example`. Variables: `PORT`, `DATABASE_URL`, `LOG_LEVEL`
(`debug|info|warn|error|silent`), `JWT_SECRET`, `BASE_URL`, and `CLIENT_URL`
(the CORS origin for the frontend). The backend listens on port `5000` and the
frontend reaches it through `NEXT_PUBLIC_API_URL` in `frontend/.env.local`.

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
