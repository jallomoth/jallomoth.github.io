// Auto-discover comic chapters and images using Vite's glob import.
// Images are expected under `src/assets/fools-errand/chapters/<chapter-id>/`.

// Import only image files as URLs
const imageModules = import.meta.glob(
  "../assets/fools-errand/chapters/**/*.{png,jpg,jpeg,webp,gif,svg,PNG,JPG,JPEG,WEBP,GIF,SVG}",
  { eager: true, query: "?url", import: "default" }
);

// Import any manifest.json files (eager so we can read titles/order)
const manifestModules = import.meta.glob(
  "../assets/fools-errand/chapters/**/manifest.json",
  { eager: true }
);

// Group image modules by chapter folder
const groups = {};
for (const fullPath in imageModules) {
  const m = fullPath.match(/chapters\/(.+?)\/(.+)$/);
  if (!m) continue;
  const chapterId = m[1];
  const filename = m[2];
  if (!groups[chapterId]) groups[chapterId] = [];
  groups[chapterId].push({ filename, url: imageModules[fullPath] });
}

// Read manifests into a map: chapterId -> manifest object
const manifests = {};
for (const fullPath in manifestModules) {
  const m = fullPath.match(/chapters\/(.+?)\/manifest.json$/);
  if (!m) continue;
  const chapterId = m[1];
  const mod = manifestModules[fullPath];
  // when eager=true, JSON modules export the parsed object as the default export
  const data = mod && mod.default ? mod.default : mod;
  manifests[chapterId] = data;
}

const chapters = Object.keys(groups)
  .sort()
  .map((id) => {
    const files = groups[id].slice();
    // build a filename -> url map for this chapter
    const fileMap = Object.fromEntries(files.map((f) => [f.filename, f.url]));

    let images = [];
    const manifest = manifests[id];
    if (manifest && Array.isArray(manifest.pages) && manifest.pages.length > 0) {
      // Use ordering from manifest.pages, ignore missing files
      images = manifest.pages.map((fn) => fileMap[fn]).filter(Boolean);
    } else {
      // Fallback: sort by filename and use all discovered images
      files.sort((a, b) => a.filename.localeCompare(b.filename, undefined, { numeric: true }));
      images = files.map((f) => f.url);
    }

    const label = (manifest && manifest.dropdownLabel) ? manifest.dropdownLabel
      : (manifest && manifest.title) ? manifest.title
      : id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    const pageTitle = (manifest && manifest.pageTitle) ? manifest.pageTitle
      : label;

    return {
      id,
      label,
      pageTitle,
      music: (manifest && manifest.music) ? manifest.music : null,
      pageSounds: (manifest && manifest.pageSounds) ? manifest.pageSounds : {},
      images,
    };
  });

// Fallback: empty chapter if nothing found
if (chapters.length === 0) {
  chapters.push({ id: "chapter-01", label: "Chapter 01", images: [] });
}

export default chapters;
