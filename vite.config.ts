import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Static build, no backend, no runtime network calls. Spec section 2.
export default defineConfig({
  base: './',
  // Everything inlines into one index.html, so the build opens from a folder
  // with no toolchain and makes no network request at runtime. Spec section 2.
  plugins: [react(), viteSingleFile()],
  // three must resolve to exactly one copy. 3d-force-graph will otherwise
  // bring its own, and objects built against one instance fail inside the
  // other's renderer.
  resolve: { dedupe: ['three'] },
  build: { outDir: 'dist', assetsInlineLimit: 0 },
  worker: { format: 'es' },
})
