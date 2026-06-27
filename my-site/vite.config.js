// Vite build config — React + image optimization for GitHub Pages.
// ViteImageOptimizer runs sharp on all images at build time to reduce file
// sizes. PNG stays lossless; JPEG uses lossy compression.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
import sharp from 'sharp'
import { readdirSync, statSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
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

// Post-build plugin: generate per-route index.html files with route-specific
// OG/Twitter meta tags so Discord and other scrapers show correct previews
// when a subpage URL is shared. Each generated file is a full copy of the
// built SPA (absolute asset paths work from any subdirectory) with only the
// social-sharing meta tags and <title> swapped out.
function prerenderMetaPlugin() {
  const BASE = 'https://jallomoth.com'
  const LOGO = `${BASE}/logo/Jallogo.png`
  const FE_LOGO = `${BASE}/logo/FoolsErrand.png`

  const routes = [
    {
      path: 'fools-errand',
      title: "Jallomoth — Fool's Errand",
      description: "Read Fool's Errand — a webcomic by Jallomoth",
      image: FE_LOGO,
    },
    {
      path: 'art-gallery',
      title: 'Jallomoth — Art Gallery',
      description: "Browse Jallomoth fanart",
      image: LOGO,
    },
    {
      path: 'commissions',
      title: 'Jallomoth — Commissions',
      description: 'Commission artwork from Jallomoth',
      image: LOGO,
    },
    {
      path: 'community',
      title: 'Jallomoth — Community',
      description: 'The Jallomoth community hub',
      image: LOGO,
    },
    {
      path: 'backstage',
      title: 'Jallomoth — Backstage',
      description: 'Behind the scenes at Jallomoth.com',
      image: LOGO,
    },
    {
      path: 'jalloseum',
      title: 'Jallomoth — Jalloseum',
      description: "The Jalloseum — browse Jallomoth's art collection",
      image: LOGO,
    },
    {
      path: 'jalloseum/commissions',
      title: 'Jallomoth — Commissions · Jalloseum',
      description: "Commission art from Jallomoth — browse the portfolio",
      image: LOGO,
    },
    {
      path: 'jalloseum/fools-errand',
      title: "Jallomoth — Fool's Errand Art · Jalloseum",
      description: "Fool's Errand artwork in the Jalloseum",
      image: FE_LOGO,
    },
    {
      path: 'jalloseum/fan-art',
      title: 'Jallomoth — Fan Art · Jalloseum',
      description: 'Fan art collection in the Jalloseum',
      image: LOGO,
    },
    {
      path: 'jalloseum/thumbnails',
      title: 'Jallomoth — Thumbnails · Jalloseum',
      description: 'Thumbnail gallery in the Jalloseum',
      image: LOGO,
    },
    {
      path: 'jalloseum/jallologue',
      title: 'Jallomoth — Jallologue · Jalloseum',
      description: 'The Jallologue collection in the Jalloseum',
      image: LOGO,
    },
    {
      path: 'jalloseum/fake-albums',
      title: 'Jallomoth — Fake Albums · Jalloseum',
      description: 'Fake album covers in the Jalloseum',
      image: LOGO,
    },
    {
      path: 'jalloseum/self-portraits',
      title: 'Jallomoth — Self Portraits · Jalloseum',
      description: 'Self-portrait collection in the Jalloseum',
      image: LOGO,
    },
    {
      path: 'jalloseum/misc',
      title: 'Jallomoth — Misc. & Memes · Jalloseum',
      description: 'Miscellaneous art and memes in the Jalloseum',
      image: LOGO,
    },
  ]

  // Escape a string for use inside an HTML attribute value (double-quoted).
  const escAttr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;')

  function generateHtml(template, { title, description, url, image }) {
    const t = escAttr(title)
    const d = escAttr(description)
    return template
      .replace(/(<meta\s+property="og:title"\s+content=")[^"]*(")/,         `$1${t}$2`)
      .replace(/(<meta\s+property="og:description"\s+content=")[^"]*(")/,   `$1${d}$2`)
      .replace(/(<meta\s+property="og:url"\s+content=")[^"]*(")/,           `$1${url}$2`)
      .replace(/(<meta\s+property="og:image"\s+content=")[^"]*(")/,         `$1${image}$2`)
      .replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*(")/,        `$1${t}$2`)
      .replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*(")/,  `$1${d}$2`)
      .replace(/(<meta\s+name="twitter:image"\s+content=")[^"]*(")/,        `$1${image}$2`)
      .replace(/(<meta\s+name="description"\s+content=")[^"]*(")/,          `$1${d}$2`)
      .replace(/(<link\s+rel="canonical"\s+href=")[^"]*(")/,                `$1${url}$2`)
      .replace(/(<title>)[^<]*(<\/title>)/,                                  `$1${title}$2`)
  }

  return {
    name: 'prerender-meta',
    apply: 'build',
    closeBundle() {
      const dist = join(process.cwd(), 'dist')
      const indexHtml = join(dist, 'index.html')
      if (!existsSync(indexHtml)) return
      const template = readFileSync(indexHtml, 'utf-8')

      // Static routes
      for (const route of routes) {
        const dir = join(dist, route.path)
        mkdirSync(dir, { recursive: true })
        const html = generateHtml(template, {
          ...route,
          url: `${BASE}/${route.path}`,
        })
        writeFileSync(join(dir, 'index.html'), html)
      }

      // Per-chapter + per-page Fool's Errand stubs — scan chapters from source.
      // Generates dist/fools-errand/<id>/index.html (chapter root) and
      // dist/fools-errand/<id>/<page>/index.html for every page so that deep
      // links like /fools-errand/chapter-0/19 serve real OG tags instead of
      // the generic 404.html when shared on Discord etc.
      const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif',
                                   '.PNG', '.JPG', '.JPEG', '.WEBP', '.GIF'])
      const chaptersDir = join(process.cwd(), 'src', 'assets', 'fools-errand', 'chapters')
      if (existsSync(chaptersDir)) {
        for (const chapterId of readdirSync(chaptersDir)) {
          if (!statSync(join(chaptersDir, chapterId)).isDirectory()) continue
          let chapterTitle = chapterId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
          let chapterDesc = `Read ${chapterTitle} of Fool's Errand — a webcomic by Jallomoth.`
          let pageCount = 0
          try {
            const manifest = JSON.parse(
              readFileSync(join(chaptersDir, chapterId, 'manifest.json'), 'utf-8')
            )
            if (manifest.dropdownLabel) chapterTitle = manifest.dropdownLabel
            else if (manifest.title)    chapterTitle = manifest.title
            if (manifest.description)   chapterDesc  = manifest.description
            // Prefer explicit pages list for an accurate count
            if (Array.isArray(manifest.pages) && manifest.pages.length > 0) {
              pageCount = manifest.pages.length
            }
          } catch { /* manifest may not exist */ }

          // Fall back to counting image files in the chapter directory
          if (pageCount === 0) {
            try {
              pageCount = readdirSync(join(chaptersDir, chapterId))
                .filter((f) => IMAGE_EXTS.has(extname(f))).length
            } catch { /* ignore */ }
          }

          const chapterMeta = {
            title:       `${chapterTitle} — Fool's Errand — Jallomoth`,
            description: chapterDesc,
            url:         `${BASE}/fools-errand/${chapterId}`,
            image:       FE_LOGO,
          }
          const chapterHtml = generateHtml(template, chapterMeta)

          // Chapter root: /fools-errand/<id>/
          const chapterDir = join(dist, 'fools-errand', chapterId)
          mkdirSync(chapterDir, { recursive: true })
          writeFileSync(join(chapterDir, 'index.html'), chapterHtml)

          // Per-page: /fools-errand/<id>/<page>/ — same meta as the chapter root
          for (let page = 1; page <= pageCount; page++) {
            const pageDir = join(chapterDir, String(page))
            mkdirSync(pageDir, { recursive: true })
            writeFileSync(join(pageDir, 'index.html'),
              generateHtml(template, { ...chapterMeta, url: `${BASE}/fools-errand/${chapterId}/${page}` })
            )
          }
        }
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    galleryDimensionsPlugin(),
    prerenderMetaPlugin(),
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
