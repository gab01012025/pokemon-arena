# Pokemon Arena

A competitive turn-based Pokemon battle game inspired by Naruto Arena / Pokemon TCG Pocket mechanics. Built with Next.js 16, featuring AI battles, real-time PvP multiplayer, clan system, missions, and a full ranking ladder.

## Architecture

```
├── src/
│   ├── app/                  # Next.js App Router pages & API routes
│   │   ├── api/              # 41 REST endpoints (apiHandler wrapper)
│   │   ├── battle/ai/        # AI battle system (9 extracted components)
│   │   ├── multiplayer/      # PvP battle system (14 extracted components)
│   │   ├── clan/, missions/  # Social & progression features
│   │   └── admin/            # Admin dashboard
│   ├── engine/               # Deterministic battle engine (pure functions)
│   ├── components/           # Shared UI components
│   ├── hooks/                # React hooks (useMultiplayer, useGameSocket)
│   ├── lib/                  # Utilities (api-handler, auth, logger, prisma)
│   ├── server/               # Socket.io game server (real-time PvP)
│   ├── stores/               # Zustand state management
│   └── types/                # TypeScript type definitions
├── prisma/                   # Database schema & seeds
├── public/                   # Static assets (sprites, badges, banners)
└── e2e/                      # Playwright E2E tests
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Database | PostgreSQL (Neon) via Prisma 5 |
| Auth | JWT (jose) + bcryptjs, HTTP-only cookies |
| Real-time | Socket.io (separate game server) |
| State | Zustand (client), in-memory (server) |
| Styling | CSS Modules + custom CSS |
| Testing | Vitest (unit) + Playwright (E2E) |
| Monitoring | Sentry (client + server) |
| CI/CD | GitHub Actions → Vercel |
| Hosting | Vercel (app) + separate server (Socket.io) |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or [Neon](https://neon.tech) free tier)

### Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your database URL and secrets

# Generate Prisma client & push schema
npm run db:push

# Seed the database with Pokemon data
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Multiplayer (PvP)

To run with real-time PvP multiplayer:

```bash
# Start both Next.js and game server
npm run dev:all
```

The game server runs on port 3010 (configurable via `NEXT_PUBLIC_GAME_SERVER_URL`).

## Key Features

- **AI Battles** — Turn-based 3v3 battles with status effects, evolution, items, energy system, and 8 energy types matching Pokemon TCG
- **PvP Multiplayer** — Real-time matchmaking via Socket.io with ELO-based ladder
- **150 Kanto Pokemon** — Full roster with types, moves, evolutions
- **Clan System** — Create/join clans, promote/demote members, clan rankings
- **Missions** — PvE objectives for XP rewards
- **Trainer Progression** — Levels, EXP, ranked ladder with seasonal resets
- **Admin Panel** — Manage trainers, battles, clans, Pokemon data

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run server` | Start Socket.io game server |
| `npm run dev:all` | Start both (via concurrently) |
| `npm run build` | Production build |
| `npm run test:run` | Run unit tests (Vitest) |
| `npm run test:e2e` | Run E2E tests (Playwright) |
| `npm run db:push` | Push Prisma schema to database |
| `npm run db:seed` | Seed database with Pokemon data |
| `npm run db:reset` | Reset database and reseed |
| `npm run lint` | ESLint |

## API Routes

All 41 API routes use the `apiHandler` wrapper providing:
- Structured JSON error responses (`{ success, data/error }`)
- Automatic request/response logging via Sentry-integrated logger
- Rate limiting (configurable per endpoint category)
- JWT-based authentication via `requireAuth()`
- Zod schema validation via `validateRequest()`

## Testing

```bash
# Unit tests (163 tests)
npm run test:run

# E2E tests (12 tests)
npm run test:e2e
```

## Environment Variables

See [.env.example](.env.example) for all required variables including:
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — Secret for JWT token signing
- `NEXT_PUBLIC_GAME_SERVER_URL` — Socket.io server URL (default: http://localhost:3010)

## License

Private project.
