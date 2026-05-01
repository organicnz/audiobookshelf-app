<template>
  <main class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold text-slate-100">Settings</h1>
    <!-- User preferences will be implemented in Task 11 -->
  </main>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})
</script>
