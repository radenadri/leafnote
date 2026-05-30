# Leafnote App

## Package Identity

`app/` contains the Nuxt 4 frontend for Leafnote. It owns routes, Vue components, the IndexedDB-backed local state facade, first-run seed data, domain types, and styling.
Primary tech: Vue 3 SFCs, Nuxt file routing, Nuxt UI, Tailwind CSS 4, TypeScript, Vitest, fake-indexeddb.

## Setup & Run

From repo root:

```bash
pnpm dev
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

Notes persist in browser IndexedDB through `app/services/leafnote-local-store.ts`. `app/data/mockNotes.ts` is seed data only when the local Notes store is empty. Tombstones and Outbox entries also live in IndexedDB. Tags attached to Notes persist with Notes; unattached custom Tags are session-only until attached.

## Patterns & Conventions

- Use `<script setup lang="ts">` for all Vue files.
- Keep route-level orchestration in `app/pages/**`; move reusable UI to `app/components/leafnote/**`.
- Use `useLeafnote()` as app state facade. Do not read/write IndexedDB or `mockNotes` directly from pages.
- For route navigation, existing pattern is `navigateTo('/path')` in page/component handlers.
- For icons, use local installed collections: `i-lucide-*` or `i-simple-icons-*`.
- For overlays/toasts, use Nuxt UI patterns already in app:
  - Toast: `app/pages/notes/index.vue`
  - Modal: `app/components/leafnote/SwipeableNoteCard.vue`
  - Slideover: `app/pages/notes/[id].vue`
- Keep Note cards consistent with `app/components/leafnote/NoteCard.vue` and `SwipeableNoteCard.vue`.
- Keep Tag behavior flat/lightweight. Copy `TagFilter.vue`, `TagPicker.vue`, `TagBadge.vue`; do not add folders/notebooks.
- Styling lives in `app/assets/css/main.css`. Use existing tokens/classes like `bg-background`, `text-foreground`, `bg-leaf-500`.
- Do not claim real Sync/auth. Current sign-in is placeholder in `app/pages/signin.vue`.
- Do not add rich text behavior unless implementing post-MVP editor slice. Toolbar is placeholder now.

## Key Files

- Root app/provider/SEO: `app/app.vue`
- Nuxt UI config/icons: `app/app.config.ts`
- Leafnote theme tokens: `app/assets/css/main.css`
- State facade: `app/composables/useLeafnote.ts`
- Time helper: `app/composables/formatTimeAgo.ts`
- Domain types/constants: `app/types/note.ts`
- Local persistence: `app/services/leafnote-local-store.ts`
- Editor session/autosave tests seam: `app/services/leafnote-editor-session.ts`
- Local-first regression tests: `app/services/leafnote-local-regression.test.ts`
- Seed notes: `app/data/mockNotes.ts`
- Notes list route: `app/pages/notes/index.vue`
- Editor route: `app/pages/notes/[id].vue`
- Search route: `app/pages/search.vue`
- Settings route: `app/pages/settings.vue`
- Sign-in route: `app/pages/signin.vue`

## JIT Index Hints

```bash
find app/pages app/components/leafnote -type f | sort
rg -n "defineProps|defineEmits|computed\(|watch\(|onMounted" app
rg -n "useLeafnote\(|createLeafnoteLocalStore|indexedDB|Outbox|Tombstone|normalizeTag|getAvailableTags" app
rg -n "UModal|USlideover|useToast|USeparator|UIcon" app
rg -n "bg-leaf|text-sync|safe-top|safe-bottom|focus-ring" app
```

## Common Gotchas

- `useLeafnote()` persists Notes through IndexedDB; keep pages behind this facade.
- Editor refs in `app/pages/notes/[id].vue` save locally after 3 seconds idle and on blur/back/unmount.
- Use `LeafnoteStatus` values from `app/services/leafnote-status.ts`; avoid showing signed-out local use as Offline.
- `app/app.config.ts` has `i-ph-*` icon aliases, but package deps include lucide/simple-icons only.
- `.nuxt/` and `.output/` are generated. Do not edit them.

## Pre-PR Checks

```bash
pnpm test && pnpm typecheck && pnpm lint && pnpm build
```
