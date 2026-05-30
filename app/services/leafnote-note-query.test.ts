import { describe, expect, it } from 'vitest'
import { getNoteList, searchNotes } from './leafnote-note-query'
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

describe('Leafnote Note query', () => {
  it('returns Notes newest-first and filters by selected Tag', () => {
    const olderJournal = makeNote({
      id: 'older-journal',
      title: 'Older Journal',
      tags: ['journal'],
      updatedAt: new Date('2026-01-01T08:00:00.000Z')
    })
    const newerRecipe = makeNote({
      id: 'newer-recipe',
      title: 'Newer Recipe',
      tags: ['recipes'],
      updatedAt: new Date('2026-01-01T10:00:00.000Z')
    })
    const newestJournal = makeNote({
      id: 'newest-journal',
      title: 'Newest Journal',
      tags: ['journal'],
      updatedAt: new Date('2026-01-01T11:00:00.000Z')
    })

    expect(getNoteList([olderJournal, newerRecipe, newestJournal], null)).toEqual([
      newestJournal,
      newerRecipe,
      olderJournal
    ])
    expect(getNoteList([olderJournal, newerRecipe, newestJournal], 'journal')).toEqual([
      newestJournal,
      olderJournal
    ])
  })

  it('matches Search by title and body only', () => {
    const titleMatch = makeNote({ id: 'title-match', title: 'Lemon pasta', content: 'Dinner plan', tags: [] })
    const bodyMatch = makeNote({ id: 'body-match', title: 'Recipe', content: 'Add fresh lemon zest.', tags: [] })
    const tagOnlyMatch = makeNote({ id: 'tag-only-match', title: 'Groceries', content: 'Buy oranges', tags: ['lemon'] })

    expect(searchNotes([titleMatch, bodyMatch, tagOnlyMatch], 'lemon')).toEqual([
      titleMatch,
      bodyMatch
    ])
  })

  it('returns no Search results for a blank query', () => {
    expect(searchNotes([
      makeNote({ id: 'note-1', title: 'Lemon pasta', content: 'Dinner plan' })
    ], '   ')).toEqual([])
  })
})
