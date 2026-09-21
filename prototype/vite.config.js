import { defineConfig } from 'vite'
import path from 'node:path'
import react from '@vitejs/plugin-react'

// The prototype imports the real catalog JSON from the marketplace repo's
// src/data/suppliers/ — one source of truth, no data copies. The dev-server
// fs.allow keeps those imports servable outside this app root; production
// builds bundle them statically either way.
export default defineConfig({
  plugins: [react()],
  // Plain-CSS app: inline empty PostCSS config so Vite does not pick up the
  // parent marketplace repo's tailwindcss postcss.config.mjs.
  css: {
    postcss: {},
  },
  server: {
    fs: {
      allow: [path.resolve(__dirname, '..')],
    },
  },
})
