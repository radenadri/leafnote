export interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
  syncStatus: 'synced' | 'pending' | 'local'
}

export const DEFAULT_TAGS = [
  'personal',
  'work',
  'ideas',
  'journal',
  'recipes',
  'books'
]
