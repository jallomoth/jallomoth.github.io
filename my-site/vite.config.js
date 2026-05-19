// Vite build config — React + image optimization for GitHub Pages.
// ViteImageOptimizer runs sharp on all images at build time to reduce file
// sizes. PNG stays lossless; JPEG uses lossy compression.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    ViteImageOptimizer({
      // Lossless PNG compression (reduces file size with no quality loss)
      png: { quality: 85 },
      // Lossy JPEG compression
      jpg:  { quality: 85 },
      jpeg: { quality: 85 },
      // Optimise any WebP assets that already exist
      webp: { lossless: true },
      // Optimise any AVIF assets
      avif: { lossless: true },
      // Include files in public/ as well as src/assets/
      includePublic: true,
    }),
  ],
  base: '/',
})
