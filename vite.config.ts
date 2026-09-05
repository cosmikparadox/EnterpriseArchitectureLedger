import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Static build, no backend, no runtime network calls. Spec section 2.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: { outDir: 'dist', assetsInlineLimit: 0 },
  worker: { format: 'es' },
})
