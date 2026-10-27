# Commonplace

A public commonplace book: anyone can share a line, no account needed. Each line
belongs to exactly one category and can name its source (an author, a book, or
"Written by me"). Categories are created on the fly the first time someone uses a
new name, and matching is case-insensitive, so "Poetry" and "poetry" are the same
category. The home page shows a line of the day and the five categories with the
most lines; Browse lists everything, with search by keyword or author.

The design follows the Commonplace Figma file; colors and fonts are tokens in
`src/app/globals.css`, and the logo is `public/logo.svg`.

## Stack

- **Next.js 16** (App Router, Cache Components) on **Vercel**
- **Neon Postgres** via `pg`, with `attachDatabasePool` for Vercel Fluid compute
- **Neon Object Storage** (S3-compatible) for share-card images
- Tailwind CSS v4

## How it works

| Piece | Where |
| --- | --- |
| Schema (SQL migrations) | `db/migrations/`, applied by `scripts/migrate.mjs` |
| Posting a line (validation, honeypot, per-IP rate limit, category upsert) | `src/app/actions.ts` |
| Cached reads, invalidated with the `lines` tag after every post | `src/lib/queries.ts` |
| Share cards: rendered once with `next/og`, stored in the `commonplace` bucket, then served from storage | `src/lib/cards.tsx`, `src/app/l/[id]/card/` |
| Live check of Postgres + storage | `GET /api/health` |
| Neon services for this branch (infrastructure as code) | `neon.ts` |

Routes: `/` (line of the day, top 5 categories), `/browse` (all lines; `?category=`,
`?q=` search, `?before=` paging), `/submit` (share a line), `/about`, `/l/[id]` (one
line, with its share card).

## Local development

Requires Node 24 (`nvm use`).

```bash
npm install
neon env pull          # writes DATABASE_URL, DATABASE_URL_UNPOOLED, AWS_* into .env.local
npm run db:migrate     # applies any new db/migrations/*.sql
npm run dev
```

Optionally add `IP_HASH_SALT` (any random string) to `.env.local` to enable rate
limiting locally.

## Environment variables

| Name | Purpose |
| --- | --- |
| `DATABASE_URL` | Pooled Neon connection string (app traffic) |
| `DATABASE_URL_UNPOOLED` | Direct connection, used only by `npm run db:migrate` |
| `AWS_ENDPOINT_URL_S3`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | Neon Object Storage credentials |
| `IP_HASH_SALT` | Secret for hashing poster IPs for rate limiting (5 lines per 10 minutes). Without it, rate limiting is off. |

On Vercel, set these for Production and Preview. The build prerenders pages from
the database, so `DATABASE_URL` must be available at build time.

## Changing the schema

Add a new numbered file such as `db/migrations/002_something.sql` (never edit one
that has already been applied), then run `npm run db:migrate` before deploying
code that depends on it. Test it on a Neon branch first: `neon checkout dev --create`.

## Redesigning share cards

Cards are cached forever by URL. After changing `renderCard` in
`src/lib/cards.tsx`, bump `CARD_VERSION` in `src/lib/text.ts` so every card is
regenerated under a new key and URL.
