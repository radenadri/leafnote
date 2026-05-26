import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createLeafnoteEditorSession } from './leafnote-editor-session'
import type { LeafnoteLocalStore } from './leafnote-local-store'
import type { Note } from '~/types/note'

function createMemoryStore(): LeafnoteLocalStore {
  const notes: Note[] = []

  return {
    async saveNote(note, options = {}) {
      if (!options.allowEmpty && !note.title.trim() && !note.content.trim()) return

      const index = notes.findIndex(item => item.id === note.id)
      if (index >= 0) {
        notes[index] = note
      } else {
        notes.push(note)
      }
    },

    async listNotes() {
      return [...notes].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    },

    async seedNotesIfEmpty(seedNotes) {
      if (notes.length > 0) return
      notes.push(...seedNotes)
    }
  }
}

describe('Leafnote Editor autosave', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T09:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('saves a new Note after 3 seconds without typing', async () => {
    const store = createMemoryStore()
    const session = createLeafnoteEditorSession({
      store,
      noteId: 'new-note-id',
      now: () => new Date('2026-01-01T09:00:00.000Z')
    })

    session.setTitle('Draft title')
    session.setContent('Draft body')

    await vi.advanceTimersByTimeAsync(2999)
    expect(await store.listNotes()).toEqual([])

    await vi.advanceTimersByTimeAsync(1)

    expect(await store.listNotes()).toEqual([
      {
        id: 'new-note-id',
        title: 'Draft title',
        content: 'Draft body',
        tags: [],
        createdAt: new Date('2026-01-01T09:00:00.000Z'),
        updatedAt: new Date('2026-01-01T09:00:00.000Z'),
        syncStatus: 'local'
      }
    ])

    session.dispose()
  })

  it('saves immediately when the user exits the Editor', async () => {
    const store = createMemoryStore()
    const session = createLeafnoteEditorSession({
      store,
      noteId: 'exit-note-id',
      now: () => new Date('2026-01-01T09:00:00.000Z')
    })

    session.setTitle('Exit title')
    await session.saveNow()

    expect(await store.listNotes()).toEqual([
      {
        id: 'exit-note-id',
        title: 'Exit title',
        content: '',
        tags: [],
        createdAt: new Date('2026-01-01T09:00:00.000Z'),
        updatedAt: new Date('2026-01-01T09:00:00.000Z'),
        syncStatus: 'local'
      }
    ])

    await vi.advanceTimersByTimeAsync(3000)
    expect(await store.listNotes()).toHaveLength(1)

    session.dispose()
  })

  it('keeps an existing Note when the user clears it', async () => {
    const store = createMemoryStore()
    const existingNote: Note = {
      id: 'existing-note',
      title: 'Original',
      content: 'Original body',
      tags: ['journal'],
      createdAt: new Date('2026-01-01T08:00:00.000Z'),
      updatedAt: new Date('2026-01-01T08:00:00.000Z'),
      syncStatus: 'local'
    }
    await store.saveNote(existingNote)

    const session = createLeafnoteEditorSession({
      store,
      noteId: 'ignored-for-existing',
      initialNote: existingNote,
      now: () => new Date('2026-01-01T09:00:00.000Z')
    })

    session.setTitle('')
    session.setContent('')
    await session.saveNow()

    expect(await store.listNotes()).toEqual([
      {
        id: 'existing-note',
        title: '',
        content: '',
        tags: ['journal'],
        createdAt: new Date('2026-01-01T08:00:00.000Z'),
        updatedAt: new Date('2026-01-01T09:00:00.000Z'),
        syncStatus: 'local'
      }
    ])

    session.dispose()
  })
})
