<template>
  <main class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold text-slate-100">Library Item</h1>
    <!-- Item detail view will be implemented in Task 4 -->
  </main>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const itemId = computed(() => route.params.id as string)
</script>
