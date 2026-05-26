# Leafnote

A calm, local-first note-taking app built with Nuxt.

Leafnote is for personal notes, not teams. It is designed to feel fast on mobile web, work before sign-in, and keep writing as the main focus.

## What it is

Leafnote is a Nuxt 4 mobile web app prototype for a simple private notes experience.

Current features:

- Welcome screen with local-first entry
- Optional sign-in screen placeholder
- Notes list with tag filters
- Note editor with title, body, and tag picker
- Swipe-to-delete note cards with confirmation and undo
- Search by note title and body
- Settings screen with local-first privacy copy
- Warm neutral Leafnote design system

Planned MVP work:

- IndexedDB as the local source of truth
- Autosave after 3 seconds idle and on editor exit
- Local Outbox for future sync
- Tombstones for deleted notes
- Local-first regression tests

## Tech stack

- Nuxt 4
- Vue 3
- TypeScript
- Nuxt UI
- Tailwind CSS 4
- pnpm

## Project structure

```text
app/
  app.vue                    Nuxt root app, SEO, UApp provider
  app.config.ts              Nuxt UI config
  assets/css/main.css        Leafnote design tokens and utilities
  components/leafnote/       Feature UI components
  composables/               Leafnote state facade and helpers
  data/mockNotes.ts          Prototype seed notes
  pages/                     Nuxt routes
  types/note.ts              Note and sync types

docs/
  adr/                       Architecture decision records
  issues/                    Local implementation issues
  prd/                       Product requirements

CONTEXT.md                   Domain glossary
ARCHITECTURE.md              Codebase architecture guide
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

Open the app at:

```text
http://localhost:3000
```

## Available commands

```bash
pnpm dev        # Start Nuxt dev server
pnpm build      # Build production output
pnpm preview    # Preview production build
pnpm lint       # Run ESLint
pnpm typecheck  # Run Nuxt typecheck
```

Before handing off changes, run:

```bash
pnpm typecheck && pnpm lint && pnpm build
```

## Product docs

Start here if you are changing behavior:

- `docs/prd/0001-prd-mvp.md`: MVP requirements
- `docs/issues/0001-leafnote-mvp-issues.md`: local implementation backlog
- `CONTEXT.md`: domain language
- `ARCHITECTURE.md`: system overview and current constraints

Important ADRs:

- `docs/adr/0001-indexeddb-as-local-source-of-truth.md`
- `docs/adr/0002-last-write-wins-sync-conflicts.md`

## Current architecture status

Leafnote is currently frontend-only.

Notes are seeded from `app/data/mockNotes.ts` and held in Nuxt `useState`. Custom tags persist in `localStorage`. IndexedDB, real sync, real OAuth, and tests are planned but not implemented yet.

Do not treat the sign-in screen as production auth. It is a placeholder for the future optional sync flow.

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
