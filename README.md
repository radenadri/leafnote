# Leafnote

Leafnote is a calm, Local-first note-taking app built with Nuxt 4.

It is for personal notes, not teams. Notes work before Sign-in or network access. Sign-in is only a placeholder for future optional Sync.

## Current features

- Mobile-first Nuxt web app with a fixed-width mobile shell
- Welcome screen with Local-first entry
- Optional Sign-in placeholder with Google and Apple buttons only
- IndexedDB-backed Notes as the local source of truth
- Autosave after 3 seconds idle and on Editor exit
- Notes List with Tag filters
- Editor with title, body, and Tag picker
- Swipe-to-delete with confirmation and Undo
- Local Tombstones for deleted Notes
- Local Outbox entries for future Sync
- Search by Note title and body only
- Settings screen with local-only Sync status and privacy copy
- Local-first regression tests with Vitest and fake-indexeddb

## Not implemented

- Real Sync
- Real OAuth/auth callbacks
- Backend API
- Rich text editing
- End-to-end encryption

## Tech stack

- Nuxt 4
- Vue 3
- TypeScript
- Nuxt UI
- Tailwind CSS 4
- Vitest
- fake-indexeddb
- pnpm

## Project structure

```text
app/
  app.vue                    Nuxt root app, SEO, UApp provider
  app.config.ts              Nuxt UI config
  assets/css/main.css        Leafnote design tokens and utilities
  components/leafnote/       Feature UI modules
  composables/               Leafnote state facade and helpers
  data/mockNotes.ts          First-run seed Notes
  pages/                     Nuxt routes
  services/                  Local persistence, Search, Tags, status, copy models
  types/note.ts              Note and Tag types/constants

docs/
  adr/                       Architecture decision records
  architecture/              Architecture improvement plans
  issues/                    Local implementation issues
  prd/                       Product requirements

CONTEXT.md                   Domain glossary
ARCHITECTURE.md              Current architecture guide
AGENTS.md                    AI agent instructions
```

## Getting started

Install dependencies:

```bash
pnpm install
```

Start the dev server:

```bash
pnpm dev
```

Open:

```text
http://localhost:3000
```

## Commands

```bash
pnpm dev        # Start Nuxt dev server
pnpm test       # Run Vitest tests
pnpm typecheck  # Run Nuxt typecheck
pnpm lint       # Run ESLint
pnpm build      # Build production output
pnpm preview    # Preview production build
```

Before handing off code changes, run:

```bash
pnpm test && pnpm typecheck && pnpm lint && pnpm build
```

## Local data

Leafnote stores current app data in the browser:

- IndexedDB database: `leafnote`
  - `notes`: local Note source of truth
  - `tombstones`: Delete records for future Sync
  - `outbox`: ordered local changes for future Sync
- `localStorage` key: `leafnote_custom_tags`
  - custom Tag names entered in the Editor

`app/data/mockNotes.ts` seeds the Notes store only when it is empty.

## Product docs

Start here if changing behavior:

- `CONTEXT.md`: domain language
- `ARCHITECTURE.md`: current architecture
- `docs/prd/0001-prd-mvp.md`: MVP requirements
- `docs/issues/0001-leafnote-mvp-issues.md`: completed MVP backlog
- `docs/issues/0002-post-mvp-architecture-issues.md`: post-MVP architecture backlog
- `docs/architecture/0001-post-mvp-architecture-improvement-plan.md`: architecture improvement plan

Important ADRs:

- `docs/adr/0001-indexeddb-as-local-source-of-truth.md`
- `docs/adr/0002-last-write-wins-sync-conflicts.md`

## Design direction

Leafnote should feel:

- Calm
- Private
- Lightweight
- Mobile-first
- Writing-focused

Avoid:

- Social features
- Team/workspace concepts
- Heavy organization systems
- End-to-end encryption claims unless actually implemented
- Network-gated local actions

## Notes for agents

Read nearest `AGENTS.md` before editing:

- Root work: `AGENTS.md`
- App work: `app/AGENTS.md`
- Docs work: `docs/AGENTS.md`

Keep changes aligned with `CONTEXT.md` and `ARCHITECTURE.md`.
