<script setup lang="ts">
const props = defineProps<{
  selectedTags: string[]
  availableTags: string[]
}>()

const emit = defineEmits<{
  'update:selected-tags': [tags: string[]]
  'add-custom-tag': [tag: string]
}>()

const isAddingTag = shallowRef(false)
const newTagName = shallowRef('')

function toggleTag(tag: string) {
  if (props.selectedTags.includes(tag)) {
    emit('update:selected-tags', props.selectedTags.filter(item => item !== tag))
    return
  }

  emit('update:selected-tags', [...props.selectedTags, tag])
}

function addTag() {
  const trimmed = newTagName.value.trim().toLowerCase()
  if (!trimmed) return

  if (!props.availableTags.includes(trimmed)) {
    emit('add-custom-tag', trimmed)
  }

  if (!props.selectedTags.includes(trimmed)) {
    emit('update:selected-tags', [...props.selectedTags, trimmed])
  }

  newTagName.value = ''
  isAddingTag.value = false
}

function cancelAdd() {
  isAddingTag.value = false
  newTagName.value = ''
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex flex-wrap gap-2">
      <button
        v-for="tag in availableTags"
        :key="tag"
        type="button"
        :class="[
          'px-3 py-1.5 rounded-full text-sm transition-all border focus-ring',
          selectedTags.includes(tag)
            ? 'bg-leaf-500 text-primary-foreground border-leaf-500'
            : 'bg-transparent text-muted-foreground border-border hover:border-leaf-300 hover:text-foreground'
        ]"
        @click="toggleTag(tag)"
      >
        {{ tag }}
      </button>

      <div
        v-if="isAddingTag"
        class="flex items-center gap-1"
      >
        <input
          v-model="newTagName"
          type="text"
          placeholder="New tag..."
          class="h-8 w-28 text-sm rounded-md border border-input bg-card px-3 outline-none focus-ring"
          autofocus
          @keydown.enter.prevent="addTag"
          @keydown.escape="cancelAdd"
          @blur="!newTagName.trim() && (isAddingTag = false)"
        >
        <button
          type="button"
          class="p-1.5 rounded-full bg-leaf-500 text-primary-foreground hover:bg-leaf-600 transition-colors"
          aria-label="Add tag"
          @click="addTag"
        >
          <UIcon
            name="i-lucide-plus"
            class="w-3.5 h-3.5"
          />
        </button>
        <button
          type="button"
          class="p-1.5 rounded-full hover:bg-secondary transition-colors"
          aria-label="Cancel"
          @click="cancelAdd"
        >
          <UIcon
            name="i-lucide-x"
            class="w-3.5 h-3.5"
          />
        </button>
      </div>

      <button
        v-else
        type="button"
        class="px-3 py-1.5 rounded-full text-sm transition-all border border-dashed border-border hover:border-leaf-400 text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"
        @click="isAddingTag = true"
      >
        <UIcon
          name="i-lucide-plus"
          class="w-3.5 h-3.5"
        />
        New tag
      </button>
    </div>
  </div>
</template>
