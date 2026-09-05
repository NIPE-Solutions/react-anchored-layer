import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  root: 'website',
  build: { outDir: 'dist', emptyOutDir: true },
  resolve: {
    alias: {
      '@nipe-solutions/react-anchored-layer': resolve(
        import.meta.dirname,
        '../src/index.ts',
      ),
    },
  },
})
