import type { Note } from '~/types/note'

const DB_VERSION = 1
const NOTES_STORE = 'notes'

export interface LeafnoteLocalStoreOptions {
  dbName?: string
}

export interface SaveNoteOptions {
  allowEmpty?: boolean
}

export interface LeafnoteLocalStore {
  saveNote: (note: Note, options?: SaveNoteOptions) => Promise<void>
  listNotes: () => Promise<Note[]>
  seedNotesIfEmpty: (notes: Note[]) => Promise<void>
}

interface StoredNote extends Omit<Note, 'createdAt' | 'updatedAt'> {
  createdAt: string
  updatedAt: string
}

export function createLeafnoteLocalStore(options: LeafnoteLocalStoreOptions = {}): LeafnoteLocalStore {
  const dbName = options.dbName ?? 'leafnote'

  return {
    async saveNote(note, saveOptions = {}) {
      if (!saveOptions.allowEmpty && !hasNoteContent(note)) return

      const db = await openDatabase(dbName)
      await writeToStore(db, NOTES_STORE, serializeNote(note))
      db.close()
    },

    async listNotes() {
      const db = await openDatabase(dbName)
      const storedNotes = await readAllFromStore<StoredNote>(db, NOTES_STORE)
      db.close()

      return sortNotes(storedNotes.map(deserializeNote))
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
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function writeToStore(db: IDBDatabase, storeName: string, value: StoredNote) {
  return writeManyToStore(db, storeName, [value])
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
