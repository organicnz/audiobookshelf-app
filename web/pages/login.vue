<template>
  <main class="flex min-h-screen items-center justify-center bg-background-dark px-4 py-12">
    <div class="w-full max-w-md">
      <!-- Logo / branding -->
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold text-slate-100">Audiobookshelf</h1>
        <p class="mt-2 text-sm text-slate-400">Your personal audiobook &amp; ebook library</p>
      </div>

      <!-- Card -->
      <div class="rounded-2xl bg-primary-800 p-8 shadow-2xl ring-1 ring-primary-700">
        <!-- Tab switcher: Sign In / Sign Up -->
        <div class="mb-6 flex rounded-lg bg-primary-900 p-1">
          <button
            type="button"
            class="flex-1 rounded-md py-2 text-sm font-medium transition-colors"
            :class="
              mode === 'signin'
                ? 'bg-accent-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            "
            @click="mode = 'signin'"
          >
            Sign In
          </button>
          <button
            type="button"
            class="flex-1 rounded-md py-2 text-sm font-medium transition-colors"
            :class="
              mode === 'signup'
                ? 'bg-accent-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            "
            @click="mode = 'signup'"
          >
            Sign Up
          </button>
        </div>

        <!-- Email verification success banner -->
        <div
          v-if="showVerifyBanner"
          class="mb-4 rounded-lg bg-accent-900/50 px-4 py-3 text-sm text-accent-300 ring-1 ring-accent-700"
          role="status"
        >
          <span class="font-medium">Check your email.</span> We sent a verification link to
          <span class="font-medium">{{ lastEmail }}</span
          >. Please verify your email before signing in.
        </div>

        <!-- Verify query param banner (redirected from middleware) -->
        <div
          v-if="route.query.verify === '1' && !showVerifyBanner"
          class="mb-4 rounded-lg bg-amber-900/40 px-4 py-3 text-sm text-amber-300 ring-1 ring-amber-700"
          role="status"
        >
          Please verify your email address before accessing your library.
        </div>

        <!-- Error banner -->
        <div
          v-if="errorMessage"
          class="mb-4 rounded-lg bg-red-900/40 px-4 py-3 text-sm text-red-300 ring-1 ring-red-700"
          role="alert"
        >
          {{ errorMessage }}
        </div>

        <!-- Email / password form -->
        <form novalidate @submit.prevent="handleSubmit">
          <div class="space-y-4">
            <!-- Email -->
            <div>
              <label for="email" class="mb-1.5 block text-sm font-medium text-slate-300">
                Email address
              </label>
              <input
                id="email"
                v-model.trim="email"
                type="email"
                autocomplete="email"
                required
                placeholder="you@example.com"
                class="w-full rounded-lg bg-primary-900 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 ring-1 ring-primary-600 transition focus:outline-none focus:ring-2 focus:ring-accent-500"
                :class="{ 'ring-red-500': fieldErrors.email }"
                @blur="validateField('email')"
              />
              <p v-if="fieldErrors.email" class="mt-1 text-xs text-red-400">
                {{ fieldErrors.email }}
              </p>
            </div>

            <!-- Password -->
            <div>
              <label for="password" class="mb-1.5 block text-sm font-medium text-slate-300">
                Password
              </label>
              <div class="relative">
                <input
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  required
                  placeholder="••••••••"
                  class="w-full rounded-lg bg-primary-900 px-4 py-2.5 pr-10 text-sm text-slate-100 placeholder-slate-500 ring-1 ring-primary-600 transition focus:outline-none focus:ring-2 focus:ring-accent-500"
                  :class="{ 'ring-red-500': fieldErrors.password }"
                  @blur="validateField('password')"
                />
                <button
                  type="button"
                  class="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-200"
                  :aria-label="showPassword ? 'Hide password' : 'Show password'"
                  @click="showPassword = !showPassword"
                >
                  <svg
                    v-if="!showPassword"
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  <svg
                    v-else
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                </button>
              </div>
              <p v-if="fieldErrors.password" class="mt-1 text-xs text-red-400">
                {{ fieldErrors.password }}
              </p>
            </div>
          </div>

          <!-- Submit button -->
          <button
            type="submit"
            :disabled="loading"
            class="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-accent-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg
              v-if="loading"
              class="h-4 w-4 animate-spin"
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
            {{ mode === 'signin' ? 'Sign In' : 'Create Account' }}
          </button>
        </form>

        <!-- Divider -->
        <div class="my-6 flex items-center gap-3">
          <div class="h-px flex-1 bg-primary-700" />
          <span class="text-xs text-slate-500">or continue with</span>
          <div class="h-px flex-1 bg-primary-700" />
        </div>

        <!-- Google OAuth button -->
        <button
          type="button"
          :disabled="loading"
          class="flex w-full items-center justify-center gap-3 rounded-lg bg-primary-900 px-4 py-2.5 text-sm font-medium text-slate-200 ring-1 ring-primary-600 transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-accent-500 disabled:cursor-not-allowed disabled:opacity-60"
          @click="handleGoogleSignIn"
        >
          <!-- Google "G" logo -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            class="h-5 w-5"
            aria-hidden="true"
          >
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
            />
            <path
              fill="#4285F4"
              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
            />
            <path
              fill="#FBBC05"
              d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
            />
            <path
              fill="#34A853"
              d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
            />
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const route = useRoute()
const router = useRouter()
const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth()

// ─── Form state ──────────────────────────────────────────────────────────────
const mode = ref<'signin' | 'signup'>('signin')
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref<string | null>(null)
const showVerifyBanner = ref(false)
const lastEmail = ref('')

const fieldErrors = reactive<{ email: string | null; password: string | null }>({
  email: null,
  password: null
})

// ─── Validation ──────────────────────────────────────────────────────────────
function validateField(field: 'email' | 'password') {
  if (field === 'email') {
    if (!email.value) {
      fieldErrors.email = 'Email is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      fieldErrors.email = 'Please enter a valid email address.'
    } else {
      fieldErrors.email = null
    }
  }
  if (field === 'password') {
    if (!password.value) {
      fieldErrors.password = 'Password is required.'
    } else if (mode.value === 'signup' && password.value.length < 8) {
      fieldErrors.password = 'Password must be at least 8 characters.'
    } else {
      fieldErrors.password = null
    }
  }
}

function validateAll(): boolean {
  validateField('email')
  validateField('password')
  return !fieldErrors.email && !fieldErrors.password
}

// ─── Handlers ────────────────────────────────────────────────────────────────
async function handleSubmit() {
  errorMessage.value = null
  showVerifyBanner.value = false

  if (!validateAll()) return

  loading.value = true

  try {
    if (mode.value === 'signin') {
      const { error } = await signInWithEmail(email.value, password.value)
      if (error) {
        // Requirement 1.3: generic message — never reveal which field is wrong
        errorMessage.value = 'Invalid email or password.'
      } else {
        await router.push('/')
      }
    } else {
      const { error } = await signUpWithEmail(email.value, password.value)
      if (error) {
        errorMessage.value = 'Unable to create account. Please try again.'
      } else {
        // Requirement 1.8: email verification required
        lastEmail.value = email.value
        showVerifyBanner.value = true
        password.value = ''
      }
    }
  } finally {
    loading.value = false
  }
}

async function handleGoogleSignIn() {
  loading.value = true
  errorMessage.value = null
  try {
    await signInWithGoogle()
    // Browser will redirect to Google; no further action needed here
  } catch {
    errorMessage.value = 'Unable to sign in with Google. Please try again.'
    loading.value = false
  }
}

// Reset errors when switching modes
watch(mode, () => {
  errorMessage.value = null
  showVerifyBanner.value = false
  fieldErrors.email = null
  fieldErrors.password = null
})
</script>
