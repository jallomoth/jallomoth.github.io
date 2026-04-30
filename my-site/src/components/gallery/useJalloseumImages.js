// components/gallery/useJalloseumImages.js
import { useMemo } from "react";

export default function useJalloseumImages(subfolder) {
  // MUST be static — evaluated at build time by Vite
  const imageModules = import.meta.glob(
    "../../assets/jalloseum/**/*.{png,jpg,jpeg,webp,gif,PNG,JPG,JPEG,WEBP,GIF}",
    { eager: true }
  );

  const images = useMemo(() =>
    Object.entries(imageModules)
      .filter(([path]) => {
        if (!subfolder) return true;
        const parts = path.split("/");
        const folder = parts[parts.length - 2];
        return folder === subfolder;
      })
      .map(([path, mod]) => {
        const fileName = path.split("/").pop().split(".")[0];
        const label = fileName
          .replace(/\(.*?\)/g, "")
          .replace(/[-_]/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());

        return {
          src: mod.default,
          label,
          fileName,
          path,
        };
      })
      .sort((a, b) => a.fileName.localeCompare(b.fileName)),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [subfolder]);

  return images;
}
