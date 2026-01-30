import { useEffect, useMemo, useState } from "react";
import { Dimensions } from "react-native";
import type { PresentationMode } from "../types";

/**
 * Effective presentation mode after resolving 'auto' based on screen width.
 * Sidebar is always explicit (never auto-resolved).
 */
export type EffectivePresentationMode = "bottomSheet" | "dialog" | "sidebar";

/**
 * Hook to determine the effective presentation mode based on the requested mode
 * and current screen dimensions.
 *
 * @param mode - The requested presentation mode
 * @param breakpoint - Screen width breakpoint for auto mode (default: 768px)
 * @returns The resolved effective presentation mode
 */
export function useDeviceMode(
  mode: PresentationMode = "auto",
  breakpoint = 768
): EffectivePresentationMode {
  const [width, setWidth] = useState(() => Dimensions.get("window").width);

  useEffect(() => {
    const sub = Dimensions.addEventListener("change", ({ window }) => {
      setWidth(window.width);
    });

    return () => {
      // RN returns either { remove } or nothing depending on version.
      if (typeof sub?.remove === "function") sub.remove();
    };
  }, []);

  return useMemo(() => {
    // Explicit modes are returned as-is
    if (mode === "bottomSheet" || mode === "dialog" || mode === "sidebar") {
      return mode;
    }
    // Auto mode resolves based on screen width breakpoint
    return width >= breakpoint ? "dialog" : "bottomSheet";
  }, [mode, width, breakpoint]);
}


