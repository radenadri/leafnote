# Leafnote Docs

## Package Identity

`docs/` plus root `CONTEXT.md`, `PRD.md`, and `ARCHITECTURE.md` describe product scope, domain language, architecture decisions, and implementation slices.
Docs are source of truth for agent planning. Keep them concise and implementation-grounded.

## Setup & Run

Docs have no build step. If docs mention code behavior, verify with:

```bash
pnpm typecheck
find app -maxdepth 4 -type f | sort
rg -n "term-or-feature" app docs CONTEXT.md ARCHITECTURE.md
```

## Patterns & Conventions

- Use canonical terms from `CONTEXT.md` exactly: Note, Local-first, Saved, Sync, Sign-in, Delete, Tombstone, Tag, Editor, Search, Settings, Welcome, Personal user.
- Do not use avoided aliases from `CONTEXT.md` unless documenting ambiguity.
- ADRs live in `docs/adr/NNNN-slug.md`. Keep ADRs short. Only create one for hard-to-reverse, surprising tradeoffs.
- PRD source is `docs/prd/0001-prd-mvp.md`; root `PRD.md` may mirror product requirements if maintained.
- Local issue backlog is `docs/issues/0001-leafnote-mvp-issues.md`.
- Keep `ARCHITECTURE.md` self-contained. Do not replace explanations with “see file X”.
- When code changes architecture, update `ARCHITECTURE.md` in same slice.
- When domain language changes, update `CONTEXT.md` immediately.
- Mark unknowns as “Not evident from the repository” instead of guessing.

## Key Files

- Domain glossary: `CONTEXT.md`
- Architecture guide: `ARCHITECTURE.md`
- MVP PRD: `docs/prd/0001-prd-mvp.md`
- Local issue backlog: `docs/issues/0001-leafnote-mvp-issues.md`
- ADR: `docs/adr/0001-indexeddb-as-local-source-of-truth.md`
- ADR: `docs/adr/0002-last-write-wins-sync-conflicts.md`

## JIT Index Hints

```bash
find docs -type f | sort
rg -n "Local-first|IndexedDB|Outbox|Tombstone|last-write-wins" docs CONTEXT.md ARCHITECTURE.md
rg -n "Not evident|not implemented|planned|prototype" ARCHITECTURE.md docs
rg -n "MVP|Post-MVP|Acceptance criteria|Blocked by" docs
```

## Common Gotchas

- Current code does not implement IndexedDB, Outbox, Tombstones, real Sync, or real OAuth. Docs may describe planned MVP work.
- Do not claim end-to-end encryption. PRD explicitly avoids that claim.
- Keep issues local-only unless user asks to publish to external tracker.
- README still has starter-template content; do not treat it as Leafnote product truth.

## Pre-PR Checks

For docs-only changes:

```bash
pnpm typecheck
```
