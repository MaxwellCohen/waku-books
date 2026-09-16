<div align="center">

<img src="public/logo.svg" alt="Waku Books" width="72" height="72" />

# Waku Books

Waku Books is built from a Goodreads dataset of over 2,000,000 books. The live catalog includes books with usable cover images and uses [Waku](https://waku.gg/), Drizzle, and PostgreSQL.

</div>

---

Rebuild of [vercel-labs/book-inventory](https://github.com/vercel-labs/book-inventory), now archived, ported to [Waku 1.0](https://waku.gg/). [Full dataset here](https://mengtingwan.github.io/data/goodreads.html).

## Run locally

```bash
pnpm install
pnpm dev
```

`POSTGRES_URL` is optional. Without it the app serves a small preview catalog.

```bash
pnpm exec tsc --noEmit
pnpm build
```

## Testing

Playwright covers catalog search, filters, pagination, and book pages.

```bash
pnpm test:e2e
```

## Database

The original dataset contains more than two million Goodreads books. The schema uses PostgreSQL's `unaccent` extension for accent-insensitive title search:

```sql
CREATE EXTENSION IF NOT EXISTS unaccent;
```

The source dataset is available from the [UCSD Book Graph project](https://mengtingwan.github.io/data/goodreads.html).

Set `POSTGRES_URL`, then create the schema and load the bundled four-book sample:

```bash
pnpm db:setup
```

Optionally generate the cover-image placeholders after seeding:

```bash
pnpm db:seed-thumbhash
```
