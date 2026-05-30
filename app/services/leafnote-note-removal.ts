import type { LeafnoteLocalStore } from './leafnote-local-store'
import type { Note } from '../types/note'

export interface LeafnoteNoteRemovalOptions {
  store: LeafnoteLocalStore
  undoWindowMs?: number
}

export interface LeafnoteNoteRemoval {
  undo: {
    visible: { readonly value: boolean }
    note: { readonly value: Note | null }
  }
  confirmDelete: (note: Note) => Promise<void>
  undoDelete: () => Promise<void>
  dispose: () => void
}

export function createLeafnoteNoteRemoval(options: LeafnoteNoteRemovalOptions): LeafnoteNoteRemoval {
  const undoWindowMs = options.undoWindowMs ?? 8000
  let recentlyDeletedNote: Note | null = null
  let showUndo = false
  let undoTimer: ReturnType<typeof setTimeout> | undefined

  function clearUndoTimer() {
    if (undoTimer) {
      clearTimeout(undoTimer)
      undoTimer = undefined
    }
  }

  function clearUndo() {
    recentlyDeletedNote = null
    showUndo = false
    clearUndoTimer()
  }

  return {
    undo: {
      visible: {
        get value() {
          return showUndo
        }
      },
      note: {
        get value() {
          return recentlyDeletedNote
        }
      }
    },

    async confirmDelete(note) {
      recentlyDeletedNote = note
      showUndo = true
      await options.store.deleteNote(note.id)
      clearUndoTimer()
      undoTimer = setTimeout(() => {
        recentlyDeletedNote = null
        showUndo = false
        undoTimer = undefined
      }, undoWindowMs)
    },

    async undoDelete() {
      if (!recentlyDeletedNote) return

      const note = recentlyDeletedNote
      clearUndo()
      await options.store.restoreNote(note)
    },

    dispose() {
      clearUndoTimer()
    }
  }
}
