# jallomoth.github.io — source

Personal website for Jallomoth. Built with React 19 and Vite, deployed to GitHub Pages.

---

## Table of contents

- [Tech stack](#tech-stack)
- [Pages and routes](#pages-and-routes)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Deployment](#deployment)
- [Architecture notes](#architecture-notes)

---

## Tech stack

| Layer | Library / Tool | Version |
|---|---|---|
| UI | React | 19 |
| Routing | React Router DOM | 7 |
| Build | Vite | 8 |
| Image optimization | vite-plugin-image-optimizer (sharp) | — |
| Analytics | react-ga4 (Google Analytics 4) | 3 |
| Deployment | gh-pages | 6 |

---

## Pages and routes

| Route | Page | Status |
|---|---|---|
| `/` | Home — logo + navigation button grid | Live |
| `/fools-errand/*` | Fool's Errand — web comic reader | Live |
| `/jalloseum` | Jalloseum — hub for art sub-categories | Live |
| `/jalloseum/commissions` | Jalloseum: Commissions | Live |
| `/jalloseum/fools-errand` | Jalloseum: Fool's Errand art | Live |
| `/jalloseum/fan-art` | Jalloseum: Fan Art | Live |
| `/jalloseum/thumbnails` | Jalloseum: Thumbnails | Live |
| `/jalloseum/jallologue` | Jalloseum: Jallologue | Live |
| `/jalloseum/fake-albums` | Jalloseum: Fake Albums | Live |
| `/jalloseum/self-portraits` | Jalloseum: Self Portraits | Live |
| `/jalloseum/misc` | Jalloseum: Misc. & Memes | Live |
| `/art-gallery` | Art Gallery — fan art by year and category | Live |
| `/commissions` | Commissions | Placeholder |
| `/community` | Community — social links and contact | Live |
| `/backstage` | Backstage | Placeholder |
| `*` | 404 — random media shown on unknown routes | Live |

---

## Project structure

```
my-site/
  public/                     Static assets served as-is (not bundled)
    404/                      Redirect page for GitHub Pages 404 handling
    icons/                    Navigation button icons
    logo/                     Logo variants
    comic/                    Comic reader nav button images
    cursor/                   Custom cursor images
    sounds/                   Audio files (click.mp3, background music, etc.)
    volume/                   Volume control UI images
    x/                        Modal close button images
    back/                     Back button images
    manifest.json             PWA manifest
    robots.txt
    sitemap.xml

  src/
    main.jsx                  Entry point — initializes GA, mounts providers
    App.jsx                   Root component — layout shells and all routes
    index.css                 Global styles and CSS reset

    assets/                   Bundled assets (images, chapter manifests)
      404/                    Media shown on the 404 page
      fools-errand/           Comic chapter images and manifest.json files
      gallery/                Art Gallery images (organized by year/category)
      jalloseum/              Jalloseum images (organized by sub-category)

    components/               Reusable components
      Cursor.jsx              Custom CSS cursor (hidden on touch devices)
      ParallaxBackground.jsx  Tiling background with mouse/gyro parallax
      NavButton.jsx           Navigation button with drag, fling, and spring physics
      ButtonGrid.jsx          Home screen 2x4 grid of NavButtons
      CommunityButtonGrid.jsx Community page 2x6 grid of NavButtons
      Logo.jsx                Draggable site logo with hover swap and spring physics
      BackButton.jsx          Fixed back-navigation button
      InfoPopover.jsx         Popover for contact info (email, P.O. box)
      ErrorBoundary.jsx       Catches render errors in child trees
      ComicViewer.jsx         Full comic reader (URL-driven, fullscreen, swipe)
      audio/
        AudioContext.jsx      Global audio context — background music + sound effects
        VolumeControl.jsx     Fixed-position volume icon and slider
      gallery/
        Gallery.jsx           Art Gallery layout and section navigation
        GallerySection.jsx    One section's image grid (CSS columns)
        GalleryItem.jsx       Single thumbnail with lazy fade-in and 3D tilt hover
        JalloseumGallery.jsx  Jalloseum variant of the gallery
        useGalleryImages.js   Hook — discovers Art Gallery images via import.meta.glob
        useJalloseumImages.js Hook — discovers Jalloseum images via import.meta.glob

    contexts/
      DragContext.jsx         Shared drag-state refs for inter-button repulsion

    data/
      foolsErrand.js          Auto-discovers chapter folders and reads manifest.json files

    hooks/
      useAnimationFrame.js    Subscribes a component to the shared rAF loop
      usePageTitle.js         Sets document.title on mount

    pages/
      Home.jsx
      FoolsErrand.jsx
      Jalloseum.jsx
      JalloseumSubpage.jsx    Jalloseum art category — grid + fullscreen modal
      ArtGallery.jsx
      Commissions.jsx
      Community.jsx
      Backstage.jsx
      NotFound.jsx

    utils/
      animationScheduler.js   Singleton requestAnimationFrame loop shared by all components
```

---

## Getting started

**Prerequisites:** Node.js 18+ and npm.

```bash
# Install dependencies
cd my-site
npm install

# Start the dev server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview the production build locally
npm run preview

# Lint
npm run lint
```

---

## Environment variables

Create a `.env` file in `my-site/` before running dev or building:

```
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

This is the Google Analytics 4 Measurement ID. Without it, GA will not initialize (the site still works — analytics just will not fire). The variable is prefixed with `VITE_` so Vite injects it at build time. It is safe to commit to a public repo since it is a read-only identifier, not a secret.

---

## Deployment

Deployment targets GitHub Pages via the `gh-pages` package:

```bash
npm run deploy
```

This runs `vite build` then `gh-pages -d dist`, which pushes the `dist/` folder to the `gh-pages` branch. GitHub Pages serves that branch at `https://jallomoth.github.io`.

**GitHub Pages SPA workaround:** The repo includes `public/404.html` which redirects all unknown paths back to `index.html` with the original path encoded in the query string. `index.html` reads that query string and restores the path via `history.replaceState` before React Router boots. This is necessary because GitHub Pages does not support client-side routing natively — every URL other than the root would return a 404 without this workaround.

---

## Architecture notes

### Layout shells

`App.jsx` defines two layout components used by React Router's nested routes:

- **MainLayout** — wraps most pages with `ParallaxBackground`, `Cursor`, and `VolumeControl`. All navigation components float above the page content.
- **MinimalLayout** — used only for the 404 page. Contains only `Cursor` so the background animation does not run on error pages.

### Audio

`AudioContext.jsx` manages all audio globally via a React context. Background music starts muted, waits for the first user interaction (required by the browser autoplay policy), then unmutes and fades in. Sound effects use a small pool of `Audio` objects to allow overlapping playback. Volume and mute state are persisted to `localStorage`.

### Shared animation loop

`animationScheduler.js` maintains a single `requestAnimationFrame` loop for the whole app. Components subscribe via the `useAnimationFrame` hook rather than each calling `requestAnimationFrame` independently. This avoids multiple rAF callbacks firing per frame and makes it easy to pause animation globally if needed.

### Navigation buttons

Each home screen button is independently draggable. Releasing a button applies a fling boost proportional to drag velocity, and the button then springs back to its origin. If a button is dragged within 350px of another button, the other button is magnetically repelled. A drag shorter than 80px is treated as a click and navigates normally.

### Fool's Errand comic reader

The reader is fully URL-driven: chapter and page are encoded in the URL path (`/fools-errand/<chapter-id>/<page-number>`), making every page directly linkable and the browser back button functional. Reading position is also persisted to `localStorage` and restored on the next visit. Fullscreen mode renders a duplicate custom cursor inside the fullscreen element because the site-wide cursor element is outside it and disappears in fullscreen.

### Image discovery

Gallery images and comic chapter pages are discovered at build time using Vite's `import.meta.glob`. No manual asset lists need to be maintained — adding an image to the correct folder is enough for it to appear. Comic chapters additionally read a `manifest.json` in each chapter folder to control page ordering.

### Parallax background

The background tile extends 60vw past the viewport on all sides to prevent edge gaps during mouse movement. It uses CSS `transform` rather than `background-position` so that `backdrop-filter: blur()` on overlapping elements works correctly across browsers.

### Custom cursor

The OS cursor is hidden globally via CSS and replaced with a PNG image element that follows the mouse. On touch devices the custom cursor element is hidden and default touch behavior is restored.

---

## Adding content

**New comic chapter:** Create a folder under `src/assets/fools-errand/chapters/`, add a `manifest.json` listing the image filenames in order, and drop the images in. The chapter will be auto-discovered at the next build.

**New gallery image:** Drop the image into the correct year/category subfolder under `src/assets/gallery/` or `src/assets/jalloseum/`. It will appear automatically.

**New page:** Add the component under `src/pages/`, register a route in `App.jsx`, and add a button entry to `ButtonGrid.jsx` or `CommunityButtonGrid.jsx` if it needs a home screen button.