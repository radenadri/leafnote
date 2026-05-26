import { mockNotes } from '~/data/mockNotes'
import { createLeafnoteLocalStore } from '~/services/leafnote-local-store'
import { CUSTOM_TAGS_KEY, DEFAULT_TAGS } from '~/types/note'
import type { Note } from '~/types/note'

export function useLeafnote() {
  const notes = useState<Note[]>('leafnote-notes', () => [])
  const customTags = useState<string[]>('leafnote-custom-tags', () => [])
  const localStore = createLeafnoteLocalStore()

  const allTags = computed(() => [...DEFAULT_TAGS, ...customTags.value])

  async function loadNotes() {
    if (!import.meta.client) return

    await localStore.seedNotesIfEmpty(mockNotes)
    notes.value = await localStore.listNotes()
  }

  function loadCustomTags() {
    if (!import.meta.client) return

    const stored = localStorage.getItem(CUSTOM_TAGS_KEY)
    if (!stored) return

    try {
      customTags.value = JSON.parse(stored)
    } catch {
      customTags.value = []
    }
  }

  function saveCustomTags() {
    if (!import.meta.client) return
    localStorage.setItem(CUSTOM_TAGS_KEY, JSON.stringify(customTags.value))
  }

  function addCustomTag(tag: string) {
    const normalized = tag.trim().toLowerCase()
    if (!normalized || allTags.value.includes(normalized)) return

    customTags.value = [...customTags.value, normalized]
    saveCustomTags()
  }

  async function saveNote(note: Note) {
    await localStore.saveNote(note)
    notes.value = await localStore.listNotes()
  }

  function findNote(id: string) {
    return notes.value.find(note => note.id === id)
  }

  function deleteNote(note: Note) {
    notes.value = notes.value.filter(item => item.id !== note.id)
  }

  function restoreNote(note: Note) {
    notes.value = [...notes.value, note].sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    )
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
