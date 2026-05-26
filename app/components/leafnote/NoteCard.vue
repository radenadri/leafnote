<script setup lang="ts">
import type { Note } from '~/types/note'

const props = defineProps<{
  note: Note
  style?: Record<string, string>
  class?: string
}>()

const emit = defineEmits<{
  open: [note: Note]
}>()

const preview = computed(() => props.note.content.length > 100
  ? `${props.note.content.slice(0, 100)}...`
  : props.note.content
)

const timeAgo = computed(() => formatTimeAgo(props.note.updatedAt))
</script>

<template>
  <button
    type="button"
    :class="[
      'w-full text-left p-4 rounded-lg bg-card border border-border/50 note-card-hover focus-ring opacity-0 animate-fade-up',
      props.class
    ]"
    :style="style"
    @click="emit('open', note)"
  >
    <h3 class="font-medium text-foreground mb-1.5 line-clamp-1">
      {{ note.title || 'Untitled' }}
    </h3>
    <p class="text-note-preview text-muted-foreground line-clamp-2 mb-3">
      {{ preview }}
    </p>

    <div v-if="note.tags.length > 0" class="flex flex-wrap gap-1.5 mb-2">
      <LeafnoteTagBadge
        v-for="tag in note.tags.slice(0, 3)"
        :key="tag"
        :tag="tag"
        size="sm"
      />
      <span v-if="note.tags.length > 3" class="text-xs text-muted-foreground">
        +{{ note.tags.length - 3 }}
      </span>
    </div>

    <div class="flex items-center gap-2">
      <span class="text-xs text-ink-faint">{{ timeAgo }}</span>
      <span v-if="note.syncStatus === 'pending'" class="text-xs text-sync-syncing">• Pending sync</span>
      <span v-if="note.syncStatus === 'local'" class="text-xs text-muted-foreground">• Local only</span>
    </div>
  </button>
</template>
