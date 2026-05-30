import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createLeafnoteNoteRemoval } from './leafnote-note-removal'
import type { LeafnoteLocalStore, OutboxEntry } from './leafnote-local-store'
import type { Note } from '../types/note'

function makeNote(overrides: Partial<Note> = {}): Note {
  return {
    id: 'note-1',
    title: 'Delete me',
    content: 'This note can be restored.',
    tags: [],
    createdAt: new Date('2026-01-01T08:00:00.000Z'),
    updatedAt: new Date('2026-01-01T09:00:00.000Z'),
    syncStatus: 'local',
    ...overrides
  }
}

function createMemoryStore(initialNotes: Note[] = []): LeafnoteLocalStore {
  const notes = [...initialNotes]
  const tombstones: Array<{ noteId: string, deletedAt: Date }> = []
  const outboxEntries: OutboxEntry[] = []

  return {
    async saveNote(note) {
      const index = notes.findIndex(item => item.id === note.id)
      if (index >= 0) notes[index] = note
      else notes.push(note)
    },
    async listNotes() {
      return [...notes]
    },
    async deleteNote(noteId, deletedAt = new Date()) {
      const index = notes.findIndex(item => item.id === noteId)
      if (index >= 0) notes.splice(index, 1)
      tombstones.push({ noteId, deletedAt })
      outboxEntries.push({
        id: `${outboxEntries.length + 1}`,
        sequence: outboxEntries.length + 1,
        operation: 'deleteNote',
        noteId,
        createdAt: deletedAt,
        processed: false
      })
    },
    async restoreNote(note) {
      notes.push(note)
      const index = tombstones.findIndex(item => item.noteId === note.id)
      if (index >= 0) tombstones.splice(index, 1)
    },
    async listTombstones() {
      return [...tombstones]
    },
    async listOutboxEntries() {
      return [...outboxEntries]
    },
    async seedNotesIfEmpty(seedNotes) {
      if (notes.length === 0) notes.push(...seedNotes)
    }
  }
}

describe('Leafnote Note removal', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('deletes a Note, shows Undo state, and restores within the Undo window', async () => {
    const deletedNote = makeNote()
    const store = createMemoryStore([deletedNote])
    const removal = createLeafnoteNoteRemoval({ store, undoWindowMs: 8000 })

    await removal.confirmDelete(deletedNote)

    expect(await store.listNotes()).toEqual([])
    expect(removal.undo.visible.value).toBe(true)
    expect(removal.undo.note.value).toEqual(deletedNote)
    expect(await store.listTombstones()).toEqual([{ noteId: deletedNote.id, deletedAt: expect.any(Date) }])
    expect(await store.listOutboxEntries()).toMatchObject([
      { operation: 'deleteNote', noteId: deletedNote.id, processed: false }
    ])

    await removal.undoDelete()

    expect(await store.listNotes()).toEqual([deletedNote])
    expect(await store.listTombstones()).toEqual([])
    expect(removal.undo.visible.value).toBe(false)
  })

  it('keeps a Note deleted after the Undo window expires', async () => {
    const deletedNote = makeNote({ id: 'expired-note' })
    const store = createMemoryStore([deletedNote])
    const removal = createLeafnoteNoteRemoval({ store, undoWindowMs: 8000 })

    await removal.confirmDelete(deletedNote)
    await vi.advanceTimersByTimeAsync(8000)

    expect(removal.undo.visible.value).toBe(false)
    expect(removal.undo.note.value).toBeNull()
    expect(await store.listNotes()).toEqual([])
    expect(await store.listTombstones()).toEqual([{ noteId: deletedNote.id, deletedAt: expect.any(Date) }])
  })
})
