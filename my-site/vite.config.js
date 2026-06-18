// Vite build config — React + image optimization for GitHub Pages.
// ViteImageOptimizer runs sharp on all images at build time to reduce file
// sizes. PNG stays lossless; JPEG uses lossy compression.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
import sharp from 'sharp'
import { readdirSync, statSync } from 'fs'
import { join, relative, extname } from 'path'

// Recursively collect all image file paths under a directory.
function getAllImageFiles(dir, exts) {
  const results = []
  try {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry)
      if (statSync(full).isDirectory()) {
        results.push(...getAllImageFiles(full, exts))
      } else if (exts.has(extname(entry).toLowerCase())) {
        results.push(full)
      }
    }
  } catch { /* directory may not exist */ }
  return results
}

// Virtual module `virtual:gallery-dimensions` — exports an object mapping
// each image's src-root-relative path to its { width, height } in pixels.
// Both gallery and jalloseum asset directories are scanned.
function galleryDimensionsPlugin() {
  const VIRTUAL_ID = 'virtual:gallery-dimensions'
  const RESOLVED   = '\0' + VIRTUAL_ID
  return {
    name: 'gallery-dimensions',
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED
    },
    async load(id) {
      if (id !== RESOLVED) return
      const root = process.cwd()
      const exts = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif'])
      const dirs = [
        join(root, 'src', 'assets', 'gallery'),
        join(root, 'src', 'assets', 'jalloseum'),
      ]
      const allFiles = dirs.flatMap(dir => getAllImageFiles(dir, exts))
      const dimensions = {}
      await Promise.all(allFiles.map(async (filePath) => {
        const key = relative(root, filePath).replace(/\\/g, '/')
        try {
          const meta = await sharp(filePath).metadata()
          if (meta.width && meta.height) {
            dimensions[key] = { width: meta.width, height: meta.height }
          }
        } catch { /* skip unreadable files */ }
      }))
      return `export default ${JSON.stringify(dimensions)}`
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    galleryDimensionsPlugin(),
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
