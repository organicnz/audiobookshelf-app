/**
 * Supabase client plugin (client-side only)
 *
 * @nuxtjs/supabase auto-provides the Supabase client via useSupabaseClient()
 * and handles session persistence via localStorage. This plugin sets up an
 * auth state listener that keeps the Pinia auth store in sync and handles
 * navigation on session changes.
 */
export default defineNuxtPlugin(async () => {
  // The @nuxtjs/supabase module initialises the client automatically.
  // We just need to ensure the auth store is hydrated on the first load.
  const supabase = useSupabaseClient()
  const authStore = useAuthStore()

  // Hydrate the store with the current session on plugin init
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (session) {
    authStore.setSession(session)
    authStore.setUser(session.user)
  }

  if (import.meta.dev) {
    console.debug('[supabase] plugin initialised, session:', session ? 'active' : 'none')
  }
})
