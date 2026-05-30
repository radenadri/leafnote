import { mockNotes } from '~/data/mockNotes'
import { createLeafnoteLocalStore } from '~/services/leafnote-local-store'
import { getAvailableTags, normalizeTag } from '~/services/leafnote-tags'
import type { Note } from '~/types/note'

export function useLeafnote() {
  const notes = useState<Note[]>('leafnote-notes', () => [])
  const customTags = useState<string[]>('leafnote-custom-tags', () => [])
  const localStore = createLeafnoteLocalStore()

  const allTags = computed(() => getAvailableTags({ notes: notes.value, customTags: customTags.value }))

  async function loadNotes() {
    if (!import.meta.client) return

    await localStore.seedNotesIfEmpty(mockNotes)
    notes.value = await localStore.listNotes()
  }

  function loadCustomTags() {
    customTags.value = []
  }

  function addCustomTag(tag: string) {
    const normalized = normalizeTag(tag)
    if (!normalized || allTags.value.includes(normalized)) return

    customTags.value = [...customTags.value, normalized]
  }

  async function saveNote(note: Note, options?: { allowEmpty?: boolean }) {
    await localStore.saveNote(note, options)
    notes.value = await localStore.listNotes()
  }

  function findNote(id: string) {
    return notes.value.find(note => note.id === id)
  }

  async function deleteNote(note: Note) {
    await localStore.deleteNote(note.id)
    notes.value = await localStore.listNotes()
  }

  async function restoreNote(note: Note) {
    await localStore.restoreNote(note)
    notes.value = await localStore.listNotes()
  }

  return {
    notes,
    customTags,
    allTags,
    loadNotes,
    loadCustomTags,
    saveNote,
    addCustomTag,
    findNote,
    deleteNote,
    restoreNote
  }
}
