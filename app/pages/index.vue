<script setup lang="ts">
import { getWelcomeEntryPoint } from '~/services/leafnote-entrypoints'

const entryPoint = getWelcomeEntryPoint()

function go(path: string) {
  navigateTo(path)
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-background px-6 safe-top safe-bottom">
    <div class="flex-1 flex flex-col items-center justify-center pt-12">
      <div class="mb-8 animate-scale-in">
        <LeafnoteLeafIcon size="lg" />
      </div>

      <h1 class="text-2xl font-semibold text-foreground mb-2 animate-fade-in">
        {{ entryPoint.headline }}
      </h1>
      <p class="text-muted-foreground text-center mb-10 animate-fade-in max-w-[280px]">
        {{ entryPoint.description }}
      </p>

      <div class="w-full max-w-sm space-y-3 animate-slide-up">
        <button
          type="button"
          class="w-full h-12 text-base font-medium rounded-lg bg-primary text-primary-foreground inline-flex items-center justify-center hover:bg-primary/90 transition-colors focus-ring"
          @click="go(entryPoint.primaryAction.route)"
        >
          {{ entryPoint.primaryAction.label }}
          <UIcon
            name="i-lucide-arrow-right"
            class="w-4 h-4 ml-2"
          />
        </button>

        <button
          type="button"
          class="w-full h-12 text-base font-medium rounded-lg border border-input bg-background hover:bg-secondary transition-colors focus-ring"
          @click="go(entryPoint.secondaryAction.route)"
        >
          {{ entryPoint.secondaryAction.label }}
        </button>
      </div>
    </div>

    <div class="py-8 animate-fade-in">
      <div class="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <UIcon
          name="i-lucide-lock"
          class="w-4 h-4"
        />
        <span>{{ entryPoint.footer }}</span>
      </div>
    </div>
  </div>
</template>
