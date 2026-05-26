export type LeafnoteStatus = 'local-only' | 'saving' | 'saved' | 'syncing' | 'synced'

export interface LeafnoteStatusDisplay {
  icon: string
  label: string
  tone: 'local' | 'saving' | 'saved' | 'synced'
}

export function getSyncStatusDisplay(status: LeafnoteStatus): LeafnoteStatusDisplay {
  switch (status) {
    case 'saving':
      return { icon: 'i-lucide-refresh-cw', label: 'Saving...', tone: 'saving' }
    case 'saved':
      return { icon: 'i-lucide-check', label: 'Saved', tone: 'saved' }
    case 'syncing':
      return { icon: 'i-lucide-refresh-cw', label: 'Syncing...', tone: 'saving' }
    case 'synced':
      return { icon: 'i-lucide-cloud', label: 'Synced', tone: 'synced' }
    case 'local-only':
      return { icon: 'i-lucide-hard-drive', label: 'Local only', tone: 'local' }
  }
}
