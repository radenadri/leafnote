import { mockNotes } from '~/data/mockNotes'
import { CUSTOM_TAGS_KEY, DEFAULT_TAGS } from '~/types/note'
import type { Note } from '~/types/note'

export function useLeafnote() {
  const notes = useState<Note[]>('leafnote-notes', () => [...mockNotes])
  const customTags = useState<string[]>('leafnote-custom-tags', () => [])

  const allTags = computed(() => [...DEFAULT_TAGS, ...customTags.value])

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
    loadCustomTags,
    addCustomTag,
    findNote,
    deleteNote,
    restoreNote
  }
}
