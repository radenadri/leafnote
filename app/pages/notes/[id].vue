<script setup lang="ts">
import { createLeafnoteEditorSession } from '~/services/leafnote-editor-session'
import { createLeafnoteLocalStore } from '~/services/leafnote-local-store'

const route = useRoute()
const { allTags, loadNotes, loadCustomTags, addCustomTag, findNote } = useLeafnote()
const localStore = createLeafnoteLocalStore()

const id = computed(() => String(route.params.id))
const isTagSheetOpen = shallowRef(false)
const session = shallowRef<ReturnType<typeof createLeafnoteEditorSession>>()
const noteState = shallowRef<{ title: string, content: string, tags: string[] }>({
  title: '',
  content: '',
  tags: []
})

const title = computed({
  get: () => noteState.value.title,
  set: (value) => {
    noteState.value = { ...noteState.value, title: value }
    session.value?.setTitle(value)
  }
})
const content = computed({
  get: () => noteState.value.content,
  set: (value) => {
    noteState.value = { ...noteState.value, content: value }
    session.value?.setContent(value)
  }
})
const tags = computed({
  get: () => noteState.value.tags,
  set: (value) => {
    noteState.value = { ...noteState.value, tags: value }
    session.value?.setTags(value)
  }
})
const syncStatus = computed(() => session.value?.status.value ?? 'local-only')

onMounted(async () => {
  await loadNotes()
  loadCustomTags()

  const existingNote = id.value === 'new' ? undefined : findNote(id.value)
  session.value = createLeafnoteEditorSession({
    store: localStore,
    noteId: id.value === 'new' ? crypto.randomUUID() : id.value,
    initialNote: existingNote
  })

  noteState.value = {
    title: session.value.note.value.title,
    content: session.value.note.value.content,
    tags: [...session.value.note.value.tags]
  }
})

onBeforeUnmount(() => {
  void session.value?.saveNow()
  session.value?.dispose()
})

async function saveNow() {
  await session.value?.saveNow()
}

async function goBack() {
  await saveNow()
  await navigateTo('/notes')
}

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
        @click="goBack"
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
        @blur="saveNow"
      >

      <textarea
        v-model="content"
        placeholder="Start writing..."
        class="w-full flex-1 min-h-[60vh] text-note-body font-serif text-foreground bg-transparent border-none outline-none resize-none placeholder:text-ink-faint leading-relaxed"
        @blur="saveNow"
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
