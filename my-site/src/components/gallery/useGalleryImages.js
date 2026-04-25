// components/gallery/useGalleryImages.js
import { useMemo } from "react";

export default function useGalleryImages(sectionMap, sortOrder) {
  // MUST be static — evaluated at build time by Vite
  const imageModules = import.meta.glob(
    "../../assets/gallery/**/*.{png,jpg,jpeg,webp,gif}",
    { eager: true }
  );

  // Derived arrays are memoized so they only recompute when sectionMap/sortOrder
  // reference changes. Callers should pass module-scope constants to get full benefit.
  const images = useMemo(() =>
    Object.entries(imageModules)
      .map(([path, mod]) => {
        const fileName = path.split("/").pop().split(".")[0];

        const parts = path.split("/");
        const folder = parts[parts.length - 2]?.toLowerCase() || "";

        let section = "Unknown";

        if (sectionMap[folder]) {
          section = sectionMap[folder];
        } else {
          const match = path.match(/(\d{4})/);
          if (match) section = match[1];
        }

        const label = fileName
          .replace(/\(.*?\)/g, "")
          .replace(/[-_]/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());

        return {
          src: mod.default,
          label,
          fileName,
          section,
          path,
        };
      })
      .filter((img) => img.path.includes("/gallery/"))
      .sort((a, b) => a.fileName.localeCompare(b.fileName)),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [sectionMap]);

  const grouped = useMemo(() =>
    Object.entries(
      images.reduce((acc, img) => {
        if (!acc[img.section]) acc[img.section] = [];
        acc[img.section].push(img);
        return acc;
      }, {})
    ).sort((a, b) => {
      const aPriority = sortOrder[a[0]] ?? 1;
      const bPriority = sortOrder[b[0]] ?? 1;

      if (aPriority !== bPriority) return aPriority - bPriority;

      return b[0].localeCompare(a[0]);
    }),
  [images, sortOrder]);

  return { images, grouped };
}