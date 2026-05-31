# Handoff: Leafnote → Claude Code

## Current state

Repo: `/Users/macbook/Vue/leafnote`

Working tree at handoff time: clean (`git status --short` empty).

Leafnote MVP and post-MVP architecture refactor backlog are complete in local docs:

- MVP backlog: `docs/issues/0001-leafnote-mvp-issues.md` — all Issue #1-#10 criteria checked.
- Architecture plan: `docs/architecture/0001-post-mvp-architecture-improvement-plan.md`.
- Post-MVP architecture backlog: `docs/issues/0002-post-mvp-architecture-issues.md` — all Issue #1-#6 criteria checked.
- Current architecture guide: `ARCHITECTURE.md` rewritten to current state.
- App-specific agent guide: `app/AGENTS.md` updated.
- Docs-specific guide: `docs/AGENTS.md` updated.
- README updated to current Leafnote state.

## What changed in this session

High-level only; inspect diffs/history for exact edits.

### MVP Issues #1-#10 completed

Implemented Local-first app behavior:

- IndexedDB-backed Notes source of truth.
- Autosave after 3 seconds idle and on Editor exit.
- Local-first status/copy.
- Delete confirmation, Undo, Tombstone.
- Local-first Tags and filtering.
- Search by title/body only.
- Welcome/Sign-in and Settings local-first copy.
- Outbox for future Sync.
- Regression tests.

### Post-MVP Architecture Issues #1-#6 completed

Refactored/deepened Modules:

- Local persistence Module: `app/services/leafnote-local-store.ts`
  - IndexedDB stores: `notes`, `tombstones`, `outbox`, `meta`.
  - Atomic Save + Outbox, Delete + Tombstone + Outbox, Restore + Tombstone removal.
  - Outbox monotonic sequence in `meta` store.
- Note lifecycle Module: `app/services/leafnote-editor-session.ts`
  - Owns draft state, autosave timer, Save status, empty Note rules.
  - Editor route composes this module.
- Tag Module: `app/services/leafnote-tags.ts`
  - `getAvailableTags()`, `normalizeTag()`.
  - Removed `localStorage` Tag persistence and `CUSTOM_TAGS_KEY`; unattached custom Tags are session-only until attached to a Note.
- Note query Module: `app/services/leafnote-note-query.ts`
  - `getNoteList()`, `searchNotes()`.
  - Removed old `leafnote-search.ts`.
- Note removal Module: `app/services/leafnote-note-removal.ts`
  - Owns Delete/Undo timer/state and restore behavior.
  - Notes List route composes this module.
- CI now runs tests in `.github/workflows/ci.yml`.

### UI polish after architecture work

User reported blue hover accents on buttons. Updated `app/assets/css/main.css`:

- Nuxt UI color tokens now map to Leafnote sage/warm-neutral palette.
- Added global button/link hover token overrides.
- Added `accent-color` and tap highlight using Leafnote green.

## Important files for next session

Core runtime:

- `app/composables/useLeafnote.ts`
- `app/services/leafnote-local-store.ts`
- `app/services/leafnote-editor-session.ts`
- `app/services/leafnote-note-removal.ts`
- `app/services/leafnote-note-query.ts`
- `app/services/leafnote-tags.ts`
- `app/services/leafnote-status.ts`
- `app/pages/notes/[id].vue`
- `app/pages/notes/index.vue`
- `app/pages/search.vue`
- `app/pages/settings.vue`
- `app/pages/index.vue`
- `app/pages/signin.vue`
- `app/assets/css/main.css`

Tests:

- `app/services/leafnote-local-store.test.ts`
- `app/services/leafnote-editor-session.test.ts`
- `app/services/leafnote-note-removal.test.ts`
- `app/services/leafnote-note-query.test.ts`
- `app/services/leafnote-local-regression.test.ts`
- `app/services/leafnote-tags.test.ts`
- `app/services/leafnote-status.test.ts`
- `app/services/leafnote-entrypoints.test.ts`
- `app/services/leafnote-settings.test.ts`

Docs/backlogs:

- `CONTEXT.md`
- `ARCHITECTURE.md`
- `docs/issues/0001-leafnote-mvp-issues.md`
- `docs/issues/0002-post-mvp-architecture-issues.md`
- `docs/architecture/0001-post-mvp-architecture-improvement-plan.md`
- `docs/adr/0001-indexeddb-as-local-source-of-truth.md`
- `docs/adr/0002-last-write-wins-sync-conflicts.md`

## Validation status

Last full validation after hover/accent fix:

```bash
pnpm typecheck
pnpm lint
pnpm build
```

passed. Known build warnings remain expected:

- Nuxt/Tailwind sourcemap warnings.
- VueUse Rollup pure-comment warnings.

Last full test run after Note removal work:

```bash
pnpm test
```

passed: 10 files, 35 tests.

For any code handoff, run:

```bash
pnpm test && pnpm typecheck && pnpm lint && pnpm build
```

## Product constraints to preserve

From `CONTEXT.md` / project instructions:

- Use domain terms: Note, Local-first, Outbox, Saved, Sync, Sign-in, Delete, Tombstone, Tag, Editor, Search, Settings, Welcome, Personal user.
- Local-first: creating/editing/searching/tagging/deleting Notes must work before Sign-in/network.
- Do not add backend, real OAuth, or real Sync unless explicitly asked.
- Do not claim end-to-end encryption.
- Sign-in is placeholder for future optional Sync only.
- Mobile shell should remain max-width mobile even on desktop.

## Suggested skills for next session

Use as needed:

- `tdd` for behavior changes or bug fixes.
- `diagnose` for runtime/UI bugs.
- `vue-best-practices` for Vue route/component edits.
- `nuxt` / `nuxt-ui` for Nuxt UI or routing work.
- `improve-codebase-architecture` if doing another architecture review.
- `to-issues` if turning a new plan into local docs issues.
- `frontend-skill` for visual polish.

## Possible next work

No active blocker. Likely next tasks:

1. Manual browser QA of the hover/accent fix and mobile flows.
2. Consider visual tuning for Nuxt UI modal/buttons if any blue remains.
3. Add Playwright/E2E tests if the user wants browser-level coverage.
4. Continue product work beyond MVP: real Sync design, export, richer Editor, or deployment.

## Notes for Claude Code

Read nearest `AGENTS.md` before edits. Keep responses terse. Prefer small vertical slices. Avoid broad rewrites unless requested.
