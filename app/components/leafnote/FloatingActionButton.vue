<script setup lang="ts">
defineEmits<{
  click: []
}>()
</script>

<template>
  <button
    type="button"
    class="mobile-fab fixed bottom-6 right-8 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-fab hover:shadow-lg inline-flex items-center justify-center transition-all duration-200 ease-out hover:scale-105 active:scale-95 focus-ring"
    style="padding-bottom: env(safe-area-inset-bottom, 0px)"
    aria-label="Create new note"
    @click="$emit('click')"
  >
    <UIcon name="i-lucide-plus" class="w-6 h-6 flex-shrink-0 stroke-[2.5]" />
  </button>
</template>
