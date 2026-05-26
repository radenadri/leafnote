<script setup lang="ts">
const emit = defineEmits<{
  bold: []
  heading: []
  checklist: []
}>()

const buttons = [
  { icon: 'i-lucide-bold', label: 'Bold', action: () => emit('bold') },
  { icon: 'i-lucide-heading-2', label: 'Heading', action: () => emit('heading') },
  { icon: 'i-lucide-square-check', label: 'Checklist', action: () => emit('checklist') }
]
</script>

<template>
  <div class="fixed bottom-0 left-0 right-0 bg-background border-t border-border safe-bottom">
    <div class="flex items-center justify-center gap-2 py-2 px-4">
      <button
        v-for="button in buttons"
        :key="button.label"
        type="button"
        class="p-3 rounded-lg transition-colors hover:bg-secondary active:bg-secondary/80 focus-ring"
        :aria-label="button.label"
        @click="button.action"
      >
        <UIcon :name="button.icon" class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>
