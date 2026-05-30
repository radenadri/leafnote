<script setup lang="ts">
import { searchNotes } from '~/services/leafnote-note-query'
import type { Note } from '~/types/note'

const { notes, loadNotes } = useLeafnote()
const query = shallowRef('')

onMounted(loadNotes)

const filteredNotes = computed(() => searchNotes(notes.value, query.value))

function openNote(note: Note) {
  navigateTo(`/notes/${note.id}`)
}
</script>

<template>
  <div class="min-h-screen bg-background safe-top">
    <header class="sticky top-0 z-10 bg-background border-b border-border/50">
      <div class="flex items-center gap-2 px-2 py-2">
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

        <div class="flex-1 relative">
          <UIcon
            name="i-lucide-search"
            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
          />
          <input
            v-model="query"
            type="text"
            placeholder="Search notes..."
            class="w-full pl-9 h-10 bg-card border border-border/50 rounded-md px-3 focus-ring outline-none"
            autofocus
          >
        </div>
      </div>
    </header>

    <main class="px-4 py-4">
      <div
        v-if="query.trim() === ''"
        class="text-center py-16 animate-fade-in"
      >
        <UIcon
          name="i-lucide-search"
          class="w-12 h-12 text-muted-foreground/30 mx-auto mb-4"
        />
        <p class="text-muted-foreground">
          Search your notes
        </p>
      </div>

      <div
        v-else-if="filteredNotes.length === 0"
        class="text-center py-16 animate-fade-in"
      >
        <p class="text-muted-foreground">
          No notes found for "{{ query }}"
        </p>
      </div>

      <div
        v-else
        class="space-y-3"
      >
        <p class="text-sm text-muted-foreground mb-4">
          {{ filteredNotes.length }} {{ filteredNotes.length === 1 ? 'result' : 'results' }}
        </p>
        <LeafnoteNoteCard
          v-for="(note, index) in filteredNotes"
          :key="note.id"
          :note="note"
          :style="{ animationDelay: `${index * 0.05}s` }"
          @open="openNote"
        />
      </div>
    </main>
  </div>
</template>
