# Leafnote MVP PRD

## 1. Product summary

Leafnote is a personal, local-first mobile web note-taking app for individuals who want a calm writing space with optional sync.

The app must work before sign-in and without network access. Users can create, edit, search, tag, and delete notes locally. Sign-in only enables backup and cross-device sync.

## 2. Product goals

- Make note capture fast on mobile web.
- Keep writing flow calm, simple, and distraction-free.
- Treat local device storage as the source of truth.
- Make sync optional, quiet, and non-blocking.
- Avoid team, sharing, workspace, and heavy organization features.

## 3. Non-goals

MVP will not include:

- Collaboration or sharing
- Teams, workspaces, or organizations
- Email/password auth
- End-to-end encryption claims
- Native Android/iOS apps
- Folders, notebooks, nested tags, archive, or trash
- Rich text editing
- Attachments
- Manual conflict resolution
- Advanced search filters
- Theme/settings customization
- Export/import

## 4. Target platform

MVP targets mobile web first, with PWA-friendly behavior. Native Android/iOS apps are out of scope for MVP.

## 5. Target user

A personal user who writes private notes for themselves. They may use Leafnote without an account. If they want backup or cross-device access, they can sign in with OAuth.

## 6. Core concepts

- **Note**: A private text entry owned by one personal user, created with a stable client-generated ID after its title or body has content.
- **Local-first**: Local device storage is the source of truth before any account or network connection exists.
- **Saved**: A note state written to local device storage after a short typing pause or editor exit.
- **Sync**: Optional backup and cross-device transfer after sign-in.
- **Outbox**: A local queue of note changes waiting to be synced after local save succeeds.
- **Tag**: A lightweight label used to group and filter notes.
- **Delete**: Permanent note removal after confirmation, with short undo and synced tombstone.

Reference docs:

- `CONTEXT.md`
- `docs/adr/0001-indexeddb-as-local-source-of-truth.md`
- `docs/adr/0002-last-write-wins-sync-conflicts.md`

## 7. User flows

### 7.1 First run

1. User opens Leafnote.
2. User sees Welcome screen.
3. User can choose:
   - Get Started: enter notes list without account.
   - Sign in to sync: authenticate with Google or Apple.
4. App must never require sign-in to create local notes.

### 7.2 Create note

1. User taps floating New Note button.
2. Editor opens with empty title and body.
3. Note is created only after title or body has non-whitespace content.
4. Empty new note is discarded silently when user exits.
5. Local save happens after 3 seconds of no typing and immediately on blur/back navigation.

### 7.3 Edit note

1. User opens existing note.
2. User edits title, body, and tags.
3. Changes save locally after debounce or editor exit.
4. UI must not wait for network.
5. Sync status may show Local only, Syncing, or Synced.

### 7.4 Delete note

1. User swipes note left or triggers delete action.
2. App shows confirmation.
3. On confirm, note disappears from list.
4. Toast shows short Undo action.
5. If undo expires, delete is permanent.
6. Delete creates a tombstone for sync so other devices do not resurrect the note.

### 7.5 Search notes

1. User opens Search.
2. User types query.
3. Results update immediately from local notes.
4. Search matches title and body only.
5. Tags are not part of search matching in MVP.

### 7.6 Filter by tag

1. User taps tag chip on notes list.
2. List shows notes with that tag.
3. All chip clears filter.
4. Tags are flat labels only.

### 7.7 Sign in and sync

1. User chooses Sign in to sync.
2. User signs in with Google or Apple.
3. Local notes remain available.
4. Sync starts after local writes are safely saved.
5. UI reads local storage first and never waits for backend sync.

### 7.8 Sign out

1. User signs out from Settings.
2. Sync is disabled.
3. Local notes stay on the device.
4. App explains that notes remain locally.

## 8. Screens and requirements

### 8.1 Welcome screen

Purpose: explain local-first use and optional sync.

Must include:

- Leafnote logo
- App name
- Short calm product copy
- Primary CTA: Get Started
- Secondary CTA: Sign in to sync
- Privacy/local-first note

Acceptance criteria:

- Get Started routes to Notes List.
- Sign in routes to Sign-in screen.
- Copy makes clear notes can be used before sign-in.

### 8.2 Sign-in screen

Purpose: optional account step for sync.

Must include:

- Back button
- Leafnote logo
- “Sign in to sync” heading
- Google OAuth button
- Apple OAuth button
- Privacy note

Acceptance criteria:

- No email/password fields in MVP.
- Sign-in is never required for local note use.
- Loading state appears while OAuth action is running.
- Copy must not promise end-to-end encryption.

### 8.3 Notes List screen

Purpose: quickly access notes.

Must include:

- Sticky top bar
- Leafnote logo/name
- Sync indicator
- Search button
- Settings button
- Tag filter row
- New Note floating action button
- Notes sorted by newest update first
- Empty state for no notes

Each note card must show:

- Title or Untitled fallback
- Content preview
- Up to 3 tags
- Relative updated time
- Pending/local status if relevant

Acceptance criteria:

- Notes load from local storage.
- List updates immediately after local edits/deletes.
- Tag filter All active state uses green background and white text.
- Swipe left reveals delete affordance on mobile.

### 8.4 Note Editor screen

Purpose: distraction-free plain text writing.

Must include:

- Back button
- Sync status indicator
- Tag button with selected tag count
- Title input
- Body textarea
- Bottom toolbar placeholder
- Tag selector sheet

Acceptance criteria:

- Title and body are plain text.
- Rich formatting buttons are non-functional placeholders for MVP unless removed from final UI.
- Autosave runs after 3 seconds of no typing.
- Blur/back navigation saves immediately.
- Empty new note is discarded silently.
- Existing note can be cleared and remains until deleted.

### 8.5 Tag selector

Purpose: assign lightweight labels to notes.

Must include:

- Default tags: personal, work, ideas, journal, recipes, books
- Custom tag input
- Add custom tag button
- Selected tag badges
- Remove selected tag action

Acceptance criteria:

- Notes can have multiple tags.
- Custom tags persist locally.
- No tag management screen in MVP.
- No nested tags, colors, rename, or delete workflow.

### 8.6 Search screen

Purpose: find notes instantly.

Must include:

- Back button
- Search input
- Empty prompt when query is blank
- No-results state
- Result count
- Note result cards

Acceptance criteria:

- Search reads local notes only.
- Search matches note title and body.
- Results update as user types.
- No advanced filters in MVP.

### 8.7 Settings screen

Purpose: basic account, sync, app, and privacy info.

Must include:

- Back button
- Account section
- Sign in CTA when signed out
- Email and sign out when signed in
- Sync status
- App version
- Privacy note

Acceptance criteria:

- Sign-out disables sync but keeps local notes.
- Settings does not include advanced preferences in MVP.
- Privacy copy says notes are private and stored securely, not end-to-end encrypted.

## 9. Local persistence requirements

Leafnote must use IndexedDB as local source of truth.

Required local stores:

- Notes
- Tags
- Outbox entries
- Tombstones or delete records
- Sync metadata

Note fields:

- `id`: stable client-generated ID
- `title`
- `content`
- `tags`
- `createdAt`
- `updatedAt`
- `syncStatus`

Local save behavior:

- Save after 3 seconds of no typing.
- Save immediately on blur/editor exit.
- Write to IndexedDB before adding sync work.
- UI must reflect local saved state without waiting for backend.

## 10. Sync requirements

Sync is optional and only active after sign-in.

Sync states:

- Local only: note exists locally and is not backed up.
- Syncing: app is sending local changes or receiving remote changes.
- Synced: local changes are backed up.

Outbox behavior:

- Every local create/update/delete adds ordered work to Outbox after IndexedDB write succeeds.
- Sync sends Outbox entries in local write order.
- Failed sync keeps Outbox entries for retry.
- Sync must not block local actions.

Conflict behavior:

- MVP uses last-write-wins based on update time.
- No conflict UI in MVP.
- Delete sync uses tombstones to prevent deleted notes from reappearing from another device.

## 11. Authentication requirements

MVP auth supports OAuth only:

- Google
- Apple

Auth is used only for sync identity. Leafnote must not gate local note usage behind auth.

Account data in MVP:

- Email
- OAuth provider

No profile, avatar, username, subscription, team, or workspace in MVP.

## 12. Privacy and security requirements

MVP privacy stance:

- Notes are personal and private by product design.
- Local-first means notes stay usable on the device without account setup.
- Sync uses HTTPS and provider-backed authentication.
- Do not claim end-to-end encryption unless implemented.

Required copy style:

- Use “private” and “stored securely.”
- Avoid “encrypted” unless referring to a specific implemented layer.

## 13. UX principles

- Mobile-first.
- Calm, neutral visual design.
- Typography and whitespace over heavy UI chrome.
- No flashy gradients or heavy shadows.
- No spinners for local actions.
- Subtle sync indicators.
- Writing stays primary.
- Offline/local use must feel normal, not degraded.

## 14. Visual style

- Warm neutral background.
- Sage/leaf green primary color.
- Soft rounded corners.
- Minimal borders.
- Serif typography for writing content.
- Sans-serif UI text.
- Light and dark mode ready.

## 15. MVP acceptance checklist

A build is MVP-complete when:

- User can open app and create notes without account.
- Notes persist after refresh/browser restart.
- Notes autosave locally after 3 seconds idle and on blur/back.
- Notes list sorts by newest update first.
- User can open, edit, tag, search, and delete notes locally.
- Empty new notes are discarded silently.
- Delete has confirmation and undo window.
- Deleted notes create tombstones for sync.
- Tags can be selected, added, removed from notes, and used as filters.
- Search matches title/body only.
- Settings reflects signed-in/signed-out state.
- Sign-in uses Google/Apple only.
- Sign-out keeps local notes.
- Sync uses Outbox and does not block local actions.
- Conflict behavior is last-write-wins.
- UI copy avoids end-to-end encryption claims.

## 16. Post-MVP candidates

Possible later features:

- Real rich text formatting: bold, headings, checklist
- Sync now action
- Export notes
- Remove all local data
- Theme toggle
- PWA install prompt
- Search result highlighting
- Note pinning
- Trash/recovery
- End-to-end encryption
- Conflict recovery UI
- Native mobile wrappers
