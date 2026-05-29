import { beforeEach, describe, expect, it } from 'vitest'
import { indexedDB } from 'fake-indexeddb'
import { createLeafnoteLocalStore } from './leafnote-local-store'

describe('Leafnote local Note store', () => {
  beforeEach(async () => {
    globalThis.indexedDB = indexedDB
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase('leafnote-test')
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
      request.onblocked = () => resolve()
    })
  })

  it('persists a Note and loads it after reopening the store', async () => {
    const firstStore = createLeafnoteLocalStore({ dbName: 'leafnote-test' })

    await firstStore.saveNote({
      id: 'note-1',
      title: 'Morning Thoughts',
      content: 'Quiet mind, better ideas.',
      tags: ['journal'],
      createdAt: new Date('2026-01-01T08:00:00.000Z'),
      updatedAt: new Date('2026-01-01T08:05:00.000Z'),
      syncStatus: 'local'
    })

    const secondStore = createLeafnoteLocalStore({ dbName: 'leafnote-test' })
    const notes = await secondStore.listNotes()

    expect(notes).toEqual([
      {
        id: 'note-1',
        title: 'Morning Thoughts',
        content: 'Quiet mind, better ideas.',
        tags: ['journal'],
        createdAt: new Date('2026-01-01T08:00:00.000Z'),
        updatedAt: new Date('2026-01-01T08:05:00.000Z'),
        syncStatus: 'local'
      }
    ])
  })

  it('does not persist a new empty Note', async () => {
    const store = createLeafnoteLocalStore({ dbName: 'leafnote-test' })

    await store.saveNote({
      id: 'empty-note',
      title: '   ',
      content: '\n\t ',
      tags: [],
      createdAt: new Date('2026-01-01T08:00:00.000Z'),
      updatedAt: new Date('2026-01-01T08:00:00.000Z'),
      syncStatus: 'local'
    })

    expect(await store.listNotes()).toEqual([])
  })

  it('deletes a Note and records a Tombstone', async () => {
    const store = createLeafnoteLocalStore({ dbName: 'leafnote-test' })

    await store.saveNote({
      id: 'deleted-note',
      title: 'Delete me',
      content: 'This note should be removed.',
      tags: [],
      createdAt: new Date('2026-01-01T08:00:00.000Z'),
      updatedAt: new Date('2026-01-01T08:00:00.000Z'),
      syncStatus: 'local'
    })

    await store.deleteNote('deleted-note', new Date('2026-01-01T09:00:00.000Z'))

    expect(await store.listNotes()).toEqual([])
    expect(await store.listTombstones()).toEqual([
      {
        noteId: 'deleted-note',
        deletedAt: new Date('2026-01-01T09:00:00.000Z')
      }
    ])
  })

  it('restores a deleted Note and removes its Tombstone', async () => {
    const store = createLeafnoteLocalStore({ dbName: 'leafnote-test' })
    const note = {
      id: 'restored-note',
      title: 'Restore me',
      content: 'Undo should bring this back.',
      tags: [],
      createdAt: new Date('2026-01-01T08:00:00.000Z'),
      updatedAt: new Date('2026-01-01T09:00:00.000Z'),
      syncStatus: 'local' as const
    }

    await store.saveNote(note)
    await store.deleteNote(note.id, new Date('2026-01-01T10:00:00.000Z'))
    await store.restoreNote(note)

    expect(await store.listNotes()).toEqual([note])
    expect(await store.listTombstones()).toEqual([])
  })

  it('saves Notes whose tags come from Vue reactive state', async () => {
    const store = createLeafnoteLocalStore({ dbName: 'leafnote-test' })
    const tags = new Proxy(['journal'], {})

    await store.saveNote({
      id: 'reactive-tags-note',
      title: 'Reactive Tags',
      content: 'Tags come from a Vue ref in the Editor.',
      tags,
      createdAt: new Date('2026-01-01T08:00:00.000Z'),
      updatedAt: new Date('2026-01-01T08:00:00.000Z'),
      syncStatus: 'local'
    })

    expect(await store.listNotes()).toEqual([
      {
        id: 'reactive-tags-note',
        title: 'Reactive Tags',
        content: 'Tags come from a Vue ref in the Editor.',
        tags: ['journal'],
        createdAt: new Date('2026-01-01T08:00:00.000Z'),
        updatedAt: new Date('2026-01-01T08:00:00.000Z'),
        syncStatus: 'local'
      }
    ])
  })

  it('seeds prototype Notes only when the store is empty', async () => {
    const store = createLeafnoteLocalStore({ dbName: 'leafnote-test' })

    await store.seedNotesIfEmpty([
      {
        id: 'seed-note',
        title: 'Seed Note',
        content: 'Visible on first launch.',
        tags: ['ideas'],
        createdAt: new Date('2026-01-01T08:00:00.000Z'),
        updatedAt: new Date('2026-01-01T08:00:00.000Z'),
        syncStatus: 'local'
      }
    ])

    await store.seedNotesIfEmpty([
      {
        id: 'second-seed',
        title: 'Second Seed',
        content: 'Should not overwrite existing local data.',
        tags: [],
        createdAt: new Date('2026-01-02T08:00:00.000Z'),
        updatedAt: new Date('2026-01-02T08:00:00.000Z'),
        syncStatus: 'local'
      }
    ])

    expect(await store.listNotes()).toEqual([
      {
        id: 'seed-note',
        title: 'Seed Note',
        content: 'Visible on first launch.',
        tags: ['ideas'],
        createdAt: new Date('2026-01-01T08:00:00.000Z'),
        updatedAt: new Date('2026-01-01T08:00:00.000Z'),
        syncStatus: 'local'
      }
    ])
  })
})
