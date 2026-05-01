import { defineStore } from 'pinia'
import type { User, Session } from '@supabase/supabase-js'

export interface AuthState {
  user: User | null
  session: Session | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    session: null
  }),

  getters: {
    /**
     * Returns true when there is an active session with a valid user.
     */
    isAuthenticated: (state): boolean => {
      return state.session !== null && state.user !== null
    },

    /**
     * Returns true when the user has confirmed their email address.
     * Supabase sets `email_confirmed_at` once the verification link is clicked.
     */
    isEmailVerified: (state): boolean => {
      return state.user?.email_confirmed_at != null
    }
  },

  actions: {
    setUser(user: User | null) {
      this.user = user
    },

    setSession(session: Session | null) {
      this.session = session
    },

    clearAuth() {
      this.user = null
      this.session = null
    }
  }
})
