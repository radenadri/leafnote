<script setup lang="ts">
import type { SyncStatus } from '~/types/note'

const route = useRoute()
const { allTags, loadNotes, loadCustomTags, addCustomTag, findNote } = useLeafnote()

const id = computed(() => String(route.params.id))
const isNewNote = computed(() => id.value === 'new')

const title = shallowRef('')
const content = shallowRef('')
const tags = ref<string[]>([])
const syncStatus = shallowRef<SyncStatus>('offline')
const isTagSheetOpen = shallowRef(false)
let syncTimer: ReturnType<typeof setTimeout> | undefined

onMounted(async () => {
  await loadNotes()
  loadCustomTags()

  if (!isNewNote.value) {
    const note = findNote(id.value)
    if (note) {
      title.value = note.title
      content.value = note.content
      tags.value = [...note.tags]
    }
  }
})

watch([title, content, tags], () => {
  if (!title.value && !content.value) return

  syncStatus.value = 'syncing'
  if (syncTimer) clearTimeout(syncTimer)
  syncTimer = setTimeout(() => {
    syncStatus.value = 'offline'
  }, 1000)
}, { deep: true })

onBeforeUnmount(() => {
  if (syncTimer) clearTimeout(syncTimer)
})

function removeTag(tag: string) {
  tags.value = tags.value.filter(item => item !== tag)
}
</script>

<template>
  <div class="min-h-screen bg-background flex flex-col safe-top">
    <header class="flex items-center justify-between px-2 py-2 border-b border-border/30">
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

      <div class="flex items-center gap-2">
        <LeafnoteSyncIndicator :status="syncStatus" />

        <button
          type="button"
          class="p-2 rounded-lg hover:bg-secondary transition-colors focus-ring relative"
          aria-label="Manage tags"
          @click="isTagSheetOpen = true"
        >
          <UIcon
            name="i-lucide-tag"
            class="w-5 h-5 text-muted-foreground"
          />
          <span
            v-if="tags.length > 0"
            class="absolute -top-0.5 -right-0.5 w-4 h-4 bg-leaf-500 text-primary-foreground text-[10px] rounded-full flex items-center justify-center"
          >
            {{ tags.length }}
          </span>
        </button>
      </div>
    </header>

    <main class="flex-1 px-4 py-4 pb-20 animate-fade-in">
      <input
        v-model="title"
        type="text"
        placeholder="Title"
        class="w-full text-note-title font-serif font-semibold text-foreground bg-transparent border-none outline-none placeholder:text-ink-faint mb-4"
      >

      <textarea
        v-model="content"
        placeholder="Start writing..."
        class="w-full flex-1 min-h-[60vh] text-note-body font-serif text-foreground bg-transparent border-none outline-none resize-none placeholder:text-ink-faint leading-relaxed"
      />
    </main>

    <LeafnoteEditorToolbar
      @bold="console.log('Bold clicked')"
      @heading="console.log('Heading clicked')"
      @checklist="console.log('Checklist clicked')"
    />

    <USlideover
      v-model:open="isTagSheetOpen"
      side="bottom"
      title="Tags"
      :ui="{ content: 'rounded-t-2xl h-auto max-h-[80vh]' }"
    >
      <template #body>
        <div class="py-4">
          <LeafnoteTagPicker
            :selected-tags="tags"
            :available-tags="allTags"
            @update:selected-tags="tags = $event"
            @add-custom-tag="addCustomTag"
          />
        </div>
        <div
          v-if="tags.length > 0"
          class="flex flex-wrap gap-2 pt-4 border-t border-border"
        >
          <LeafnoteTagBadge
            v-for="tag in tags"
            :key="tag"
            :tag="tag"
            size="md"
            removable
            @remove="removeTag(tag)"
          />
        </div>
      </template>
    </USlideover>
  </div>
</template>
