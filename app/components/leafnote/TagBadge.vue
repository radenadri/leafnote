<script setup lang="ts">
const props = withDefaults(defineProps<{
  tag: string
  size?: 'sm' | 'md'
  removable?: boolean
}>(), {
  size: 'sm',
  removable: false
})

const emit = defineEmits<{
  remove: []
}>()
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-1 rounded-full bg-leaf-100 text-leaf-700 transition-colors',
      props.size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
    ]"
  >
    {{ tag }}
    <button
      v-if="removable"
      type="button"
      class="ml-0.5 hover:text-leaf-900 transition-colors"
      :aria-label="`Remove ${tag} tag`"
      @click.stop="emit('remove')"
    >
      ×
    </button>
  </span>
</template>
