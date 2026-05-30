import type { Note } from '~/types/note'

const DB_VERSION = 3
const NOTES_STORE = 'notes'
const TOMBSTONES_STORE = 'tombstones'
const OUTBOX_STORE = 'outbox'
const META_STORE = 'meta'
const OUTBOX_SEQUENCE_KEY = 'outbox-sequence'

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

interface StoredMetaValue {
  key: string
  value: number
}

interface LocalDatabase {
  close: () => void
  readAll: <T>(storeName: string) => Promise<T[]>
  writeMany: <T>(storeName: string, values: T[]) => Promise<void>
  saveNoteWithOutbox: (note: StoredNote, operation: OutboxOperation) => Promise<void>
  deleteNoteWithTombstoneAndOutbox: (noteId: string, tombstone: StoredTombstone) => Promise<void>
  restoreNoteAndRemoveTombstone: (note: StoredNote) => Promise<void>
}

export function createLeafnoteLocalStore(options: LeafnoteLocalStoreOptions = {}): LeafnoteLocalStore {
  const dbName = options.dbName ?? 'leafnote'

  return {
    async saveNote(note, saveOptions = {}) {
      if (!saveOptions.allowEmpty && !hasNoteContent(note)) return

      const db = await openLocalDatabase(dbName)
      await db.saveNoteWithOutbox(serializeNote(note), 'upsertNote')
      db.close()
    },

    async listNotes() {
      const db = await openLocalDatabase(dbName)
      const storedNotes = await db.readAll<StoredNote>(NOTES_STORE)
      db.close()

      return sortNotes(storedNotes.map(deserializeNote))
    },

    async deleteNote(noteId, deletedAt = new Date()) {
      const db = await openLocalDatabase(dbName)
      await db.deleteNoteWithTombstoneAndOutbox(noteId, serializeTombstone({ noteId, deletedAt }))
      db.close()
    },

    async restoreNote(note) {
      const db = await openLocalDatabase(dbName)
      await db.restoreNoteAndRemoveTombstone(serializeNote(note))
      db.close()
    },

    async listTombstones() {
      const db = await openLocalDatabase(dbName)
      const storedTombstones = await db.readAll<StoredTombstone>(TOMBSTONES_STORE)
      db.close()

      return storedTombstones.map(deserializeTombstone)
    },

    async listOutboxEntries() {
      const db = await openLocalDatabase(dbName)
      const storedOutboxEntries = await db.readAll<StoredOutboxEntry>(OUTBOX_STORE)
      db.close()

      return storedOutboxEntries.map(deserializeOutboxEntry).sort((a, b) => a.sequence - b.sequence)
    },

    async seedNotesIfEmpty(notes) {
      const existingNotes = await this.listNotes()
      if (existingNotes.length > 0) return

      const db = await openLocalDatabase(dbName)
      await db.writeMany(NOTES_STORE, notes.filter(hasNoteContent).map(serializeNote))
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

async function openLocalDatabase(dbName: string): Promise<LocalDatabase> {
  const database = await openIndexedDatabase(dbName)

  return {
    close() {
      database.close()
    },

    readAll(storeName) {
      return readAllFromStore(database, storeName)
    },

    writeMany(storeName, values) {
      return writeManyToStore(database, storeName, values)
    },

    saveNoteWithOutbox(note, operation) {
      return writeNoteAndOutbox(database, note, operation)
    },

    deleteNoteWithTombstoneAndOutbox(noteId, tombstone) {
      return deleteNoteAndWriteTombstoneAndOutbox(database, noteId, tombstone)
    },

    restoreNoteAndRemoveTombstone(note) {
      return restoreNoteAndDeleteTombstone(database, note)
    }
  }
}

function openIndexedDatabase(dbName: string) {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(dbName, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      createStoreIfMissing(db, NOTES_STORE, 'id')
      createStoreIfMissing(db, TOMBSTONES_STORE, 'noteId')
      createStoreIfMissing(db, OUTBOX_STORE, 'id')
      createStoreIfMissing(db, META_STORE, 'key')
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function createStoreIfMissing(db: IDBDatabase, storeName: string, keyPath: string) {
  if (!db.objectStoreNames.contains(storeName)) {
    db.createObjectStore(storeName, { keyPath })
  }
}

function writeManyToStore<T>(db: IDBDatabase, storeName: string, values: T[]) {
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

function writeNoteAndOutbox(db: IDBDatabase, note: StoredNote, operation: OutboxOperation) {
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction([NOTES_STORE, OUTBOX_STORE, META_STORE], 'readwrite')
    const notesStore = transaction.objectStore(NOTES_STORE)
    const outboxStore = transaction.objectStore(OUTBOX_STORE)
    const metaStore = transaction.objectStore(META_STORE)

    const sequenceRequest = metaStore.get(OUTBOX_SEQUENCE_KEY)
    sequenceRequest.onsuccess = () => {
      const outboxEntry = serializeOutboxEntry(createOutboxEntry(operation, note.id, nextOutboxSequence(sequenceRequest.result)))
      try {
        notesStore.put(note)
        outboxStore.put(outboxEntry)
        metaStore.put({ key: OUTBOX_SEQUENCE_KEY, value: outboxEntry.sequence })
      } catch (error) {
        transaction.abort()
        reject(error)
      }
    }
    sequenceRequest.onerror = () => reject(sequenceRequest.error)
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}

function deleteNoteAndWriteTombstoneAndOutbox(db: IDBDatabase, noteId: string, tombstone: StoredTombstone) {
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction([NOTES_STORE, TOMBSTONES_STORE, OUTBOX_STORE, META_STORE], 'readwrite')
    const notesStore = transaction.objectStore(NOTES_STORE)
    const tombstonesStore = transaction.objectStore(TOMBSTONES_STORE)
    const outboxStore = transaction.objectStore(OUTBOX_STORE)
    const metaStore = transaction.objectStore(META_STORE)

    const sequenceRequest = metaStore.get(OUTBOX_SEQUENCE_KEY)
    sequenceRequest.onsuccess = () => {
      const outboxEntry = serializeOutboxEntry(createOutboxEntry('deleteNote', noteId, nextOutboxSequence(sequenceRequest.result)))
      try {
        notesStore.delete(noteId)
        tombstonesStore.put(tombstone)
        outboxStore.put(outboxEntry)
        metaStore.put({ key: OUTBOX_SEQUENCE_KEY, value: outboxEntry.sequence })
      } catch (error) {
        transaction.abort()
        reject(error)
      }
    }
    sequenceRequest.onerror = () => reject(sequenceRequest.error)
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}

function restoreNoteAndDeleteTombstone(db: IDBDatabase, note: StoredNote) {
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

function nextOutboxSequence(storedValue: StoredMetaValue | undefined) {
  return (storedValue?.value ?? 0) + 1
}

function createOutboxEntry(operation: OutboxOperation, noteId: string, sequence: number): OutboxEntry {
  return {
    id: `${sequence}-${crypto.randomUUID()}`,
    sequence,
    operation,
    noteId,
    createdAt: new Date(),
    processed: false
  }
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
