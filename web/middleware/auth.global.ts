/**
 * Global auth middleware
 *
 * - Unauthenticated users are redirected to /login (except /login and /confirm).
 * - Authenticated users whose email is not yet verified are redirected to
 *   /login?verify=1 (except /login and /confirm).
 *
 * Requirements: 1.3, 1.8, 1.10
 */
export default defineNuxtRouteMiddleware((to) => {
  // Routes that are always accessible without authentication
  const publicRoutes = ['/login', '/confirm']
  if (publicRoutes.includes(to.path)) return

  const authStore = useAuthStore()

  // Not authenticated → redirect to login
  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }

  // Authenticated but email not verified → redirect to login with verify flag
  // Requirement 1.8: enforce email verification before granting full access
  if (!authStore.isEmailVerified) {
    return navigateTo('/login?verify=1')
  }
})
