<script setup lang="ts">
import type { Note } from '~/types/note'

const props = defineProps<{
  note: Note
  style?: Record<string, string>
  class?: string
}>()

const emit = defineEmits<{
  open: [note: Note]
  delete: [note: Note]
}>()

const swipeThreshold = 80
const deleteThreshold = 120

const translateX = shallowRef(0)
const isDragging = shallowRef(false)
const startX = shallowRef(0)
const isDeleting = shallowRef(false)
const showDeleteDialog = shallowRef(false)

const preview = computed(() => props.note.content.length > 100
  ? `${props.note.content.slice(0, 100)}...`
  : props.note.content
)
const timeAgo = computed(() => formatTimeAgo(props.note.updatedAt))

function onTouchStart(event: TouchEvent) {
  startX.value = event.touches[0]?.clientX ?? 0
  isDragging.value = true
}

function onTouchMove(event: TouchEvent) {
  if (!isDragging.value) return

  const currentX = event.touches[0]?.clientX ?? 0
  const diff = startX.value - currentX
  translateX.value = diff > 0 ? Math.min(diff, deleteThreshold + 20) : 0
}

function onTouchEnd() {
  isDragging.value = false

  if (translateX.value >= deleteThreshold) {
    showDeleteDialog.value = true
    translateX.value = swipeThreshold
    return
  }

  translateX.value = translateX.value >= swipeThreshold ? swipeThreshold : 0
}

function handleClick() {
  if (translateX.value > 0) {
    translateX.value = 0
    return
  }

  emit('open', props.note)
}

function confirmDelete() {
  showDeleteDialog.value = false
  isDeleting.value = true
  translateX.value = 400
  setTimeout(() => emit('delete', props.note), 200)
}

function cancelDelete() {
  showDeleteDialog.value = false
  translateX.value = 0
}
</script>

<template>
  <div>
    <div
      :class="[
        'relative overflow-hidden rounded-lg opacity-0 animate-fade-up',
        isDeleting && 'pointer-events-none',
        props.class
      ]"
      :style="style"
    >
      <div
        :class="[
          'absolute inset-y-0 right-0 flex items-center justify-end bg-destructive text-destructive-foreground rounded-lg transition-all duration-200',
          translateX > 0 ? 'opacity-100' : 'opacity-0'
        ]"
        :style="{ width: `${Math.max(translateX + 20, swipeThreshold + 20)}px` }"
      >
        <button
          type="button"
          class="flex items-center justify-center w-16 h-full"
          aria-label="Delete note"
          @click.stop="showDeleteDialog = true"
        >
          <UIcon
            name="i-lucide-trash-2"
            class="w-5 h-5"
          />
        </button>
      </div>

      <div
        :class="[
          'relative w-full text-left p-4 rounded-lg bg-card border border-border/50 focus-ring cursor-pointer',
          !isDragging && 'transition-transform duration-200 ease-out'
        ]"
        :style="{ transform: `translateX(-${translateX}px)` }"
        tabindex="0"
        role="button"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
        @click="handleClick"
        @keydown.enter="handleClick"
      >
        <h3 class="font-medium text-foreground mb-1.5 line-clamp-1">
          {{ note.title || 'Untitled' }}
        </h3>
        <p class="text-note-preview text-muted-foreground line-clamp-2 mb-3">
          {{ preview }}
        </p>

        <div
          v-if="note.tags.length > 0"
          class="flex flex-wrap gap-1.5 mb-2"
        >
          <LeafnoteTagBadge
            v-for="tag in note.tags.slice(0, 3)"
            :key="tag"
            :tag="tag"
            size="sm"
          />
          <span
            v-if="note.tags.length > 3"
            class="text-xs text-muted-foreground"
          >
            +{{ note.tags.length - 3 }}
          </span>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs text-ink-faint">{{ timeAgo }}</span>
          <span
            v-if="note.syncStatus === 'pending'"
            class="text-xs text-sync-syncing"
          >• Pending sync</span>
          <span
            v-if="note.syncStatus === 'local'"
            class="text-xs text-muted-foreground"
          >• Local only</span>
        </div>
      </div>
    </div>

    <UModal
      v-model:open="showDeleteDialog"
      title="Delete note?"
      :description="`&quot;${note.title || 'Untitled'}&quot; will be permanently deleted. This action cannot be undone.`"
      :ui="{ content: 'max-w-[90vw] sm:max-w-md rounded-lg' }"
    >
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton
            color="neutral"
            variant="outline"
            @click="cancelDelete"
          >
            Cancel
          </UButton>
          <UButton
            color="error"
            @click="confirmDelete"
          >
            Delete
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
