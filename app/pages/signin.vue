<script setup lang="ts">
const isLoading = shallowRef<'google' | 'apple' | null>(null)

async function signIn(provider: 'google' | 'apple') {
  isLoading.value = provider
  await new Promise(resolve => setTimeout(resolve, 1000))
  isLoading.value = null
  await navigateTo('/notes')
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-background px-6 safe-top safe-bottom">
    <header class="pt-2">
      <button
        type="button"
        class="p-2 -ml-2 rounded-lg hover:bg-secondary transition-colors focus-ring"
        aria-label="Go back"
        @click="navigateTo('/')"
      >
        <UIcon name="i-lucide-arrow-left" class="w-5 h-5 text-muted-foreground" />
      </button>
    </header>

    <div class="flex-1 flex flex-col items-center justify-center">
      <div class="mb-6 animate-scale-in">
        <LeafnoteLeafIcon size="lg" />
      </div>

      <h1 class="text-2xl font-semibold text-foreground mb-2 animate-fade-in">
        Sign in to sync
      </h1>
      <p class="text-muted-foreground text-center mb-10 animate-fade-in max-w-[280px]">
        Keep your notes safe and access them from any device
      </p>

      <div class="w-full max-w-sm space-y-3 animate-slide-up">
        <button
          type="button"
          class="w-full h-12 text-base font-medium rounded-lg border border-input bg-card hover:bg-secondary inline-flex items-center justify-center transition-colors disabled:opacity-50 focus-ring"
          :disabled="isLoading !== null"
          @click="signIn('google')"
        >
          <LeafnoteGoogleLogo class="w-5 h-5 mr-3" />
          {{ isLoading === 'google' ? 'Signing in...' : 'Continue with Google' }}
        </button>

        <button
          type="button"
          class="w-full h-12 text-base font-medium rounded-lg bg-foreground text-background hover:bg-foreground/90 inline-flex items-center justify-center transition-colors disabled:opacity-50 focus-ring"
          :disabled="isLoading !== null"
          @click="signIn('apple')"
        >
          <LeafnoteAppleLogo class="w-5 h-5 mr-3" />
          {{ isLoading === 'apple' ? 'Signing in...' : 'Continue with Apple' }}
        </button>
      </div>
    </div>

    <div class="py-8 animate-fade-in">
      <div class="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <UIcon name="i-lucide-lock" class="w-4 h-4" />
        <span>Your notes are encrypted and private</span>
      </div>
    </div>
  </div>
</template>
