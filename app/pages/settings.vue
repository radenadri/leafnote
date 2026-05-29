<script setup lang="ts">
import { getSettingsScreen } from '~/services/leafnote-settings'

const isSignedIn = shallowRef(false)
const settingsScreen = computed(() => getSettingsScreen({ signedIn: isSignedIn.value }))

interface SettingsItem {
  icon: string
  label: string
  value?: string
  danger?: boolean
  action?: () => void
}

function settingsItemClass(item: SettingsItem) {
  return [
    'w-full flex items-center gap-3 px-4 py-3 transition-colors',
    item.action ? 'hover:bg-secondary active:bg-secondary/80 focus-ring cursor-pointer' : ''
  ]
}
</script>

<template>
  <div class="min-h-screen bg-background safe-top safe-bottom">
    <header class="sticky top-0 z-10 bg-background border-b border-border/50">
      <div class="flex items-center gap-3 px-2 py-2">
        <button
          type="button"
          class="p-2 rounded-lg hover:bg-secondary transition-colors focus-ring"
          aria-label="Go back"
          @click="navigateTo('/notes')"
        >
          <UIcon
            name="i-lucide-arrow-left"
            class="w-5 h-5 text-muted-foreground"
          />
        </button>
        <h1 class="text-lg font-semibold text-foreground">
          Settings
        </h1>
      </div>
    </header>

    <main class="animate-fade-in">
      <section class="py-2">
        <h2 class="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Account
        </h2>

        <template v-if="isSignedIn">
          <div :class="settingsItemClass({ icon: 'i-lucide-user', label: 'Email' })">
            <UIcon
              name="i-lucide-user"
              class="w-5 h-5 text-muted-foreground"
            />
            <span class="flex-1 text-left text-foreground">Email</span>
            <span class="text-sm text-muted-foreground">user@example.com</span>
          </div>
          <button
            type="button"
            :class="settingsItemClass({ icon: 'i-lucide-log-in', label: 'Sign out', danger: true, action: () => {} })"
            @click="navigateTo('/')"
          >
            <UIcon
              name="i-lucide-log-in"
              class="w-5 h-5 text-destructive"
            />
            <span class="flex-1 text-left text-destructive">Sign out</span>
          </button>
        </template>

        <div
          v-else
          class="px-4 py-3"
        >
          <div class="p-4 bg-card rounded-lg border border-border/50">
            <div class="flex items-start gap-3 mb-4">
              <UIcon
                name="i-lucide-cloud"
                class="w-5 h-5 text-leaf-500 mt-0.5"
              />
              <div>
                <p class="text-sm font-medium text-foreground mb-1">
                  {{ settingsScreen.account.title }}
                </p>
                <p class="text-sm text-muted-foreground">
                  {{ settingsScreen.account.description }}
                </p>
              </div>
            </div>
            <button
              type="button"
              class="w-full h-10 rounded-lg bg-primary text-primary-foreground inline-flex items-center justify-center hover:bg-primary/90 transition-colors focus-ring"
              @click="navigateTo(settingsScreen.account.action?.route ?? '/signin')"
            >
              <UIcon
                name="i-lucide-log-in"
                class="w-4 h-4 mr-2"
              />
              {{ settingsScreen.account.action?.label }}
            </button>
          </div>
        </div>
      </section>

      <USeparator />

      <section class="py-2">
        <h2 class="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          App
        </h2>
        <div class="flex items-center gap-3 px-4 py-3">
          <UIcon
            name="i-lucide-cloud"
            class="w-5 h-5 text-muted-foreground"
          />
          <span class="flex-1 text-foreground">Sync status</span>
          <LeafnoteSyncIndicator :status="settingsScreen.syncStatus" />
        </div>
        <div class="w-full flex items-center gap-3 px-4 py-3 transition-colors">
          <UIcon
            name="i-lucide-info"
            class="w-5 h-5 text-muted-foreground"
          />
          <span class="flex-1 text-left text-foreground">Version</span>
          <span class="text-sm text-muted-foreground">{{ settingsScreen.version }}</span>
        </div>
      </section>

      <USeparator />

      <section class="py-2">
        <h2 class="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Privacy
        </h2>
        <div class="px-4 py-4">
          <div class="flex items-start gap-3 p-4 bg-leaf-50 rounded-lg">
            <UIcon
              name="i-lucide-shield"
              class="w-5 h-5 text-leaf-600 mt-0.5"
            />
            <div>
              <p class="text-sm font-medium text-foreground mb-1">
                {{ settingsScreen.privacy.title }}
              </p>
              <p class="text-sm text-muted-foreground">
                {{ settingsScreen.privacy.description }}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>
