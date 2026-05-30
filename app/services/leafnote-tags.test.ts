import { describe, expect, it } from 'vitest'
import { getAvailableTags, normalizeTag } from './leafnote-tags'
import type { Note } from '~/types/note'

const baseNote = {
  id: 'note-1',
  title: 'Tagged Note',
  content: 'A note with tags.',
  createdAt: new Date('2026-01-01T08:00:00.000Z'),
  updatedAt: new Date('2026-01-01T08:00:00.000Z'),
  syncStatus: 'local' as const
}

describe('Leafnote Tags', () => {
  it('keeps custom Tags attached to local Notes available after reload', () => {
    const notes: Note[] = [
      {
        ...baseNote,
        tags: ['travel', 'journal']
      }
    ]

    expect(getAvailableTags({ notes, customTags: [] })).toEqual([
      'personal',
      'work',
      'ideas',
      'journal',
      'recipes',
      'books',
      'travel'
    ])
  })

  it('normalizes custom Tags and avoids duplicate default Tags', () => {
    expect(getAvailableTags({
      notes: [],
      customTags: [' Travel ', 'travel', 'WORK']
    })).toEqual([
      'personal',
      'work',
      'ideas',
      'journal',
      'recipes',
      'books',
      'travel'
    ])
  })

  it('normalizes Tag input through the Tag interface', () => {
    expect(normalizeTag(' Travel Ideas ')).toBe('travel ideas')
    expect(normalizeTag('   ')).toBe('')
  })
})
