import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],

  test: {
    // Use happy-dom for a lightweight browser-like environment
    environment: 'happy-dom',

    // Global test utilities (describe, it, expect, etc.) without imports
    globals: true,

    // Include both unit and integration test files
    include: ['tests/unit/**/*.{test,spec}.{ts,js}', 'tests/integration/**/*.{test,spec}.{ts,js}', '**/*.{test,spec}.{ts,js}'],

    // Exclude E2E tests (those are run by Playwright)
    exclude: ['tests/e2e/**', 'node_modules/**', '.nuxt/**', '.output/**'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['composables/**/*.ts', 'stores/**/*.ts', 'utils/**/*.ts', 'server/**/*.ts'],
      exclude: ['node_modules/**', '.nuxt/**', '.output/**', 'tests/**']
    },

    // Resolve aliases matching Nuxt's auto-imports
    alias: {
      '~': resolve(__dirname, '.'),
      '@': resolve(__dirname, '.')
    }
  },

  resolve: {
    alias: {
      '~': resolve(__dirname, '.'),
      '@': resolve(__dirname, '.')
    }
  }
})
