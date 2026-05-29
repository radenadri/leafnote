import { describe, expect, it } from 'vitest'
import { getSettingsScreen } from './leafnote-settings'

describe('Leafnote Settings', () => {
  it('shows local-first account and Sync state when signed out', () => {
    expect(getSettingsScreen({ signedIn: false }).account).toMatchObject({
      title: 'Sync is optional',
      action: { label: 'Sign in to sync', route: '/signin' }
    })
    expect(getSettingsScreen({ signedIn: false }).syncStatus).toBe('local-only')
  })

  it('shows version and privacy copy for local Notes', () => {
    expect(getSettingsScreen({ signedIn: false })).toMatchObject({
      version: '1.0.0',
      privacy: {
        title: 'Your notes are private',
        description: expect.stringContaining('remain on this device')
      }
    })
    expect(getSettingsScreen({ signedIn: false }).privacy.description).not.toContain('end-to-end')
  })
})
