import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Explicitly map 'lenis' to its ESM dist to fix resolution errors in some environments
      'lenis': 'lenis/dist/lenis.mjs'
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
  },
})
