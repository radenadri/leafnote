# Leafnote

## Project Snapshot

Leafnote is a simple Nuxt 4 mobile web app for personal, local-first note taking.
Tech stack: Vue 3 SFCs, TypeScript, Nuxt UI, Tailwind CSS 4, pnpm.
Current app is frontend-only. Notes are prototype state seeded from mock data; planned MVP persistence is IndexedDB.
For source work, read nearest sub-file: `app/AGENTS.md` or `docs/AGENTS.md`.

## Root Setup Commands

```bash
pnpm install
pnpm dev
pnpm typecheck
pnpm lint
pnpm build
pnpm preview
```

## Universal Conventions

- Keep changes local-first: local app behavior must not depend on auth/network.
- Use domain terms from `CONTEXT.md`: Note, Tag, Saved, Sync, Outbox, Tombstone.
- Do not add backend, OAuth, database, or sync claims unless implementing that slice.
- Prefer small vertical slices from `docs/issues/0001-leafnote-mvp-issues.md`.
- Keep copy calm, minimal, and privacy-safe. Do not claim end-to-end encryption.
- Use TypeScript and Vue Composition API with `<script setup lang="ts">`.

## Security & Secrets

- Never commit tokens, OAuth secrets, API keys, or real user notes.
- No `.env` contract is currently defined. If added, document variables before use.
- Treat note content as private user data. Avoid logging note bodies.
- Do not store real notes in fixtures or docs.

## JIT Index

### Project Structure

- App source: `app/` -> see `app/AGENTS.md`
- Product/domain docs: `docs/`, `CONTEXT.md`, `ARCHITECTURE.md` -> see `docs/AGENTS.md`
- Build config: `nuxt.config.ts`, `package.json`, `tsconfig.json`, `eslint.config.mjs`
- CI: `.github/workflows/ci.yml`

### Quick Find Commands

```bash
find app -maxdepth 4 -type f | sort
rg -n "useLeafnote|Note|Tag|Sync|Outbox|Tombstone" app docs CONTEXT.md
rg -n "navigateTo\(|definePageMeta|useSeoMeta|useHead" app
rg -n "TODO|FIXME|console\.log|mockNotes|localStorage" app docs
```

## Definition of Done

Before PR or handoff:

```bash
pnpm typecheck && pnpm lint && pnpm build
```

Also update docs when behavior changes: `ARCHITECTURE.md`, `CONTEXT.md`, PRD/issues if scope changes.

<!-- code-review-graph MCP tools -->

## MCP Tools: code-review-graph

**IMPORTANT: This project has a knowledge graph. ALWAYS use the
code-review-graph MCP tools BEFORE using Grep/Glob/Read to explore
the codebase.** The graph is faster, cheaper (fewer tokens), and gives
you structural context (callers, dependents, test coverage) that file
scanning cannot.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes` or `query_graph` instead of Grep
- **Understanding impact**: `get_impact_radius` instead of manually tracing imports
- **Code review**: `detect_changes` + `get_review_context` instead of reading entire files
- **Finding relationships**: `query_graph` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview` + `list_communities`

Fall back to Grep/Glob/Read **only** when the graph doesn't cover what you need.

### Key Tools

| Tool                        | Use when                                               |
| --------------------------- | ------------------------------------------------------ |
| `detect_changes`            | Reviewing code changes — gives risk-scored analysis    |
| `get_review_context`        | Need source snippets for review — token-efficient      |
| `get_impact_radius`         | Understanding blast radius of a change                 |
| `get_affected_flows`        | Finding which execution paths are impacted             |
| `query_graph`               | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes`     | Finding functions/classes by name or keyword           |
| `get_architecture_overview` | Understanding high-level codebase structure            |
| `refactor_tool`             | Planning renames, finding dead code                    |

### Workflow

1. The graph auto-updates on file changes (via hooks).
2. Use `detect_changes` for code review.
3. Use `get_affected_flows` to understand impact.
4. Use `query_graph` pattern="tests_for" to check coverage.
