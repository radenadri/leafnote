import { DEFAULT_TAGS } from '../types/note'
import type { Note } from '../types/note'

export interface AvailableTagsInput {
  notes: Note[]
  customTags: string[]
}

export function getAvailableTags({ notes, customTags }: AvailableTagsInput) {
  const seenTags = new Set(DEFAULT_TAGS)
  const availableTags = [...DEFAULT_TAGS]

  for (const tag of customTags) {
    addTag(tag, seenTags, availableTags)
  }

  for (const note of notes) {
    for (const tag of note.tags) {
      addTag(tag, seenTags, availableTags)
    }
  }

  return availableTags
}

function addTag(tag: string, seenTags: Set<string>, availableTags: string[]) {
  const normalized = tag.trim().toLowerCase()
  if (!normalized || seenTags.has(normalized)) return

  seenTags.add(normalized)
  availableTags.push(normalized)
}
