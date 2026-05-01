// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',

  devtools: { enabled: true },

  // Modules
  modules: ['@nuxtjs/supabase', '@pinia/nuxt', '@nuxtjs/tailwindcss', '@vite-pwa/nuxt'],

  // TypeScript
  typescript: {
    strict: true,
    typeCheck: false
  },

  // Nitro / Vercel deployment
  // Use 'vercel' (Node.js runtime) rather than 'vercel-edge' because
  // @nuxtjs/supabase relies on Node.js APIs (cookies, headers) that are
  // not available in the Vercel Edge Runtime.
  nitro: {
    preset: 'vercel'
  },

  // Runtime config — values are injected from environment variables
  runtimeConfig: {
    // Private keys (server-side only)
    supabaseServiceKey: '',

    // Public keys (exposed to the client)
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL ?? '',
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
    }
  },

  // Supabase module config
  supabase: {
    url: process.env.NUXT_PUBLIC_SUPABASE_URL,
    key: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY,
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      // Exclude both /login and /confirm from auth redirects so the OAuth
      // callback page can establish the session before being redirected.
      exclude: ['/login', '/confirm']
    }
  },

  // PWA configuration
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Audiobookshelf',
      short_name: 'ABS',
      description: 'Your personal audiobook and ebook library',
      theme_color: '#1a1a2e',
      background_color: '#1a1a2e',
      display: 'standalone',
      start_url: '/',
      scope: '/',
      icons: [
        {
          src: '/icons/icon-192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/icons/icon-512.png',
          sizes: '512x512',
          type: 'image/png'
        },
        {
          src: '/icons/icon-512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
        }
      ]
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      runtimeCaching: [
        {
          // App shell — stale while revalidate
          urlPattern: /^\//,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'abs-app-shell-v1'
          }
        },
        {
          // Cover images — cache first, 30-day expiry
          urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/v1\/object\/public\/covers\//,
          handler: 'CacheFirst',
          options: {
            cacheName: 'abs-covers-v1',
            expiration: {
              maxAgeSeconds: 60 * 60 * 24 * 30
            }
          }
        },
        {
          // Audio files — network first, fall back to cache
          urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/v1\/object\/sign\//,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'abs-audio-v1',
            networkTimeoutSeconds: 10
          }
        }
      ]
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 3600
    },
    devOptions: {
      enabled: false,
      suppressWarnings: true,
      navigateFallbackAllowlist: [/^\/$/],
      type: 'module'
    }
  },

  // App config
  app: {
    head: {
      title: 'Audiobookshelf',
      meta: [{ charset: 'utf-8' }, { name: 'viewport', content: 'width=device-width, initial-scale=1' }, { name: 'description', content: 'Your personal audiobook and ebook library' }, { name: 'theme-color', content: '#1a1a2e' }],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'manifest', href: '/manifest.webmanifest' }
      ]
    }
  }
})
