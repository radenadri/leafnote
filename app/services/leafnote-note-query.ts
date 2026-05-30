import type { Note } from '../types/note'

export function getNoteList(notes: Note[], selectedTag: string | null) {
  const sortedNotes = [...notes].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  if (!selectedTag) return sortedNotes

  return sortedNotes.filter(note => note.tags.includes(selectedTag))
}

export function searchNotes(notes: Note[], query: string) {
  const value = query.trim().toLowerCase()
  if (!value) return []

  return notes.filter(note =>
    note.title.toLowerCase().includes(value) || note.content.toLowerCase().includes(value)
  )
}
