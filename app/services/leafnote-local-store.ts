import type { Note } from '~/types/note'

const DB_VERSION = 3
const NOTES_STORE = 'notes'
const TOMBSTONES_STORE = 'tombstones'
const OUTBOX_STORE = 'outbox'

export interface LeafnoteLocalStoreOptions {
  dbName?: string
}

export interface SaveNoteOptions {
  allowEmpty?: boolean
}

export type OutboxOperation = 'upsertNote' | 'deleteNote'

export interface Tombstone {
  noteId: string
  deletedAt: Date
}

export interface OutboxEntry {
  id: string
  sequence: number
  operation: OutboxOperation
  noteId: string
  createdAt: Date
  processed: boolean
}

export interface LeafnoteLocalStore {
  saveNote: (note: Note, options?: SaveNoteOptions) => Promise<void>
  listNotes: () => Promise<Note[]>
  deleteNote: (noteId: string, deletedAt?: Date) => Promise<void>
  restoreNote: (note: Note) => Promise<void>
  listTombstones: () => Promise<Tombstone[]>
  listOutboxEntries: () => Promise<OutboxEntry[]>
  seedNotesIfEmpty: (notes: Note[]) => Promise<void>
}

interface StoredNote extends Omit<Note, 'createdAt' | 'updatedAt'> {
  createdAt: string
  updatedAt: string
}

interface StoredTombstone {
  noteId: string
  deletedAt: string
}

interface StoredOutboxEntry extends Omit<OutboxEntry, 'createdAt'> {
  createdAt: string
}

export function createLeafnoteLocalStore(options: LeafnoteLocalStoreOptions = {}): LeafnoteLocalStore {
  const dbName = options.dbName ?? 'leafnote'

  return {
    async saveNote(note, saveOptions = {}) {
      if (!saveOptions.allowEmpty && !hasNoteContent(note)) return

      const db = await openDatabase(dbName)
      await saveNoteAndEnqueueOutbox(db, serializeNote(note), serializeOutboxEntry(createOutboxEntry('upsertNote', note.id)))
      db.close()
    },

    async listNotes() {
      const db = await openDatabase(dbName)
      const storedNotes = await readAllFromStore<StoredNote>(db, NOTES_STORE)
      db.close()

      return sortNotes(storedNotes.map(deserializeNote))
    },

    async deleteNote(noteId, deletedAt = new Date()) {
      const db = await openDatabase(dbName)
      await deleteNoteAndWriteTombstone(
        db,
        noteId,
        serializeTombstone({ noteId, deletedAt }),
        serializeOutboxEntry(createOutboxEntry('deleteNote', noteId))
      )
      db.close()
    },

    async restoreNote(note) {
      const db = await openDatabase(dbName)
      await restoreNoteAndRemoveTombstone(db, serializeNote(note))
      db.close()
    },

    async listTombstones() {
      const db = await openDatabase(dbName)
      const storedTombstones = await readAllFromStore<StoredTombstone>(db, TOMBSTONES_STORE)
      db.close()

      return storedTombstones.map(deserializeTombstone)
    },

    async listOutboxEntries() {
      const db = await openDatabase(dbName)
      const storedOutboxEntries = await readAllFromStore<StoredOutboxEntry>(db, OUTBOX_STORE)
      db.close()

      return storedOutboxEntries.map(deserializeOutboxEntry).sort((a, b) => a.sequence - b.sequence)
    },

    async seedNotesIfEmpty(notes) {
      const existingNotes = await this.listNotes()
      if (existingNotes.length > 0) return

      const db = await openDatabase(dbName)
      await writeManyToStore(db, NOTES_STORE, notes.filter(hasNoteContent).map(serializeNote))
      db.close()
    }
  }
}

function hasNoteContent(note: Note) {
  return Boolean(note.title.trim() || note.content.trim())
}

function sortNotes(notes: Note[]) {
  return [...notes].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
}

function openDatabase(dbName: string) {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(dbName, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(NOTES_STORE)) {
        db.createObjectStore(NOTES_STORE, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(TOMBSTONES_STORE)) {
        db.createObjectStore(TOMBSTONES_STORE, { keyPath: 'noteId' })
      }
      if (!db.objectStoreNames.contains(OUTBOX_STORE)) {
        db.createObjectStore(OUTBOX_STORE, { keyPath: 'id' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function writeManyToStore(db: IDBDatabase, storeName: string, values: StoredNote[]) {
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite')
    const store = transaction.objectStore(storeName)

    try {
      for (const value of values) {
        store.put(value)
      }
    } catch (error) {
      transaction.abort()
      reject(error)
      return
    }

    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}

function saveNoteAndEnqueueOutbox(db: IDBDatabase, note: StoredNote, outboxEntry: StoredOutboxEntry) {
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction([NOTES_STORE, OUTBOX_STORE], 'readwrite')
    const notesStore = transaction.objectStore(NOTES_STORE)
    const outboxStore = transaction.objectStore(OUTBOX_STORE)

    try {
      notesStore.put(note)
      outboxStore.put(outboxEntry)
    } catch (error) {
      transaction.abort()
      reject(error)
      return
    }

    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}

function deleteNoteAndWriteTombstone(
  db: IDBDatabase,
  noteId: string,
  tombstone: StoredTombstone,
  outboxEntry: StoredOutboxEntry
) {
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction([NOTES_STORE, TOMBSTONES_STORE, OUTBOX_STORE], 'readwrite')
    const notesStore = transaction.objectStore(NOTES_STORE)
    const tombstonesStore = transaction.objectStore(TOMBSTONES_STORE)
    const outboxStore = transaction.objectStore(OUTBOX_STORE)

    try {
      notesStore.delete(noteId)
      tombstonesStore.put(tombstone)
      outboxStore.put(outboxEntry)
    } catch (error) {
      transaction.abort()
      reject(error)
      return
    }

    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}

function restoreNoteAndRemoveTombstone(db: IDBDatabase, note: StoredNote) {
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction([NOTES_STORE, TOMBSTONES_STORE], 'readwrite')
    const notesStore = transaction.objectStore(NOTES_STORE)
    const tombstonesStore = transaction.objectStore(TOMBSTONES_STORE)

    try {
      notesStore.put(note)
      tombstonesStore.delete(note.id)
    } catch (error) {
      transaction.abort()
      reject(error)
      return
    }

    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}

function readAllFromStore<T>(db: IDBDatabase, storeName: string) {
  return new Promise<T[]>((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly')
    const store = transaction.objectStore(storeName)
    const request = store.getAll()

    request.onsuccess = () => resolve(request.result as T[])
    request.onerror = () => reject(request.error)
  })
}

function serializeNote(note: Note): StoredNote {
  return {
    ...note,
    tags: [...note.tags],
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString()
  }
}

function deserializeNote(note: StoredNote): Note {
  return {
    ...note,
    createdAt: new Date(note.createdAt),
    updatedAt: new Date(note.updatedAt)
  }
}

function createOutboxEntry(operation: OutboxOperation, noteId: string): OutboxEntry {
  const createdAt = new Date()
  const sequence = createdAt.getTime() * 1000 + Math.floor(performance.now() * 1000)
  return {
    id: `${sequence}-${crypto.randomUUID()}`,
    sequence,
    operation,
    noteId,
    createdAt,
    processed: false
  }
}

function serializeTombstone(tombstone: Tombstone): StoredTombstone {
  return {
    noteId: tombstone.noteId,
    deletedAt: tombstone.deletedAt.toISOString()
  }
}

function deserializeTombstone(tombstone: StoredTombstone): Tombstone {
  return {
    noteId: tombstone.noteId,
    deletedAt: new Date(tombstone.deletedAt)
  }
}

function serializeOutboxEntry(entry: OutboxEntry): StoredOutboxEntry {
  return {
    ...entry,
    createdAt: entry.createdAt.toISOString()
  }
}

function deserializeOutboxEntry(entry: StoredOutboxEntry): OutboxEntry {
  return {
    ...entry,
    createdAt: new Date(entry.createdAt)
  }
}
