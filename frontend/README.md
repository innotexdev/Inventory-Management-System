# Inventory Frontend

Next.js 16 + Tailwind CSS 4 + TypeScript. No auth, no business logic yet.
Milestone 1 = repository setup, landing page, tooling (ESLint, Prettier,
TypeScript strict mode).

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

| Command                | What it does                      |
| ---------------------- | --------------------------------- |
| `npm run dev`          | Start with hot reload (Turbopack) |
| `npm run build`        | Production build                  |
| `npm start`            | Serve the production build        |
| `npm run typecheck`    | `tsc --noEmit`                    |
| `npm run lint`         | ESLint (zero warnings)            |
| `npm run format`       | Prettier check                    |
| `npm run format:write` | Prettier auto-fix                 |

## Environment

See `.env.local.example`. Variables: `NEXT_PUBLIC_API_URL` (the backend
base URL, e.g. `http://localhost:5000`).
