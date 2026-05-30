# Leafnote Post-MVP Architecture Issues

Local-only architecture issue backlog generated from `docs/architecture/0001-post-mvp-architecture-improvement-plan.md`, `CONTEXT.md`, and ADRs.

These are documentation issues, not published tracker tickets. Each issue carries label: `needs-triage`.

## Issue 1: Refresh MVP Architecture and Agent Docs

Labels: `needs-triage`
Type: AFK

## Parent

`docs/architecture/0001-post-mvp-architecture-improvement-plan.md`

## What to build

Update Leafnote docs so future maintainers and agents see the completed Local-first MVP, not the pre-MVP prototype. The docs should accurately describe IndexedDB as the local source of truth, existing Outbox and Tombstone stores, IndexedDB-backed `useLeafnote()`, current Tag persistence, and required validation commands.

## Acceptance criteria

- [x] `ARCHITECTURE.md` reflects IndexedDB-backed Notes, Tombstones, Outbox, Search, Tags, Settings, Welcome, and Sign-in as implemented after Issues #1-#10.
- [x] `app/AGENTS.md` no longer says Notes come only from mock data or that IndexedDB/Tombstones/Outbox are absent.
- [x] `README.md` reflects Leafnote product/runtime setup instead of stale starter/prototype claims.
- [x] `.github/workflows/ci.yml` runs local-first regression tests in addition to lint/typecheck.
- [x] Definition of Done includes `pnpm test`, `pnpm typecheck`, `pnpm lint`, and `pnpm build` where appropriate.
- [x] Docs continue to avoid backend, real Sync, real OAuth, and end-to-end encryption claims.

## Blocked by

None - can start immediately

---

## Issue 2: Deepen the Local Persistence Module

Labels: `needs-triage`
Type: AFK

## Parent

`docs/architecture/0001-post-mvp-architecture-improvement-plan.md`

## What to build

Refactor the IndexedDB-backed local persistence Module so callers keep the same Local-first behaviour while the implementation concentrates database setup, object-store transactions, record codecs, Outbox ordering, and atomic Note/Tombstone/Outbox writes behind a deeper seam.

## Acceptance criteria

- [x] Public Note callers can still save, list, delete, restore, seed, and verify local data through the local persistence Module.
- [x] Save still writes a Note and enqueues an `upsertNote` Outbox entry only after local write success.
- [x] Delete still removes the Note, writes a Tombstone, and enqueues a `deleteNote` Outbox entry atomically.
- [x] Restore still restores the Note and removes its Tombstone without resurrecting stale Tombstones.
- [x] Outbox entries preserve local write order with an explicit monotonic sequence owned by the persistence implementation.
- [x] IndexedDB store names, version handling, transactions, and record serialization are localized inside the persistence implementation.
- [x] Existing local persistence and local-first regression tests pass without weakening behaviour coverage.

## Blocked by

- Issue 1: Refresh MVP Architecture and Agent Docs

---

## Issue 3: Deepen the Note Lifecycle Module

Labels: `needs-triage`
Type: AFK

## Parent

`docs/architecture/0001-post-mvp-architecture-improvement-plan.md`

## What to build

Move Note draft creation, editing, autosave, explicit Save, timestamp handling, empty-new-Note discard, existing-empty-Note allowance, Tag copying, and Saved status into one deeper Note lifecycle Module used by the Editor route.

## Acceptance criteria

- [x] The Editor route no longer owns autosave timer logic, Note timestamp creation, or empty Note persistence rules.
- [x] Opening `/notes/new` still creates a stable client-generated Note ID only for the Editor session.
- [x] Autosave still writes after 3 seconds idle.
- [x] Blur/back navigation still saves immediately.
- [x] Empty new Notes are still discarded.
- [x] Existing Notes can still be cleared and remain until deleted.
- [x] Editor status still shows Local only/Saving/Saved accurately.
- [x] Regression tests exercise the same Note lifecycle seam used by the Editor route.

## Blocked by

- Issue 2: Deepen the Local Persistence Module

---

## Issue 4: Consolidate Tag Persistence into One Local-first Tag Module

Labels: `needs-triage`
Type: AFK

## Parent

`docs/architecture/0001-post-mvp-architecture-improvement-plan.md`

## What to build

Replace the split Tag persistence path with one Local-first Tag Module. Tag availability should come from default Tags plus Tags attached to locally Saved Notes, or from IndexedDB if unattached custom Tags must survive before a Note is saved. Do not keep a separate `localStorage` source of truth for Tags.

## Acceptance criteria

- [x] Default Tags remain available: personal, work, ideas, journal, recipes, books.
- [x] Custom Tags attached to Notes persist after refresh through IndexedDB-backed data.
- [x] If unattached custom Tags remain supported, they persist in IndexedDB rather than `localStorage`.
- [x] Tag normalization and duplicate handling live behind one Tag interface.
- [x] Editor can attach and remove multiple Tags from a Note.
- [x] Notes List can filter by selected Tag with the same user-visible behaviour as before.
- [x] No Tag management screen, nested Tags, colors, rename, or delete workflow is added.
- [x] Tests verify Tag persistence/filtering through the local store seam, not separate `localStorage` setup.

## Blocked by

- Issue 2: Deepen the Local Persistence Module
- Issue 3: Deepen the Note Lifecycle Module

---

## Issue 5: Deepen the Note Query Module for List and Search

Labels: `needs-triage`
Type: AFK

## Parent

`docs/architecture/0001-post-mvp-architecture-improvement-plan.md`

## What to build

Create one Note query Module that owns local Note projections for newest-first Notes List, Tag-filtered Notes List, and Search by title/body only. Pages should provide query inputs and render results, not own ordering, filtering, or Search invariants.

## Acceptance criteria

- [x] Notes List still shows Notes newest-first by `updatedAt`.
- [x] Notes List still filters by selected Tag.
- [x] All filter still shows every visible Note.
- [x] Search still matches title and body only.
- [x] Search still ignores Tags.
- [x] Blank Search query still shows the Search prompt.
- [x] No-result and result-count behaviour remains unchanged.
- [x] Notes List and Search tests verify behaviour through the shared Note query Module.

## Blocked by

- Issue 4: Consolidate Tag Persistence into One Local-first Tag Module

---

## Issue 6: Deepen Delete and Undo into a Note Removal Module

Labels: `needs-triage`
Type: AFK

## Parent

`docs/architecture/0001-post-mvp-architecture-improvement-plan.md`

## What to build

Move Delete/Undo state and behaviour into one deeper Note removal Module. Swipe confirmation can stay in the card UI, but confirmed Delete, Undo window state, expiration, Tombstone persistence, Outbox enqueue, and restore should be coordinated behind one seam used by the Notes List.

## Acceptance criteria

- [ ] Swipe-left or delete trigger still opens confirmation before removal.
- [ ] Confirmed Delete still removes the Note from the Notes List immediately.
- [ ] Confirmed Delete still writes a Tombstone and `deleteNote` Outbox entry.
- [ ] Undo banner/toast state is owned by the Note removal Module, not scattered in the Notes List route.
- [ ] Undo within the window restores the Note and removes its Tombstone.
- [ ] Expired Undo keeps the Note deleted.
- [ ] Future Delete triggers can reuse the same Note removal interface without duplicating timers or restore logic.
- [ ] Tests cover Delete/Undo/Tombstone/Outbox as one behaviour through the Note removal seam.

## Blocked by

- Issue 2: Deepen the Local Persistence Module
- Issue 5: Deepen the Note Query Module for List and Search
