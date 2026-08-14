# Full Stack Svelte Template

A full-stack template with:

- **Frontend**: SvelteKit (adapter-node) + Tailwind CSS
- **Backend**: Express 5 + Drizzle ORM + Better Auth (email/password)
- **Database**: PostgreSQL
- **Type safety**: OpenAPI spec generated from Zod schemas → typed frontend API client
- **Deployment**: Docker Compose + Caddy (auto-TLS), works on Hetzner or any Docker host

## Architecture

```
Browser ──> Caddy (:80/:443) ──> frontend (:3000, SvelteKit)
                     └─────────> backend  (:3001, Express + Drizzle + Better Auth)
                                          └──> postgres (:5432)
```

Frontend and backend are same-origin through the reverse proxy, so Better Auth session
cookies just work in dev (Vite proxy) and production (Caddy).

## Type-safe API

Zod schemas in the backend are the single source of truth:

```
backend/src/routes/*.ts (zod schemas + registerPath)
        │  npm run generate:openapi        (backend)
        ▼
backend/openapi.json ──► npm run generate:types  (frontend) ──► src/lib/api/schema.d.ts
                                                                        │
                                  src/lib/api/client.ts (openapi-fetch) ◄┘
```

Both generated artifacts (`backend/openapi.json`, `frontend/src/lib/api/schema.d.ts`)
are committed, so either half builds without the other running.

### Adding an endpoint

1. Add a zod schema and `registry.registerPath(...)` in `backend/src/routes/<name>.ts`,
   plus the Express route. Validate requests with the `validate` middleware and protect
   them with `requireAuth`.
2. `cd backend && npm run generate:openapi`
3. `cd frontend && npm run generate:types`
4. Call it type-safely: `api.GET('/api/...')` from `src/lib/api/client.ts`.

Better Auth endpoints (`/api/auth/*`) are not part of the OpenAPI spec; they have
their own typed client (`src/lib/auth-client.ts`).

Swagger UI is served at `/api/docs` and the raw spec at `/api/openapi.json`.

## Getting started

### Prerequisites

- Node.js 20+
- Docker + Docker Compose (for the database and full stack)

### Try it

Once running, the demo shows:

- `/` — pings the backend health check
- `/signup`, `/signin` — Better Auth email/password
- `/items` — protected page (sign-in required) listing the signed-in user's items and
  letting them add more; demonstrates the type-safe OpenAPI client for an authed resource
- `/api/docs` — Swagger UI for the generated spec

### 1. Environment

```bash
cp .env.example .env    # root .env drives docker compose
cp backend/.env.example backend/.env   # local backend dev
```

Generate a secret: `openssl rand -base64 32`

### 2. Full stack with Docker

```bash
docker compose up --build
```

- Frontend: http://localhost
- API: http://localhost/api

For production, set `DOMAIN` and `BETTER_AUTH_URL` in `.env` — Caddy handles TLS.

### 3. Local development

```bash
# Terminal 1: database only
docker compose up db

# Terminal 2: backend (http://localhost:3001)
cd backend
npm install
npm run db:migrate
npm run dev

# Terminal 3: frontend (http://localhost:5173, /api proxied to :3001)
cd frontend
npm install
npm run dev
```

## Testing

Both test suites need the Postgres database running (`docker compose up db`).

### Backend — Vitest + Supertest

Integration tests hit the Express app through Supertest against a dedicated
`app_test` database. The vitest global setup creates the database if missing,
applies migrations, and every test starts from an empty database.

```bash
cd backend
npm test            # one run
npm run test:watch  # watch mode
```

The tests exercise the full HTTP stack including Better Auth: signup, sign-in,
session cookies, the origin/CSRF check (an untrusted `Origin` is rejected), and
protected routes (`/api/me`, `/api/items`). Note that `advanced.disableOriginCheck`
is set to `false` in `backend/src/auth.ts` so the origin check stays active even
under `NODE_ENV=test` — Better Auth otherwise disables it automatically.

### Frontend — Playwright

End-to-end tests run a production build (`vite preview`) against a test backend on
`:3001` backed by `app_test`. Both are started automatically by Playwright's
`webServer` config; a global setup wipes the database before the suite.

```bash
cd frontend
npx playwright install chromium   # once, locally
npm run test:e2e                  # headless
npm run test:e2e:ui               # interactive UI
npm run test:e2e:headed           # headed browser
```

Tests cover the health check, the sign-up / sign-out / sign-in flow, and the
protected items page.

### CI

`.github/workflows/ci.yml` runs both suites on every pull request:
backend tests against a Postgres service, and Playwright with
`npx playwright install --with-deps chromium`. The Playwright report is uploaded
as an artifact on failure.

| Script                  | Description                              |
| ----------------------- | ---------------------------------------- |
| `npm run dev`           | Run with hot reload (tsx watch)          |
| `npm run build`         | Compile to `dist/` (excludes tests)      |
| `npm start`             | Run compiled output                      |
| `npm run typecheck`     | Type-check source + tests                |
| `npm test`              | Vitest + Supertest integration tests     |
| `npm run test:watch`    | Vitest watch mode                        |
| `npm run serve:test`    | Boot the API for Playwright e2e          |
| `npm run generate:openapi` | Regenerate `openapi.json`            |
| `npm run db:generate`   | Generate a Drizzle migration             |
| `npm run db:migrate`    | Apply migrations                         |
| `npm run db:push`       | Push schema directly (dev only)          |

Better Auth tables are generated with `npx auth@latest generate --output src/db/schema.ts`.

## Deploying to Hetzner

1. Create a Docker droplet / server.
2. Point a DNS `A` record at its IP.
3. On the server:

```bash
git clone <your-repo> app
cd app
cp .env.example .env   # set DOMAIN, BETTER_AUTH_SECRET, BETTER_AUTH_URL
docker compose up -d --build
```

Caddy terminates TLS automatically for `DOMAIN`.

## Layout

```
backend/
  src/
    index.ts            # boot: run migrations, listen
    app.ts              # express setup, CORS, Better Auth mount, Swagger UI
    auth.ts             # Better Auth config (drizzle adapter)
    db/                 # drizzle pool + schema (Better Auth tables, items)
    middleware/validate.ts
    middleware/require-auth.ts
    openapi/            # registry + spec generator
    routes/             # health, me, items (+ *.test.ts colocated tests)
  tests/                # vitest global setup/setup/helpers, e2e DB reset
  drizzle/              # committed migrations
  openapi.json          # generated
  vitest.config.ts
  tsconfig.build.json   # build config (excludes tests)
frontend/
  src/lib/api/          # generated schema.d.ts + typed client
  src/lib/auth-client.ts
  src/routes/           # health (/), signup, signin, items (protected)
  e2e/                  # Playwright specs + helpers
  playwright.config.ts
compose.yaml
Caddyfile
.env.example
.github/workflows/ci.yml
```
