# Leafnote MVP Issues

Local-only issue backlog generated from `docs/prd/0001-prd-mvp.md`, `CONTEXT.md`, and ADRs.

These are documentation issues, not published tracker tickets. Each issue carries label: `needs-triage`.

## Issue 1: Persist Notes in IndexedDB

Labels: `needs-triage`
Type: AFK

## What to build

Create the local-first persistence path for Notes using IndexedDB as the source of truth. A Personal user can create or update a Note locally, refresh the app, and see the Note still present without sign-in or network access.

## Acceptance criteria

- [x] IndexedDB has a Notes store with `id`, `title`, `content`, `tags`, `createdAt`, `updatedAt`, and `syncStatus` fields.
- [x] Notes use stable client-generated IDs.
- [x] Notes load from IndexedDB on app start instead of mock data.
- [x] User can refresh the browser and keep created/edited Notes.
- [x] Empty new Notes are not persisted unless title or body has non-whitespace content.
- [x] Existing prototype UI still renders with seeded or migrated local data.

## Blocked by

None - can start immediately

---

## Issue 2: Autosave Note Changes Locally

Labels: `needs-triage`
Type: AFK

## What to build

Make the Editor save Notes locally after a short pause and when the user exits the Editor. Saved means written to IndexedDB, not synced.

## Acceptance criteria

- [ ] Editor saves title/body changes after 3 seconds of no typing.
- [ ] Editor saves immediately on blur or back navigation.
- [ ] UI does not block on network or sign-in.
- [ ] New Notes are created only after title or body has content.
- [ ] Existing Notes can be cleared and remain until deleted.
- [ ] Saved Notes update `updatedAt` and appear newest-first in the Notes List.

## Blocked by

- Issue 1: Persist Notes in IndexedDB

---

## Issue 3: Show Local Save and Sync Status Copy

Labels: `needs-triage`
Type: AFK

## What to build

Replace prototype sync wording with local-first status language. The app should show Local only, Saving, Saved, Syncing, or Synced only where that state is true. For local-only MVP, Notes should clearly show local saved state without implying backend sync exists.

## Acceptance criteria

- [ ] Signed-out/local Notes show Local only or Saved, not Offline as an error.
- [ ] Editor shows a subtle status during autosave.
- [ ] Notes List does not imply backend sync when user is signed out.
- [ ] Settings copy explains notes remain on this device.
- [ ] Privacy copy avoids end-to-end encryption claims.

## Blocked by

- Issue 2: Autosave Note Changes Locally

---

## Issue 4: Delete Notes with Confirmation, Undo, and Tombstone

Labels: `needs-triage`
Type: AFK

## What to build

Complete the local Delete flow. User can swipe or trigger delete, confirm removal, undo within a short window, and otherwise leave a Tombstone record for future sync.

## Acceptance criteria

- [ ] Swipe-left delete affordance works on mobile.
- [ ] Delete opens confirmation before removal.
- [ ] Confirmed Delete removes the Note from the Notes List immediately.
- [ ] Toast offers Undo for a short window.
- [ ] Undo restores the Note in newest-first order.
- [ ] Expired undo keeps Note deleted.
- [ ] Delete writes a Tombstone record locally.

## Blocked by

- Issue 1: Persist Notes in IndexedDB

---

## Issue 5: Persist Tags and Filter Notes Locally

Labels: `needs-triage`
Type: AFK

## What to build

Make Tags a local-first feature. User can attach default or custom Tags to Notes, persist them locally, and filter the Notes List by Tag.

## Acceptance criteria

- [ ] Default Tags are available: personal, work, ideas, journal, recipes, books.
- [ ] User can add a custom Tag in the Editor.
- [ ] Custom Tags persist after refresh.
- [ ] User can attach multiple Tags to a Note.
- [ ] User can remove a Tag from a Note.
- [ ] Notes List filters by selected Tag.
- [ ] All filter button uses green background and white text when active.
- [ ] No tag management screen, nested Tags, colors, rename, or delete workflow is added.

## Blocked by

- Issue 1: Persist Notes in IndexedDB
- Issue 2: Autosave Note Changes Locally

---

## Issue 6: Search Local Notes by Title and Body

Labels: `needs-triage`
Type: AFK

## What to build

Make Search read from local Notes and filter instantly by title and body only. Search must work without sign-in or network access.

## Acceptance criteria

- [ ] Search input filters Notes from IndexedDB-backed state.
- [ ] Search matches title and body only.
- [ ] Results update as user types.
- [ ] Blank query shows the Search prompt.
- [ ] No result state appears when no Notes match.
- [ ] Result count is shown.
- [ ] Result cards open the selected Note.
- [ ] Tags are not searched in MVP.

## Blocked by

- Issue 1: Persist Notes in IndexedDB

---

## Issue 7: Wire Welcome and Sign-in as Local-first Entry Points

Labels: `needs-triage`
Type: AFK

## What to build

Keep the Welcome and Sign-in screens aligned with local-first behavior. Get Started enters Notes without account. Sign-in remains optional and must not block local Note use. Since this is local-only implementation work, OAuth buttons may stay non-production placeholders unless auth is implemented in a later sync slice.

## Acceptance criteria

- [ ] Welcome screen explains local-first use and optional Sync.
- [ ] Get Started routes to Notes List without auth.
- [ ] Sign in to sync routes to Sign-in screen.
- [ ] Sign-in screen uses Google and Apple buttons only.
- [ ] No email/password fields are present.
- [ ] Copy avoids end-to-end encryption claims.
- [ ] Local Notes remain available after navigating back from Sign-in.

## Blocked by

None - can start immediately

---

## Issue 8: Complete Local-first Settings Screen

Labels: `needs-triage`
Type: AFK

## What to build

Make Settings describe the current local-only state correctly. A Personal user can see account/sync placeholders, app version, and privacy copy without advanced preferences.

## Acceptance criteria

- [ ] Settings shows Sign in CTA when signed out.
- [ ] Sync status does not label signed-out local use as broken.
- [ ] App version is shown.
- [ ] Privacy copy says Notes are private and stored securely.
- [ ] Copy explains local Notes remain on this device.
- [ ] No theme, export, wipe data, profile, or advanced preferences are added.

## Blocked by

- Issue 3: Show Local Save and Sync Status Copy

---

## Issue 9: Add Local Outbox for Future Sync

Labels: `needs-triage`
Type: AFK

## What to build

Add the local Outbox store and enqueue local create, update, and delete operations after IndexedDB writes succeed. This is groundwork only. It must not call a backend.

## Acceptance criteria

- [ ] IndexedDB has an Outbox store.
- [ ] Create Note enqueues a create/update operation after local save succeeds.
- [ ] Edit Note enqueues an update operation after local save succeeds.
- [ ] Delete Note enqueues a delete operation after Tombstone write succeeds.
- [ ] Outbox entries preserve local write order.
- [ ] Failed or unprocessed Outbox entries remain local.
- [ ] No backend sync request is made in this local-only slice.

## Blocked by

- Issue 1: Persist Notes in IndexedDB
- Issue 2: Autosave Note Changes Locally
- Issue 4: Delete Notes with Confirmation, Undo, and Tombstone

---

## Issue 10: Add Local-first Regression Tests

Labels: `needs-triage`
Type: AFK

## What to build

Add tests that prove the local-first MVP behavior works end-to-end: local persistence, autosave, delete/undo, tags, and search.

## Acceptance criteria

- [ ] Test proves a Note persists across reload using local storage layer.
- [ ] Test proves autosave after 3 seconds idle.
- [ ] Test proves blur/back save behavior.
- [ ] Test proves empty new Note is discarded.
- [ ] Test proves Delete confirmation and Undo restore behavior.
- [ ] Test proves Tombstone is written after Delete.
- [ ] Test proves Tag filtering works.
- [ ] Test proves Search matches title/body only.

## Blocked by

- Issue 1: Persist Notes in IndexedDB
- Issue 2: Autosave Note Changes Locally
- Issue 4: Delete Notes with Confirmation, Undo, and Tombstone
- Issue 5: Persist Tags and Filter Notes Locally
- Issue 6: Search Local Notes by Title and Body

---

## Suggested dependency order

1. Issue 1: Persist Notes in IndexedDB
2. Issue 7: Wire Welcome and Sign-in as Local-first Entry Points
3. Issue 2: Autosave Note Changes Locally
4. Issue 3: Show Local Save and Sync Status Copy
5. Issue 4: Delete Notes with Confirmation, Undo, and Tombstone
6. Issue 5: Persist Tags and Filter Notes Locally
7. Issue 6: Search Local Notes by Title and Body
8. Issue 8: Complete Local-first Settings Screen
9. Issue 9: Add Local Outbox for Future Sync
10. Issue 10: Add Local-first Regression Tests
