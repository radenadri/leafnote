<script setup lang="ts">
const props = withDefaults(defineProps<{
  size?: 'sm' | 'md' | 'lg'
  class?: string
}>(), {
  size: 'md',
  class: ''
})

const sizeClass = computed(() => ({
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12'
}[props.size]))
</script>

<template>
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :class="[sizeClass, props.class]"
  >
    <path
      d="M16 4C16 4 8 8 8 18C8 24 11 28 16 28C21 28 24 24 24 18C24 8 16 4 16 4Z"
      class="fill-primary"
    />
    <path d="M16 8V24" class="stroke-primary-foreground" stroke-width="1.5" stroke-linecap="round" />
    <path d="M16 12L12 15" class="stroke-primary-foreground" stroke-width="1.5" stroke-linecap="round" />
    <path d="M16 16L20 18" class="stroke-primary-foreground" stroke-width="1.5" stroke-linecap="round" />
    <path d="M16 20L13 22" class="stroke-primary-foreground" stroke-width="1.5" stroke-linecap="round" />
  </svg>
</template>
