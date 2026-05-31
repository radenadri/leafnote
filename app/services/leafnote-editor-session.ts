import type { Note } from '~/types/note'
import type { LeafnoteStatus } from './leafnote-status'
import type { LeafnoteLocalStore } from './leafnote-local-store'

const AUTOSAVE_DELAY_MS = 3000

export interface LeafnoteEditorSessionOptions {
  store: LeafnoteLocalStore
  noteId: string
  initialNote?: Note
  now?: () => Date
}

export interface LeafnoteEditorSession {
  note: { readonly value: Note }
  status: { readonly value: LeafnoteStatus }
  setTitle: (title: string) => void
  setContent: (content: string) => void
  setTags: (tags: string[]) => void
  saveNow: () => Promise<void>
  dispose: () => void
}

export function createLeafnoteEditorSession(options: LeafnoteEditorSessionOptions): LeafnoteEditorSession {
  const now = options.now ?? (() => new Date())
  const noteId = options.initialNote?.id ?? options.noteId
  const createdAt = options.initialNote?.createdAt ?? now()

  let currentNote: Note = {
    id: noteId,
    title: options.initialNote?.title ?? '',
    content: options.initialNote?.content ?? '',
    tags: options.initialNote?.tags ? [...options.initialNote.tags] : [],
    createdAt,
    updatedAt: now(),
    syncStatus: 'local'
  }

  let currentStatus: LeafnoteStatus = 'local-only'
  const note = {
    get value(): Note {
      return currentNote
    }
  }
  const status = {
    get value(): LeafnoteStatus {
      return currentStatus
    }
  }
  let autosaveTimer: ReturnType<typeof setTimeout> | undefined

  function scheduleSave() {
    if (autosaveTimer) clearTimeout(autosaveTimer)
    currentStatus = 'saving'
    autosaveTimer = setTimeout(() => {
      void saveNow()
    }, AUTOSAVE_DELAY_MS)
  }

  async function saveNow() {
    if (autosaveTimer) {
      clearTimeout(autosaveTimer)
      autosaveTimer = undefined
    }

    const noteToSave = {
      ...note.value,
      updatedAt: now()
    }
    await options.store.saveNote(noteToSave, { allowEmpty: Boolean(options.initialNote) })
    currentStatus = 'saved'
  }

  return {
    note,
    status,

    setTitle(nextTitle) {
      currentNote = { ...currentNote, title: nextTitle }
      scheduleSave()
    },

    setContent(nextContent) {
      currentNote = { ...currentNote, content: nextContent }
      scheduleSave()
    },

    setTags(nextTags) {
      currentNote = { ...currentNote, tags: [...nextTags] }
      scheduleSave()
    },

    saveNow,

    dispose() {
      if (autosaveTimer) clearTimeout(autosaveTimer)
    }
  }
}
