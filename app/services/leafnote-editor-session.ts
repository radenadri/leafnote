import type { Note } from '~/types/note'
import type { LeafnoteLocalStore } from './leafnote-local-store'

const AUTOSAVE_DELAY_MS = 3000

export interface LeafnoteEditorSessionOptions {
  store: LeafnoteLocalStore
  noteId: string
  initialNote?: Note
  now?: () => Date
}

export interface LeafnoteEditorSession {
  setTitle: (title: string) => void
  setContent: (content: string) => void
  setTags: (tags: string[]) => void
  saveNow: () => Promise<void>
  dispose: () => void
}

export function createLeafnoteEditorSession(options: LeafnoteEditorSessionOptions): LeafnoteEditorSession {
  const now = options.now ?? (() => new Date())
  const createdAt = options.initialNote?.createdAt ?? now()
  let title = options.initialNote?.title ?? ''
  let content = options.initialNote?.content ?? ''
  let tags = options.initialNote?.tags ? [...options.initialNote.tags] : []
  let autosaveTimer: ReturnType<typeof setTimeout> | undefined

  function scheduleSave() {
    if (autosaveTimer) clearTimeout(autosaveTimer)
    autosaveTimer = setTimeout(() => {
      void saveNow()
    }, AUTOSAVE_DELAY_MS)
  }

  async function saveNow() {
    if (autosaveTimer) {
      clearTimeout(autosaveTimer)
      autosaveTimer = undefined
    }

    const updatedAt = now()
    await options.store.saveNote({
      id: options.initialNote?.id ?? options.noteId,
      title,
      content,
      tags,
      createdAt,
      updatedAt,
      syncStatus: 'local'
    }, { allowEmpty: Boolean(options.initialNote) })
  }

  return {
    setTitle(nextTitle) {
      title = nextTitle
      scheduleSave()
    },

    setContent(nextContent) {
      content = nextContent
      scheduleSave()
    },

    setTags(nextTags) {
      tags = [...nextTags]
      scheduleSave()
    },

    saveNow,

    dispose() {
      if (autosaveTimer) clearTimeout(autosaveTimer)
    }
  }
}
