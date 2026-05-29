import type { Note } from '../types/note'

export function searchNotes(notes: Note[], query: string) {
  const value = query.trim().toLowerCase()
  if (!value) return []

  return notes.filter(note =>
    note.title.toLowerCase().includes(value) || note.content.toLowerCase().includes(value)
  )
}
