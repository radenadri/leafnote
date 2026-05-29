import type { LeafnoteStatus } from './leafnote-status'

export interface SettingsScreenInput {
  signedIn: boolean
}

export interface SettingsAction {
  label: string
  route: string
}

export interface SettingsAccountCard {
  title: string
  description: string
  action?: SettingsAction
}

export interface SettingsScreen {
  account: SettingsAccountCard
  syncStatus: LeafnoteStatus
  version: string
  privacy: {
    title: string
    description: string
  }
}

export function getSettingsScreen({ signedIn }: SettingsScreenInput): SettingsScreen {
  return {
    account: signedIn
      ? {
          title: 'Signed in',
          description: 'Sync can keep your Notes available across devices.'
        }
      : {
          title: 'Sync is optional',
          description: 'Keep writing locally without an account. Sign in later to enable Sync.',
          action: { label: 'Sign in to sync', route: '/signin' }
        },
    syncStatus: signedIn ? 'synced' : 'local-only',
    version: '1.0.0',
    privacy: {
      title: 'Your notes are private',
      description: signedIn
        ? 'Notes are private and stored securely.'
        : 'Notes are private, stored securely, and remain on this device unless Sync is enabled.'
    }
  }
}
