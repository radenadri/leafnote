<script setup lang="ts">
import type { SyncStatus } from '~/types/note'

const props = defineProps<{
  status: SyncStatus
  class?: string
}>()
</script>

<template>
  <div :class="['flex items-center gap-1.5 text-xs', props.class]">
    <template v-if="status === 'idle'">
      <UIcon name="i-lucide-cloud" class="w-3.5 h-3.5 text-sync-idle" />
      <span class="text-muted-foreground">Synced</span>
    </template>

    <template v-else-if="status === 'syncing'">
      <UIcon name="i-lucide-refresh-cw" class="w-3.5 h-3.5 text-sync-syncing animate-spin" />
      <span class="text-muted-foreground">Syncing...</span>
    </template>

    <template v-else>
      <UIcon name="i-lucide-cloud-off" class="w-3.5 h-3.5 text-sync-offline" />
      <span class="text-muted-foreground">Offline</span>
    </template>
  </div>
</template>
