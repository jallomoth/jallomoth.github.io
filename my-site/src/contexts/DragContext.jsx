import { createContext, useContext, useRef } from "react";

const DragContext = createContext(null);

/**
 * Provides shared drag-state refs to all animated components, replacing
 * the previous window.isGrabbing / window.isDraggingButton globals.
 *
 * All values are plain refs (not state) because:
 *  - they are read inside rAF loops (no React re-render needed)
 *  - writes happen in event handlers that must not trigger re-renders
 */
export function DragProvider({ children }) {
  const isGrabbingRef = useRef(false);        // cursor grab icon + VolumeControl
  const isDraggingButtonRef = useRef(false);  // NavButton drag in progress
  const draggedButtonPosRef = useRef(null);   // NavButton current drag position (for magnetic repulsion)

  return (
    <DragContext.Provider value={{ isGrabbingRef, isDraggingButtonRef, draggedButtonPosRef }}>
      {children}
    </DragContext.Provider>
  );
}

export function useDrag() {
  const ctx = useContext(DragContext);
  if (!ctx) throw new Error("useDrag must be used within a DragProvider");
  return ctx;
}
