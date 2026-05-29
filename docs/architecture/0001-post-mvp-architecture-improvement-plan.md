# Leafnote Architecture Improvement Plan after MVP Issues #1-#10

Status: proposed, no implementation changes yet.

This review covers the result of Issues #1-#10: IndexedDB persistence, autosave, local-first status copy, Delete/Tombstone, Tags, Search, Welcome/Sign-in, Settings, Outbox, and regression tests.

## Current result

Leafnote now satisfies the MVP behaviour, but several Modules became shallow while adding slices quickly. The main friction is not missing behaviour; it is low locality. A future change to Note lifecycle, Save semantics, Delete/Undo, or Sync will require edits across pages, the `useLeafnote` facade, IndexedDB code, and tests.

The ADRs still hold:

- ADR-0001: IndexedDB is the local source of truth.
- ADR-0002: future Sync uses Last-write-wins, and Outbox order matters.

No proposal below contradicts those ADRs.

## Deepening opportunities

### 1. Deepen the Note lifecycle Module

**Files**

- `app/pages/notes/[id].vue`
- `app/services/leafnote-editor-session.ts`
- `app/composables/useLeafnote.ts`
- `app/services/leafnote-local-store.ts`
- `app/services/leafnote-editor-session.test.ts`
- `app/services/leafnote-local-regression.test.ts`

**Problem**

The Editor page and `createLeafnoteEditorSession()` both know how a Note becomes Saved: stable ID, `createdAt`, `updatedAt`, empty-new-Note discard, existing-empty-Note allowance, Tag copying, Save status, autosave timer, and local write. This splits one domain concept across two Modules.

Deletion test: if `createLeafnoteEditorSession()` vanished, much of its complexity already exists in `app/pages/notes/[id].vue`. That means the current Module is not deep enough; it is a partial test seam, not the main Note lifecycle seam.

**What must change**

Create one deeper Note lifecycle Module that owns draft creation, editing, autosave, explicit Save, and status transitions. The Editor page should call a small interface such as “open this Note or new Note”, “set title/content/tags”, “save now”, and “dispose”. The implementation should hide timer logic, empty Note rules, timestamps, and local store calls.

**Reason**

A Note becoming Saved is a core Local-first invariant. It should live in one place. That gives maintainers locality when Save rules change and gives tests leverage through one interface instead of testing page-local watchers plus a separate session Module.

**Benefits**

- **Locality**: Save/autosave bugs are fixed in one Module.
- **Leverage**: Editor page gets all Save behaviour through a small interface.
- **Tests**: regression tests can exercise the same seam the Editor uses, not a parallel implementation.

---

### 2. Deepen the local persistence Module around IndexedDB transactions

**Files**

- `app/services/leafnote-local-store.ts`
- `app/services/leafnote-local-store.test.ts`
- `app/services/leafnote-local-regression.test.ts`

**Problem**

`leafnote-local-store.ts` has the right external seam, but its implementation now mixes several concerns in one file:

- IndexedDB open/version/store setup
- object store transactions
- Note serialization
- Tombstone serialization
- Outbox entry sequencing
- Outbox enqueue semantics
- sorting and filtering concerns

The interface is also starting to leak internal storage concepts to callers: `listTombstones()` and `listOutboxEntries()` are useful for tests and future Sync, but ordinary Note callers should not need to know these stores exist.

Outbox sequence currently depends on `Date` + `performance.now()`. It passed tests, but the ordering invariant deserves an explicit local monotonic sequence inside the persistence implementation, not a timestamp formula callers/tests must trust indirectly.

**What must change**

Split the implementation internally while keeping the external persistence seam small. Keep one public local store Module, but move internals into private Modules or internal functions by concept:

- IndexedDB database/transaction adapter
- Note record codec
- Tombstone record codec
- Outbox record codec and sequence generator
- atomic write operations: save Note + Outbox, Delete + Tombstone + Outbox, restore Note + remove Tombstone

Expose Sync-facing Outbox reads deliberately, not as part of the page-facing Note interface.

**Reason**

The persistence Module should be deep: callers should get atomic Local-first guarantees without knowing object store names, transaction grouping, serialization formats, or sequence mechanics.

**Benefits**

- **Locality**: IndexedDB migration/transaction bugs stay inside the persistence implementation.
- **Leverage**: pages and composables get atomic Note/Outbox/Tombstone behaviour from a small interface.
- **Tests**: tests can verify behaviours like “Delete writes Tombstone and Outbox after local Delete succeeds” without coupling to store layout.

---

### 3. Replace split Tag persistence with a single Tag Module

**Files**

- `app/composables/useLeafnote.ts`
- `app/services/leafnote-tags.ts`
- `app/components/leafnote/TagPicker.vue`
- `app/pages/notes/[id].vue`
- `app/types/note.ts`

**Problem**

Tags are now stored in two places:

- attached to Notes in IndexedDB
- custom Tag names in `localStorage`

`getAvailableTags()` compensates by reading Tags from Notes, but `useLeafnote()` still separately owns `loadCustomTags()` and `saveCustomTags()` through `localStorage`. This creates two persistence paths for one domain concept.

Deletion test: if the custom Tag `localStorage` path vanished, most app behaviour would still work because attached Tags survive on Notes. That suggests the current custom Tag Module is shallow and may be unnecessary.

**What must change**

Choose one source for Tag availability. Preferred: derive available Tags from `DEFAULT_TAGS` plus Tags attached to locally Saved Notes. If unattached custom Tags must survive before a Note is saved, move them into IndexedDB behind the same local persistence seam, not `localStorage`.

**Reason**

Tags are a Local-first domain concept. Keeping part of them in `localStorage` weakens the ADR-0001 decision that IndexedDB is the local source of truth.

**Benefits**

- **Locality**: Tag persistence and normalization rules live in one Module.
- **Leverage**: Editor, Notes List, and Search can all trust the same Tag interface.
- **Tests**: Tag tests can use the local store seam rather than separate `localStorage` setup.

---

### 4. Deepen the Notes List query Module

**Files**

- `app/pages/notes/index.vue`
- `app/pages/search.vue`
- `app/services/leafnote-search.ts`
- `app/services/leafnote-tags.ts`
- `app/composables/useLeafnote.ts`

**Problem**

Notes are queried in several small places:

- Notes List sorts by newest update and filters by Tag.
- Search filters by title/body only.
- `useLeafnote()` lists all Notes from IndexedDB.
- Tests perform some filtering directly.

These pure functions are useful, but the real product concept is “show a Personal user the right Notes for this view.” That concept has no deep Module. Sorting, empty query behaviour, title/body-only Search, and Tag filtering are spread across pages and tests.

**What must change**

Create a Note query Module that owns local Note projections:

- newest-first Notes List
- Tag-filtered Notes List
- Search results by title/body only
- result count/no-result semantics if needed

Pages should provide query inputs and render results. They should not own ordering/search/filter invariants.

**Reason**

Search and Tags are Local-first read paths over the same Notes. They should share one seam so future changes, such as excluding empty Notes, hiding Tombstoned Notes, or adding Sync state filters, happen once.

**Benefits**

- **Locality**: query behaviour changes in one Module.
- **Leverage**: pages get correct lists/results from a small interface.
- **Tests**: query tests become behaviour specs for Notes List and Search, not separate page logic.

---

### 5. Move Delete/Undo into a deeper Note removal Module

**Files**

- `app/pages/notes/index.vue`
- `app/components/leafnote/SwipeableNoteCard.vue`
- `app/composables/useLeafnote.ts`
- `app/services/leafnote-local-store.ts`

**Problem**

Delete currently spans UI state and persistence state:

- swipe confirmation lives in `SwipeableNoteCard.vue`
- recently deleted Note and timer live in `pages/notes/index.vue`
- persistence Delete/restore lives in `useLeafnote()` and `leafnote-local-store.ts`
- Toast/banner copy lives in the page

The page must know too much: when to store the recently deleted Note, when to clear it, how long Undo lasts, and when to call restore. That makes Delete hard to reason about as a single domain operation.

**What must change**

Create a Note removal Module that owns Delete confirmation result handling, Undo window state, expiration, Tombstone persistence, and restore. The page should render state exposed by the Module and invoke `requestDelete`, `confirmDelete`, and `undoDelete`-style behaviour.

**Reason**

Delete has important Local-first invariants: confirmed Delete removes the Note, writes Tombstone, enqueues Outbox, Undo restores and removes Tombstone. These should be concentrated behind one seam.

**Benefits**

- **Locality**: Delete/Undo/Tombstone bugs are fixed in one Module.
- **Leverage**: any future Delete trigger gets the same behaviour.
- **Tests**: tests can cover Delete/Undo as a single behaviour rather than coordinating page state and store state.

---

### 6. Update architecture and agent docs after the MVP

**Files**

- `ARCHITECTURE.md`
- `app/AGENTS.md`
- `README.md`
- `.github/workflows/ci.yml`

**Problem**

Some docs still describe the pre-MVP prototype: notes from mock data, no IndexedDB, no Outbox, no Tombstone, no tests in CI. This makes the codebase less AI-navigable because future agents will read stale instructions before touching correct code.

This is architecture friction, not just documentation polish: wrong docs move complexity into every future session because each agent must rediscover what is true.

**What must change**

Refresh docs to reflect the completed MVP:

- IndexedDB is implemented as the local source of truth.
- Outbox and Tombstone stores exist.
- `useLeafnote()` is IndexedDB-backed.
- custom Tags currently use a mixed path and should be called out if kept.
- tests exist and should run in CI.
- Definition of Done should include `pnpm test` and possibly `pnpm build`.

**Reason**

Docs are a seam for future maintainers and agents. Stale docs reduce locality because every change begins with reconciliation work.

**Benefits**

- **Locality**: product and architecture truth lives in docs and code together.
- **Leverage**: future issue work starts faster and with fewer wrong assumptions.
- **Tests**: CI can enforce local-first regressions, not just lint/typecheck.

## Recommended order

1. Update architecture and agent docs. This removes stale guidance before more work.
2. Deepen the local persistence Module. This protects ADR-0001 and ADR-0002 invariants.
3. Deepen the Note lifecycle Module. This removes duplicate Save/autosave logic.
4. Replace split Tag persistence with a single Tag Module.
5. Deepen the Notes List query Module.
6. Move Delete/Undo into a deeper Note removal Module.

## Non-goals

- Do not add a backend.
- Do not implement real Sync.
- Do not add Sign-in/auth.
- Do not add rich text editing.
- Do not claim end-to-end encryption.

## Open decision

Which candidate should be explored first? Recommended first implementation: candidate 6, because stale docs now contradict completed MVP behaviour and will mislead future agents.
