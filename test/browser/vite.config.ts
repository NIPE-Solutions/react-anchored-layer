import { defineConfig } from 'vite'

export default defineConfig({
  root: 'test/browser',
  server: {
    host: '127.0.0.1',
    port: 4187,
    strictPort: true,
  },
})
