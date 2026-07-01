# Kin — Real-Time Crypto Dashboard

A live dashboard of the top ~20 cryptocurrencies (price, 24h change, market cap), built to answer the actual question a take-home like this asks: not "can you wire three tiers together," but how you keep data fresh without hammering an upstream API, how the system behaves when that API goes down, and how you justify the trade-offs.

## Quick start

```bash
docker compose up --build
```

Then open `http://localhost:5173`. Three containers come up: Postgres (`db`), the NestJS API (`api`), and the web client served via nginx (`web`). Migrations run automatically on the API container's boot. No API key required — the upstream (CoinGecko) is public and keyless.

**No Docker / older Docker version?**
```bash
pnpm install
pnpm db:up            # single throwaway Postgres container, no compose needed
cp .env.example apps/api/.env
pnpm --filter api exec prisma migrate deploy
pnpm dev               # runs api + web + shared package's watch build together
```

## Architecture

```
CoinGecko ──(1 call / 15s)──▶ RefreshService (single background loop)
                                 │  upsert assets · insert price_history · set RefreshMeta.lastSuccessAt
                                 ▼
                              Postgres  ◀── PricesService (reads; computes staleness)
        ┌────────────────────────┼─────────────────────────┐
   GET /api/prices       GET /api/stream (SSE)     GET /api/assets/:id/history
                                 ▼
   React + Vite — live table, freshness badge, per-coin history modal
                                 │
                          nginx (production) ──▶ proxies /api/* to the api container,
                                                  buffering disabled so SSE streams through
```

Every client request is served from Postgres. The upstream API is touched by exactly one process, on a fixed interval, regardless of how many browser tabs are open.

## Decisions & trade-offs

**Single shared refresh loop, not per-request fetching.** A `@Interval` job is the only thing that ever calls CoinGecko. This is what "respect rate limits" actually requires — the alternative (fetch-on-request) means N users produce N times the upstream traffic.

**Server-Sent Events, not WebSockets.** The feed is strictly one-directional — server pushes price updates, the client never sends anything back. SSE gets there with a plain HTTP endpoint and no socket-handshake/connection-state complexity WebSockets would add for zero benefit in this direction.

**Server-owned staleness, not client-computed.** `stale` is calculated once, server-side, from `RefreshMeta.lastSuccessAt` vs. `STALE_THRESHOLD_MS`. The client only renders whatever the server says. This avoids clock-skew bugs between client and server machines and keeps the staleness *definition* in one place.

**Two-table schema with retention, not a single snapshot table.** `assets` holds the latest upserted value per coin; `price_history` is an append-only log, pruned hourly to a rolling 24h window. This backs the `15m`/`1h`/`24h` history-window options and keeps the table bounded (~115k rows/day steady-state — trivial for Postgres, and deliberately sized for the "last hour" history requirement in the brief, not an arbitrarily small number).

**Postgres, not NoSQL.** The data is genuinely relational (assets → their price history) and the access patterns are simple, indexed range queries. A document store would buy nothing here and lose the clean `assetId, ts` index.

**REST + SSE with a shared Zod package, not tRPC.** The API stays inspectable — `curl http://localhost:3000/api/prices` just works, no client library required to understand the contract. Type-safety between `apps/api` and `apps/web` comes from `packages/shared`'s Zod schemas (inferred TS types on both sides), not from coupling the two tiers to one RPC transport.

**Vite + React, not Next.js.** This is a pure client-side SPA — nothing here benefits from SSR/RSC. Using Next.js would also blur the three-tier boundary the brief is explicitly testing (Next.js is itself a backend); Vite makes "frontend talks only to our API, never upstream" structurally obvious rather than something to explain.

**`Decimal`, never `float`, for prices.** Prisma's `Decimal(20,8)` avoids floating-point rounding errors on monetary values — a `float` would silently drift.

## Freshness & staleness model

- `RefreshMeta.lastSuccessAt` advances **only** when a refresh tick succeeds.
- `stale = now - lastSuccessAt > STALE_THRESHOLD_MS` (default 30s, refresh interval 15s — so staleness trips after roughly one missed cycle, not immediately on the first slow response).
- The client shows "updated Ns ago" in green while fresh, and an amber "data may be stale" badge once `stale` flips — driven entirely by the server's computed flag, never guessed client-side.

## Failure handling — and how to simulate it

If CoinGecko is slow, rate-limited, or down, `RefreshService` catches the failure, logs it, and leaves the database exactly as it was at the last successful tick. `lastSuccessAt` stops advancing, so `stale` flips to `true` on its own — no special-case branching required. The API keeps returning `200` with the last-known-good data; it never errors, never returns an empty body.

To see this yourself:
```bash
# apps/api/.env
SIMULATE_UPSTREAM_DOWN=true
```
Restart the API. `GET /api/prices` will return `200`, `stale: true`, and the full last-known-good dataset. The frontend shows the same data with an amber staleness badge — no crash, no blank screen.

This exact scenario is also proven by an automated test, not just a manual check:
```bash
pnpm --filter api test       # staleness unit test
pnpm --filter api test:e2e   # degradation e2e test — forces the flag, asserts 200 + stale:true + non-empty data
```

## Production next-steps

Given more time: Redis-backed caching layer in front of Postgres for read scale, a dead-letter queue for failed refresh ticks, rate limiting on the API's own public surface, Prometheus metrics + structured logging, a message queue if the ingestion volume grew beyond a single-process interval loop, and a CDN in front of the static frontend build. The architecture (single writer, many readers, server-owned freshness) is designed to extend into these without a rewrite — they're additive, not corrective.
