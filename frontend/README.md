# Inventory Frontend

Next.js 16 + Tailwind CSS 4 + TypeScript.

- Milestone 1 = repository setup, landing page, tooling (ESLint, Prettier,
  TypeScript strict mode).
- Milestone 2 = authentication UI: login/register pages, dashboard pages and
  client-side session handling via the backend auth API.
- Milestone 3 = profile and my inventory: a `/profile` page to view account
  details, edit your name and change your password, and a `/my-inventory`
  page listing your currently assigned items and your assignment history.
- Milestone 4 = inventory. The backend API for items, categories, status
  changes and dashboard totals is implemented; the `/inventory`,
  `/inventory/new`, `/inventory/[id]` and dashboard screens are the remaining
  work in this milestone.

## Auth features

- `/login` and `/register` pages with validated forms (React Hook Form + Zod).
- `/dashboard` requires a MANAGER or ADMIN role; `/my-inventory` requires an
  authenticated user.
- Session user state is resolved via the backend `GET /api/auth/me` endpoint.

## Profile and my inventory Features

- `/profile` (all roles) shows your email, role, team (`No team` when you are
  in none) and the date your account was created, all read-only.
- The profile page lets you edit your first and last name
  (`PATCH /api/users/me`) and change your password by entering the current
  password and a new one (`PATCH /api/users/me/password`). Both forms validate
  client-side with Zod and are re-validated by the backend; server field
  errors are mapped back onto the matching fields.
- The wrong current password is reported as a field error on the current
  password input, as required by the scope.
- After a successful name update the page re-renders with fresh data
  (`revalidatePath`), and success is confirmed inline with a visible message.
- Signed-in navigation shows a `Profile` link for every role, alongside
  role-gated links such as `Dashboard` (MANAGER and above).
- `/my-inventory` lists the items currently assigned to you (asset tag,
  name, category, serial number, assigned date) and, in a second section,
  your past assignments with assigned and returned dates, who assigned you
  the item, who returned it and the note on the return.
- Both tables have explicit empty states, `overflow-x-auto` scrolling on
  small screens, `scope="col"` headers and accessible table labels.
- The assigned date on the current items table is joined client-side from
  `GET /api/users/me/assignments` (matched on `item.id` for the open
  assignment), because `GET /api/users/me/items` does not include the
  assignment timestamp.

## Inventory API (Milestone 4 backend)

The backend now exposes the inventory endpoints for Manager and Admin. The
frontend will consume them from the inventory screens:

| Method | Route                        | Purpose                                        |
| ------ | ---------------------------- | ---------------------------------------------- |
| GET    | `/api/categories`            | Category picker for create/edit                |
| GET    | `/api/items`                 | List with search, filters, sort and pagination |
| POST   | `/api/items`                 | Create item                                    |
| GET    | `/api/items/:id`             | Item detail and current holder                 |
| PATCH  | `/api/items/:id`             | Edit item fields                               |
| POST   | `/api/items/:id/status`      | Repair, back from repair, retire               |
| GET    | `/api/items/:id/assignments` | Item history                                   |
| GET    | `/api/stats/inventory`       | Dashboard totals                               |

Search, filters, sort and page are kept in the URL so refresh and shared links
reproduce the same result. Lists return `{ data, meta }` with
`page`, `pageSize`, `total` and `totalPages`. The API reports `ASSIGNED` as a
derived status whenever an item has an active assignment, which matches the
`ItemStatus` type already defined in `lib/api.ts`.

## Prerequisites

- Node.js 20.19+, 22.12+, or 24+ (see `engines` in `package.json`)
- The backend API running (see `backend/README.md`)

## Setup

```bash
cp .env.local.example .env.local   # Windows: copy .env.local.example .env.local
npm install
npm run dev
```

App: `http://localhost:3000`

## Scripts

| Command                | What it does                                                   |
| ---------------------- | -------------------------------------------------------------- |
| `npm run dev`          | Start with hot reload (Turbopack)                              |
| `npm run build`        | Production build                                               |
| `npm start`            | Serve the production build                                     |
| `npm run typecheck`    | `tsc --noEmit`                                                 |
| `npm run lint`         | ESLint (zero warnings)                                         |
| `npm run format`       | Prettier check                                                 |
| `npm run format:write` | Prettier auto-fix                                              |
| `npm run test`         | Unit tests (`node --import tsx/esm --test tests/**/*.test.ts`) |

## Environment

See `.env.local.example`. Variables: `NEXT_PUBLIC_API_URL` (the backend
base URL, e.g. `http://localhost:5000`).
