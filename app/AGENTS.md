# Leafnote App

## Package Identity

`app/` contains the Nuxt 4 frontend for Leafnote. It owns routes, Vue components, local state facade, mock data, types, and styling.
Primary tech: Vue 3 SFCs, Nuxt file routing, Nuxt UI, Tailwind CSS 4, TypeScript.

## Setup & Run

From repo root:

```bash
pnpm dev
pnpm typecheck
pnpm lint
pnpm build
```

No database setup exists yet. Notes currently come from `app/data/mockNotes.ts`; custom tags use browser `localStorage`.

## Patterns & Conventions

- Use `<script setup lang="ts">` for all Vue files.
- Keep route-level orchestration in `app/pages/**`; move reusable UI to `app/components/leafnote/**`.
- Use `useLeafnote()` as app state facade. Do not read/write `mockNotes` directly from pages.
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
- Mock notes: `app/data/mockNotes.ts`
- Notes list route: `app/pages/notes/index.vue`
- Editor route: `app/pages/notes/[id].vue`
- Search route: `app/pages/search.vue`
- Settings route: `app/pages/settings.vue`
- Sign-in route: `app/pages/signin.vue`

## JIT Index Hints

```bash
find app/pages app/components/leafnote -type f | sort
rg -n "defineProps|defineEmits|computed\(|watch\(|onMounted" app
rg -n "useLeafnote\(|mockNotes|localStorage|CUSTOM_TAGS_KEY" app
rg -n "UModal|USlideover|useToast|USeparator|UIcon" app
rg -n "bg-leaf|text-sync|safe-top|safe-bottom|focus-ring" app
```

## Common Gotchas

- `useLeafnote()` currently does not persist Notes. Do not assume IndexedDB exists yet.
- Editor refs in `app/pages/notes/[id].vue` currently do not save back to state.
- `SyncStatus` uses prototype values: `idle | syncing | offline`; PRD wants future local-first wording.
- `app/app.config.ts` has `i-ph-*` icon aliases, but package deps include lucide/simple-icons only.
- `.nuxt/` and `.output/` are generated. Do not edit them.

## Pre-PR Checks

```bash
pnpm typecheck && pnpm lint && pnpm build
```
