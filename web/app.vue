<template>
  <!-- Root layout: applies the dark theme class and renders the current page -->
  <div
    :class="themeClass"
    class="min-h-screen bg-background-dark text-slate-100 antialiased"
  >
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Theme preference is stored in the user preferences store once auth is set up.
// For now we default to dark mode (the app's primary design target).
const colorMode = ref<'light' | 'dark' | 'system'>('dark')

const themeClass = computed(() => {
  if (colorMode.value === 'dark') return 'dark'
  if (colorMode.value === 'light') return ''
  // 'system' — let the OS decide via the prefers-color-scheme media query
  return ''
})
</script>
