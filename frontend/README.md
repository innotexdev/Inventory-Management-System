# Inventory Frontend

Next.js 16 + Tailwind CSS 4 + TypeScript.

- Milestone 1 = repository setup, landing page, tooling (ESLint, Prettier,
  TypeScript strict mode).
- Milestone 2 = authentication UI: login/register pages, dashboard pages and
  client-side session handling via the backend auth API.
- Milestone 3 = profile and my inventory: a `/profile` page to view account
  details, edit your name and change your password, and a `/my-inventory`
  page listing your currently assigned items and your assignment history.
- Milestone 4 = inventory. Every inventory screen exposed by the backend API is
  built: `/inventory` (list), `/inventory/new` (create), `/inventory/[id]`
  (detail, history and status changes), `/inventory/[id]/edit` and `/dashboard`
  (totals). Assign and unassign need endpoints that are not in the API yet.

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

## Inventory list (Milestone 4 frontend)

- `/inventory` is restricted to Manager and Admin by `requireRole` on the
  server; an Employee receives the 403 page and direct API calls are rejected.
- The list is paginated on the server (20 rows per page by default). Search,
  status, category, sort field, sort order and page live in the URL; the
  reusable `DataTable` renders the page it is given and reports the server
  `meta` to screen readers.
- "Unassigned" is a one-click view of Available items. Retired items are hidden
  unless the Status filter requests them.
- `teamId` and `holderId` filters are accepted from the URL for shared links;
  pickers for them arrive with the users and teams screens.
- The table uses `scope="col"`, `aria-sort`, labelled controls, keyboard
  navigation, visible focus and a live results count. A loading skeleton,
  empty state and the shared error boundary with retry cover the async states.

## Inventory create, edit, detail and dashboard

- `/inventory/new` and `/inventory/[id]/edit` share one React Hook Form form
  and `itemSchema`. The same schema is re-run in a Server Action before the
  request, so client and server validation cannot drift. Duplicate serial
  numbers come back as a field error from the API.
- `/inventory/[id]` shows every item field, the current holder and the full
  assignment history (newest first, searchable and paginated in the table).
  Malformed or unknown ids show the 404 page.
- Status actions follow the backend rules exactly: Available → In repair,
  In repair → Available, and either → Retired for Admin only. Hidden actions
  are still rejected by the API. Retire asks for confirmation in a native
  dialog that traps focus and restores it on close. A conflict is shown inline
  and refreshes the item.
- `/dashboard` (Manager and Admin) renders totals per status and a per-category
  breakdown from `GET /api/stats/inventory`. Every number links to the filtered
  inventory list.
- Assign and Unassign are intentionally absent: the backend has no
  `/api/items/:id/assign` or `/unassign` endpoint yet. The item history also
  cannot show the holder because `GET /api/items/:id/assignments` does not
  return the holder user.

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
