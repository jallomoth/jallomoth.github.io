import { useEffect } from "react";

/**
 * Sets document.title when the component mounts / when title changes.
 * Replaces the boilerplate `useEffect(() => { document.title = "..."; }, [])`
 * pattern in every page component.
 *
 * @param {string} title
 */
export default function usePageTitle(title) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}
