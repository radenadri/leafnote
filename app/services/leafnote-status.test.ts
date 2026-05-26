import { describe, expect, it } from 'vitest'
import { getSyncStatusDisplay } from './leafnote-status'

describe('Leafnote status copy', () => {
  it('shows signed-out local use as Local only, not Offline', () => {
    expect(getSyncStatusDisplay('local-only')).toEqual({
      icon: 'i-lucide-hard-drive',
      label: 'Local only',
      tone: 'local'
    })
  })

  it('separates local saving from backend syncing', () => {
    expect(getSyncStatusDisplay('saving').label).toBe('Saving...')
    expect(getSyncStatusDisplay('saved').label).toBe('Saved')
    expect(getSyncStatusDisplay('syncing').label).toBe('Syncing...')
    expect(getSyncStatusDisplay('synced').label).toBe('Synced')
  })
})
