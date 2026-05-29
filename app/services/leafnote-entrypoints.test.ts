import { describe, expect, it } from 'vitest'
import { getSignInEntryPoint, getWelcomeEntryPoint } from './leafnote-entrypoints'

describe('Leafnote local-first entry points', () => {
  it('routes Get Started to local Notes and Sign in to optional Sync', () => {
    expect(getWelcomeEntryPoint()).toMatchObject({
      primaryAction: { label: 'Get Started', route: '/notes' },
      secondaryAction: { label: 'Sign in to sync', route: '/signin' }
    })
  })

  it('keeps Sign-in optional with Google and Apple only', () => {
    expect(getSignInEntryPoint()).toMatchObject({
      description: expect.stringContaining('without an account'),
      providers: ['google', 'apple']
    })
  })
})
