import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['test/unit/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: ['./test/unit/setup.ts'],
  },
})
