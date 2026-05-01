<template>
  <main class="flex min-h-screen flex-col bg-background-dark">
    <h1 class="sr-only">Ebook Reader</h1>
    <!-- Ebook reader will be implemented in Task 9 -->
  </main>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const itemId = computed(() => route.params.id as string)
</script>
