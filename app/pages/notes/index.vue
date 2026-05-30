<script setup lang="ts">
import { getNoteList } from '~/services/leafnote-note-query'
import type { LeafnoteStatus } from '~/services/leafnote-status'
import type { Note } from '~/types/note'

const toast = useToast()
const { notes, allTags, loadNotes, loadCustomTags, deleteNote, restoreNote } = useLeafnote()

const syncStatus = shallowRef<LeafnoteStatus>('local-only')
const selectedTag = shallowRef<string | null>(null)
const recentlyDeletedNote = ref<Note | null>(null)
const showUndo = ref(false)
let undoTimer: ReturnType<typeof setTimeout> | undefined

onMounted(async () => {
  await loadNotes()
  loadCustomTags()
})

const filteredNotes = computed(() => getNoteList(notes.value, selectedTag.value))

function openNote(note: Note) {
  navigateTo(`/notes/${note.id}`)
}

async function removeNote(note: Note) {
  recentlyDeletedNote.value = note
  showUndo.value = true
  await deleteNote(note)
  if (undoTimer) clearTimeout(undoTimer)
  undoTimer = setTimeout(() => {
    recentlyDeletedNote.value = null
    showUndo.value = false
  }, 8000)

  toast.add({
    title: 'Note deleted',
    description: 'This note was removed from this device.',
    duration: 8000
  })
}

async function undoDelete() {
  if (!recentlyDeletedNote.value) return

  const note = recentlyDeletedNote.value
  recentlyDeletedNote.value = null
  showUndo.value = false
  if (undoTimer) clearTimeout(undoTimer)
  await restoreNote(note)
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

    <main class="p-4 pb-24">
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

    <div
      v-if="showUndo"
      class="mobile-fixed-full fixed bottom-4 z-20 px-4"
      role="status"
    >
      <div class="flex items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-lg">
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium text-foreground">
            Note deleted
          </p>
          <p class="text-xs text-muted-foreground">
            This note was removed from this device.
          </p>
        </div>
        <button
          type="button"
          class="rounded-md px-3 py-1.5 text-sm font-medium text-leaf-600 hover:bg-leaf-50 focus-ring"
          @click="undoDelete"
        >
          Undo
        </button>
      </div>
    </div>

    <LeafnoteFloatingActionButton @click="navigateTo('/notes/new')" />
  </div>
</template>
