import type { User, Session, AuthError } from '@supabase/supabase-js'

export interface AuthResult {
  error: AuthError | null
}

export interface UseAuth {
  user: Ref<User | null>
  session: Ref<Session | null>
  signInWithEmail(email: string, password: string): Promise<AuthResult>
  signUpWithEmail(email: string, password: string): Promise<AuthResult>
  signInWithGoogle(): Promise<void>
  signOut(): Promise<void>
  refreshSession(): Promise<Session | null>
}

/**
 * Auth composable — wraps @nuxtjs/supabase auth methods and keeps the Pinia
 * auth store in sync via onAuthStateChange.
 *
 * Requirements: 1.1, 1.4, 1.5, 1.6, 1.7, 1.9, 1.10
 */
export const useAuth = (): UseAuth => {
  const supabase = useSupabaseClient()
  // useSupabaseUser() provides a reactive ref that @nuxtjs/supabase keeps in sync
  // with the Supabase session. We also mirror state into the Pinia store so the
  // rest of the app can access it without importing the composable.
  useSupabaseUser()
  const authStore = useAuthStore()
  const router = useRouter()

  // Derive reactive refs from the Pinia store so callers get reactivity
  const user = computed(() => authStore.user) as Ref<User | null>
  const session = computed(() => authStore.session) as Ref<Session | null>

  // ─── Auth state listener ────────────────────────────────────────────────────
  // Wire onAuthStateChange once per composable instance. The listener updates
  // the Pinia store and redirects to /login when the session is cleared.
  supabase.auth.onAuthStateChange((event, newSession) => {
    authStore.setSession(newSession)
    authStore.setUser(newSession?.user ?? null)

    if (event === 'SIGNED_OUT' || (event === 'TOKEN_REFRESHED' && !newSession)) {
      authStore.clearAuth()
      router.push('/login')
    }

    if (event === 'USER_UPDATED' && newSession) {
      authStore.setUser(newSession.user)
    }
  })

  // ─── Actions ────────────────────────────────────────────────────────────────

  /**
   * Sign in with email and password.
   * Returns { error } — never throws.
   * Requirement 1.1
   */
  async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (!error && data.session) {
      authStore.setSession(data.session)
      authStore.setUser(data.user)
    }
    return { error }
  }

  /**
   * Register a new account with email and password.
   * Returns { error } — never throws.
   * Requirement 1.1, 1.8
   */
  async function signUpWithEmail(email: string, password: string): Promise<AuthResult> {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (!error && data.session) {
      authStore.setSession(data.session)
      authStore.setUser(data.user ?? null)
    }
    return { error }
  }

  /**
   * Initiate Google OAuth flow.
   * Redirects the browser to Google; on success Supabase redirects back to /confirm.
   * Requirement 1.7
   */
  async function signInWithGoogle(): Promise<void> {
    const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/confirm` : '/confirm'

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo }
    })
  }

  /**
   * Sign out the current user, clear the auth store, and navigate to /login.
   * Requirement 1.6
   */
  async function signOut(): Promise<void> {
    await supabase.auth.signOut()
    authStore.clearAuth()
    await router.push('/login')
  }

  /**
   * Refresh the current session using the stored refresh token.
   * Returns the new Session or null if the refresh token is invalid/expired.
   * Requirement 1.4, 1.5
   */
  async function refreshSession(): Promise<Session | null> {
    const { data, error } = await supabase.auth.refreshSession()
    if (error || !data.session) {
      // Refresh token is invalid or expired — clear session and redirect
      authStore.clearAuth()
      await router.push('/login')
      return null
    }
    authStore.setSession(data.session)
    authStore.setUser(data.user)
    return data.session
  }

  return {
    user,
    session,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
    refreshSession
  }
}
