import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
// `vitest/config` re-exports vite's `defineConfig` with the `test` key typed.
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  // Tailwind must run before Vite 8's CSS pipeline so `@import "tailwindcss"`
  // reaches `@tailwindcss/vite` generate:serve instead of being flattened
  // into an unexpanded `@tailwind utilities` stub.
  plugins: [tailwindcss(), react()],
  css: {
    transformer: 'postcss',
  },
  server: {
    port: 5173,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
