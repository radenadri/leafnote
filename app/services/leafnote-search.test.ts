import { describe, expect, it } from 'vitest'
import { searchNotes } from './leafnote-search'
import type { Note } from '../types/note'

function makeNote(overrides: Partial<Note>): Note {
  return {
    id: 'note-1',
    title: 'Untitled',
    content: '',
    tags: [],
    createdAt: new Date('2026-01-01T08:00:00.000Z'),
    updatedAt: new Date('2026-01-01T08:00:00.000Z'),
    syncStatus: 'local',
    ...overrides
  }
}

describe('Leafnote Search', () => {
  it('matches local Notes by title and body only', () => {
    const titleMatch = makeNote({ id: 'title-match', title: 'Lemon pasta', content: 'Dinner plan', tags: [] })
    const bodyMatch = makeNote({ id: 'body-match', title: 'Recipe', content: 'Add fresh lemon zest.', tags: [] })
    const tagOnlyMatch = makeNote({ id: 'tag-only-match', title: 'Groceries', content: 'Buy oranges', tags: ['lemon'] })

    expect(searchNotes([titleMatch, bodyMatch, tagOnlyMatch], 'lemon')).toEqual([
      titleMatch,
      bodyMatch
    ])
  })

  it('returns no results for a blank query', () => {
    expect(searchNotes([
      makeNote({ id: 'note-1', title: 'Lemon pasta', content: 'Dinner plan' })
    ], '   ')).toEqual([])
  })
})
