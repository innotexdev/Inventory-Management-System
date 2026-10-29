# Inventory Frontend

Next.js 16 + Tailwind CSS 4 + TypeScript.

- Milestone 1 = repository setup, landing page, tooling (ESLint, Prettier,
  TypeScript strict mode).
- Milestone 2 = authentication UI: login/register pages, dashboard pages and
  client-side session handling via the backend auth API.

## Auth features

- `/login` and `/register` pages with validated forms (React Hook Form + Zod).
- `/dashboard` requires a MANAGER or ADMIN role; `/my-inventory` requires an
  authenticated user.
- Session user state is resolved via the backend `GET /api/auth/me` endpoint.

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
