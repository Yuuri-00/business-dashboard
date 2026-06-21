# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

Implemented and deployed. All 6 screens are built, all 5 Notion databases are connected, Google OAuth login works locally and in production, and the app is live on Vercel. [DESIGN.md](DESIGN.md) is the design document and source of truth for the data model, screens, and tech decisions below — read it before making architecture changes, and update it if an implementation decision deviates from it. There is no test suite yet.

Commands:
- `npm run dev` — starts the dev server with `--webpack` (not Turbopack — see note below)
- `npm run build` — production build
- `npm run lint` — eslint

Turbopack's dev server (the Next.js 16 default) breaks Auth.js session handling in `proxy.ts` (`TypeError: adapterFn is not a function`, thrown right after the Google OAuth callback). `package.json`'s `dev` script is pinned to `next dev --webpack` to work around this; don't revert it to plain `next dev`. Production builds/deploys are unaffected — this is dev-server-only.

## Working rules

See `.claude/rules/` for the full text of each policy:

- [config-separation.md](.claude/rules/config-separation.md) — keep deployment/account-specific values (Notion DB IDs, account names/colors, allowed login email, API keys, select-option literals) in env vars or a config/constants file, never hardcoded inline.
- [edit-approval.md](.claude/rules/edit-approval.md) — never edit a file without first describing the change and getting explicit approval, even for changes that seem obviously correct.

## Architecture (as designed in DESIGN.md)

- **Stack**: Next.js (App Router) + TypeScript, Tailwind CSS, Recharts for charts. Deployed to Vercel.
- **Data store**: Notion, accessed via `@notionhq/client`. There is no separate application database — Notion databases ARE the persistence layer. All reads/writes go through server-side code (Server Actions / Route Handlers); the Notion API key must never reach the client.
- **Auth**: NextAuth.js (Auth.js) with the Google provider, restricted to a single allowed email (`ALLOWED_EMAIL` env var) checked in the `signIn` callback. This is a single-user app — auth exists only to gate multi-device access, not to support multiple accounts. `proxy.ts` (the Next.js 16 rename of `middleware.ts`) protects all routes except `/login` and the auth callback.

### Notion data model

Five Notion databases, related to each other:

```
Accounts ──(relation)── Posts ──(relation)── Tasks
                          │                     │
                          └──(relation)── Revenue ──(relation)── ClientProjects
                                                                       │
                                                                    Tasks
```

- **Accounts** — one row per SNS/platform account (X, Instagram, YouTube, blog, etc.), each with a display color used to color-code that account's items in the calendar UI.
- **Posts** — content pieces. Carries both a `select` property for the account (used directly for calendar coloring, since Notion calendar views can't color by relation) and a `relation` to Accounts (used for analytics/rollups). Don't collapse these into just the relation — see DESIGN.md §4.2 for why both exist.
- **Tasks** — todos, optionally linked to a Post or a ClientProject via separate relation properties.
- **ClientProjects** — occasional freelance/client work, separate from the content-posting workflow.
- **Revenue** — income records, linked to either a Post (content revenue) or a ClientProject (client revenue).

Property names/select options should be centralized in `lib/notion/constants.ts` (per DESIGN.md §8) rather than hardcoded across files, since Notion schema changes are otherwise easy to silently break.

### Planned directory layout

See DESIGN.md §7 for the full planned structure. Key point: one `lib/notion/<entity>.ts` file per Notion database (accounts, posts, tasks, clientProjects, revenue), each responsible for mapping raw Notion page objects to the app's internal TypeScript types — keep that mapping logic out of components and route handlers.

### Calendar UI constraint

The posting calendar is a custom-built UI, not an embedded Notion view — Notion's calendar view doesn't support per-account color coding or the filter-chip aggregate/individual toggle the design calls for (DESIGN.md §5.2). Fetch raw data from Notion and render the calendar client-side.

### Caching

Notion's API rate limit (~3 req/sec) means reads should go through `unstable_cache`/`fetch` revalidation rather than hitting Notion on every request — longer revalidation windows for read-heavy pages (dashboard), shorter for write-heavy ones (todo). Writes use Server Actions and call both `updateTag` (Next.js 16's two-arg replacement for `revalidateTag`) and `revalidatePath` afterward; see DESIGN.md §8.
