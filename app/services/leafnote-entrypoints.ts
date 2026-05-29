export interface EntryAction {
  label: string
  route: string
}

export interface WelcomeEntryPoint {
  headline: string
  description: string
  primaryAction: EntryAction
  secondaryAction: EntryAction
  footer: string
}

export interface SignInEntryPoint {
  headline: string
  description: string
  providers: Array<'google' | 'apple'>
  footer: string
}

export function getWelcomeEntryPoint(): WelcomeEntryPoint {
  return {
    headline: 'Leafnote',
    description: 'Write private notes on this device first. Sign in later only if you want Sync.',
    primaryAction: { label: 'Get Started', route: '/notes' },
    secondaryAction: { label: 'Sign in to sync', route: '/signin' },
    footer: 'Local Notes stay on this device until Sync is enabled.'
  }
}

export function getSignInEntryPoint(): SignInEntryPoint {
  return {
    headline: 'Sign in to sync',
    description: 'Optional Sync can connect your local Notes across devices later. You can keep using Leafnote without an account.',
    providers: ['google', 'apple'],
    footer: 'Local Notes remain available on this device.'
  }
}
