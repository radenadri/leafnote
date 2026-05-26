<script setup lang="ts">
import type { LeafnoteStatus } from '~/services/leafnote-status'
import type { Note } from '~/types/note'

const toast = useToast()
const { notes, allTags, loadNotes, loadCustomTags, deleteNote, restoreNote } = useLeafnote()

const syncStatus = shallowRef<LeafnoteStatus>('local-only')
const selectedTag = shallowRef<string | null>(null)

onMounted(async () => {
  await loadNotes()
  loadCustomTags()
})

const filteredNotes = computed(() => {
  const result = [...notes.value].sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
  )

  if (!selectedTag.value) return result
  return result.filter(note => note.tags.includes(selectedTag.value!))
})

function openNote(note: Note) {
  navigateTo(`/notes/${note.id}`)
}

function removeNote(note: Note) {
  deleteNote(note)
  toast.add({
    title: 'Note deleted',
    actions: [{
      label: 'Undo',
      color: 'neutral',
      variant: 'outline',
      onClick: () => restoreNote(note)
    }]
  })
}
</script>

<template>
  <div class="min-h-screen bg-background safe-top">
    <header class="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50">
      <div class="flex items-center justify-between px-4 py-3">
        <div class="flex items-center gap-2">
          <LeafnoteLeafIcon size="sm" />
          <h1 class="text-lg font-semibold text-foreground">
            Leafnote
          </h1>
        </div>

        <div class="flex items-center gap-1">
          <LeafnoteSyncIndicator
            :status="syncStatus"
            class="mr-2"
          />
          <button
            type="button"
            class="p-2 rounded-lg hover:bg-secondary transition-colors focus-ring"
            aria-label="Search notes"
            @click="navigateTo('/search')"
          >
            <UIcon
              name="i-lucide-search"
              class="w-5 h-5 text-muted-foreground"
            />
          </button>
          <button
            type="button"
            class="p-2 rounded-lg hover:bg-secondary transition-colors focus-ring"
            aria-label="Settings"
            @click="navigateTo('/settings')"
          >
            <UIcon
              name="i-lucide-settings"
              class="w-5 h-5 text-muted-foreground"
            />
          </button>
        </div>
      </div>

      <LeafnoteTagFilter
        :selected-tag="selectedTag"
        :available-tags="allTags"
        @select="selectedTag = $event"
      />
    </header>

    <div
      v-if="notes.length > 0"
      class="px-4 pt-3 pb-1"
    >
      <p class="text-xs text-muted-foreground text-center">
        ← Swipe left on a note to delete
      </p>
    </div>

    <main class="px-4 py-2 pb-24">
      <template v-if="filteredNotes.length === 0">
        <div
          v-if="selectedTag"
          class="text-center py-16 animate-fade-in"
        >
          <p class="text-muted-foreground">
            No notes with tag "{{ selectedTag }}"
          </p>
        </div>
        <LeafnoteEmptyState v-else />
      </template>

      <div
        v-else
        class="space-y-3"
      >
        <LeafnoteSwipeableNoteCard
          v-for="(note, index) in filteredNotes"
          :key="note.id"
          :note="note"
          :style="{ animationDelay: `${index * 0.05}s` }"
          @open="openNote"
          @delete="removeNote"
        />
      </div>
    </main>

    <LeafnoteFloatingActionButton @click="navigateTo('/notes/new')" />
  </div>
</template>
