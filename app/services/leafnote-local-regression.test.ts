import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { indexedDB } from 'fake-indexeddb'
import { createLeafnoteEditorSession } from './leafnote-editor-session'
import { createLeafnoteLocalStore } from './leafnote-local-store'
import { getAvailableTags } from './leafnote-tags'
import { searchNotes } from './leafnote-search'
import type { Note } from '../types/note'

const dbName = 'leafnote-regression-test'

function note(overrides: Partial<Note>): Note {
  return {
    id: 'note-1',
    title: 'Untitled',
    content: '',
    tags: [],
    createdAt: new Date('2026-01-01T08:00:00.000Z'),
    updatedAt: new Date('2026-01-01T08:00:00.000Z'),
    syncStatus: 'local',
    ...overrides
  }
}

async function resetDb() {
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(dbName)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
    request.onblocked = () => resolve()
  })
}

describe('Leafnote local-first MVP regression', () => {
  beforeEach(async () => {
    globalThis.indexedDB = indexedDB
    await resetDb()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('keeps a saved Note available after reopening the local store', async () => {
    const firstStore = createLeafnoteLocalStore({ dbName })
    await firstStore.saveNote(note({
      id: 'persisted-note',
      title: 'Local note',
      content: 'Saved on this device.'
    }))

    const reopenedStore = createLeafnoteLocalStore({ dbName })

    expect(await reopenedStore.listNotes()).toEqual([
      note({
        id: 'persisted-note',
        title: 'Local note',
        content: 'Saved on this device.'
      })
    ])
  })

  it('autosaves a draft after 3 seconds idle', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    vi.setSystemTime(new Date('2026-01-01T09:00:00.000Z'))
    const store = createLeafnoteLocalStore({ dbName })
    const session = createLeafnoteEditorSession({
      store,
      noteId: 'autosaved-note',
      now: () => new Date('2026-01-01T09:00:00.000Z')
    })

    session.setTitle('Autosaved draft')
    session.setContent('Saved after typing stopped.')

    await vi.advanceTimersByTimeAsync(2999)
    expect(await store.listNotes()).toEqual([])

    await vi.advanceTimersByTimeAsync(1)

    expect(await store.listNotes()).toEqual([
      note({
        id: 'autosaved-note',
        title: 'Autosaved draft',
        content: 'Saved after typing stopped.',
        createdAt: new Date('2026-01-01T09:00:00.000Z'),
        updatedAt: new Date('2026-01-01T09:00:00.000Z')
      })
    ])
    session.dispose()
  })

  it('saves immediately when leaving the Editor', async () => {
    const store = createLeafnoteLocalStore({ dbName })
    const session = createLeafnoteEditorSession({
      store,
      noteId: 'back-saved-note',
      now: () => new Date('2026-01-01T09:00:00.000Z')
    })

    session.setTitle('Saved on back')
    await session.saveNow()

    expect(await store.listNotes()).toEqual([
      note({
        id: 'back-saved-note',
        title: 'Saved on back',
        createdAt: new Date('2026-01-01T09:00:00.000Z'),
        updatedAt: new Date('2026-01-01T09:00:00.000Z')
      })
    ])
    session.dispose()
  })

  it('discards an empty new Note', async () => {
    const store = createLeafnoteLocalStore({ dbName })
    const session = createLeafnoteEditorSession({
      store,
      noteId: 'empty-note',
      now: () => new Date('2026-01-01T09:00:00.000Z')
    })

    session.setTitle('   ')
    session.setContent('\n\t')
    await session.saveNow()

    expect(await store.listNotes()).toEqual([])
    session.dispose()
  })

  it('restores a deleted Note when the user chooses Undo', async () => {
    const store = createLeafnoteLocalStore({ dbName })
    const deletedNote = note({
      id: 'undo-note',
      title: 'Undo me',
      content: 'Restore this local Note.'
    })

    await store.saveNote(deletedNote)
    await store.deleteNote(deletedNote.id, new Date('2026-01-01T10:00:00.000Z'))
    await store.restoreNote(deletedNote)

    expect(await store.listNotes()).toEqual([deletedNote])
    expect(await store.listTombstones()).toEqual([])
  })

  it('writes a Tombstone after Delete', async () => {
    const store = createLeafnoteLocalStore({ dbName })
    await store.saveNote(note({ id: 'tombstone-note', title: 'Delete me' }))

    await store.deleteNote('tombstone-note', new Date('2026-01-01T10:00:00.000Z'))

    expect(await store.listNotes()).toEqual([])
    expect(await store.listTombstones()).toEqual([
      {
        noteId: 'tombstone-note',
        deletedAt: new Date('2026-01-01T10:00:00.000Z')
      }
    ])
  })

  it('filters local Notes by Tag', () => {
    const taggedNotes = [
      note({ id: 'journal-note', title: 'Journal', tags: ['journal'] }),
      note({ id: 'recipe-note', title: 'Recipe', tags: ['recipes'] })
    ]

    expect(taggedNotes.filter(item => item.tags.includes('journal'))).toEqual([
      taggedNotes[0]
    ])
    expect(getAvailableTags({ notes: taggedNotes, customTags: [] })).toContain('journal')
  })

  it('searches local Notes by title and body only', () => {
    const titleMatch = note({ id: 'title-match', title: 'Lemon pasta', content: 'Dinner plan', tags: [] })
    const bodyMatch = note({ id: 'body-match', title: 'Recipe', content: 'Add lemon zest.', tags: [] })
    const tagOnlyMatch = note({ id: 'tag-only-match', title: 'Groceries', content: 'Buy oranges.', tags: ['lemon'] })

    expect(searchNotes([titleMatch, bodyMatch, tagOnlyMatch], 'lemon')).toEqual([
      titleMatch,
      bodyMatch
    ])
  })
})
