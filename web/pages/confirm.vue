<template>
  <main
    class="flex min-h-screen flex-col items-center justify-center gap-4 bg-background-dark px-4"
  >
    <div class="flex flex-col items-center gap-4 text-center">
      <!-- Spinner -->
      <svg
        class="h-10 w-10 animate-spin text-accent-500"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>

      <p class="text-lg font-medium text-slate-200">Completing sign-in…</p>
      <p class="text-sm text-slate-400">Please wait while we establish your session.</p>

      <!-- Error state -->
      <div
        v-if="errorMessage"
        class="mt-4 rounded-lg bg-red-900/40 px-4 py-3 text-sm text-red-300 ring-1 ring-red-700"
        role="alert"
      >
        {{ errorMessage }}
        <NuxtLink to="/login" class="ml-2 underline hover:text-red-200">Back to login</NuxtLink>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
/**
 * OAuth callback page — handles the redirect from Supabase after Google OAuth.
 *
 * @nuxtjs/supabase automatically exchanges the code/token in the URL hash for
 * a session when the page loads. We just need to wait for the user ref to be
 * populated and then redirect to the home page.
 *
 * Requirements: 1.7, 1.10
 */
definePageMeta({
  layout: false
})

const router = useRouter()
const supabaseUser = useSupabaseUser()
const errorMessage = ref<string | null>(null)

// Wait for the session to be established (up to 10 seconds)
onMounted(async () => {
  const supabase = useSupabaseClient()
  const authStore = useAuthStore()

  // Give the Supabase client a moment to process the OAuth callback tokens
  // that are present in the URL hash/query params
  let attempts = 0
  const maxAttempts = 20 // 20 × 500 ms = 10 s

  const poll = setInterval(async () => {
    attempts++

    const {
      data: { session }
    } = await supabase.auth.getSession()

    if (session) {
      clearInterval(poll)
      authStore.setSession(session)
      authStore.setUser(session.user)
      await router.push('/')
      return
    }

    if (attempts >= maxAttempts) {
      clearInterval(poll)
      errorMessage.value =
        'Sign-in timed out. The link may have expired or already been used.'
    }
  }, 500)
})
</script>
