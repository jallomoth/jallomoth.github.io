import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { copyFileSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-404',
      closeBundle() {
        // Copy 404.html to dist folder for GitHub Pages SPA routing
        const source = resolve(__dirname, 'public/404.html')
        const dest = resolve(__dirname, 'dist/404.html')
        try {
          copyFileSync(source, dest)
          console.log('✓ 404.html copied to dist/')
        } catch (err) {
          console.warn('Could not copy 404.html to dist:', err.message)
        }
      },
    },
  ],
  base: '/',
})
