import type { Note } from '~/types/note'

export const mockNotes: Note[] = [
  {
    id: '1',
    title: 'Morning Thoughts',
    content: 'The best ideas come when the mind is quiet. Today I want to focus on being present and mindful in each moment. No rushing, no multitasking, just one thing at a time.',
    tags: ['journal', 'personal'],
    createdAt: new Date('2024-01-15T08:30:00'),
    updatedAt: new Date('2024-01-15T09:15:00'),
    syncStatus: 'synced'
  },
  {
    id: '2',
    title: 'Book Notes: Atomic Habits',
    content: '1% better every day. Small changes compound over time. Focus on systems, not goals. Make good habits obvious, attractive, easy, and satisfying.',
    tags: ['books', 'ideas'],
    createdAt: new Date('2024-01-14T14:20:00'),
    updatedAt: new Date('2024-01-14T16:45:00'),
    syncStatus: 'synced'
  },
  {
    id: '3',
    title: 'Recipe: Lemon Pasta',
    content: 'Ingredients: spaghetti, lemon zest, parmesan, olive oil, garlic, black pepper. Cook pasta al dente. Combine with olive oil, lemon zest, and cheese. Simple and delicious.',
    tags: ['recipes'],
    createdAt: new Date('2024-01-13T19:00:00'),
    updatedAt: new Date('2024-01-13T19:30:00'),
    syncStatus: 'synced'
  },
  {
    id: '4',
    title: 'Weekend Plans',
    content: 'Saturday: morning hike, farmer\'s market, read in the afternoon. Sunday: brunch with friends, meal prep for the week.',
    tags: ['personal'],
    createdAt: new Date('2024-01-12T20:00:00'),
    updatedAt: new Date('2024-01-12T20:15:00'),
    syncStatus: 'pending'
  },
  {
    id: '5',
    title: 'Gratitude',
    content: 'Today I\'m grateful for good health, meaningful work, and the people who support me. It\'s easy to forget how much we have.',
    tags: ['journal'],
    createdAt: new Date('2024-01-11T21:30:00'),
    updatedAt: new Date('2024-01-11T21:35:00'),
    syncStatus: 'local'
  }
]
