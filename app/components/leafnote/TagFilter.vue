<script setup lang="ts">
withDefaults(defineProps<{
  selectedTag: string | null
  availableTags?: string[]
}>(), {
  availableTags: () => []
})

const emit = defineEmits<{
  select: [tag: string | null]
}>()
</script>

<template>
  <div class="flex gap-2 overflow-x-auto py-2 px-4 -mx-4 scrollbar-hide">
    <button
      type="button"
      :class="[
        'px-3 py-1 rounded-full text-sm whitespace-nowrap transition-all border focus-ring flex-shrink-0',
        selectedTag === null
          ? 'bg-leaf-500 text-primary-foreground border-leaf-500'
          : 'bg-transparent text-muted-foreground border-border hover:border-leaf-300'
      ]"
      @click="emit('select', null)"
    >
      All
    </button>

    <button
      v-for="tag in availableTags"
      :key="tag"
      type="button"
      :class="[
        'px-3 py-1 rounded-full text-sm whitespace-nowrap transition-all border focus-ring flex-shrink-0',
        selectedTag === tag
          ? 'bg-leaf-500 text-primary-foreground border-leaf-500'
          : 'bg-transparent text-muted-foreground border-border hover:border-leaf-300'
      ]"
      @click="emit('select', tag)"
    >
      {{ tag }}
    </button>
  </div>
</template>
