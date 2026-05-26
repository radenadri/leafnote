<script setup lang="ts">
import { getSyncStatusDisplay } from '~/services/leafnote-status'
import type { LeafnoteStatus } from '~/services/leafnote-status'

const props = defineProps<{
  status: LeafnoteStatus
  class?: string
}>()

const display = computed(() => getSyncStatusDisplay(props.status))
const toneClass = computed(() => ({
  local: 'text-sync-offline',
  saving: 'text-sync-syncing animate-spin',
  saved: 'text-sync-idle',
  synced: 'text-sync-idle'
}[display.value.tone]))
</script>

<template>
  <div :class="['flex items-center gap-1.5 text-xs', props.class]">
    <UIcon
      :name="display.icon"
      :class="['w-3.5 h-3.5', toneClass]"
    />
    <span class="text-muted-foreground">{{ display.label }}</span>
  </div>
</template>
