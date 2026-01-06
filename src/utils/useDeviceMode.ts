import { useEffect, useMemo, useState } from "react";
import { Dimensions } from "react-native";
import type { PresentationMode } from "../types";

export type EffectivePresentationMode = "bottomSheet" | "dialog";

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
    if (mode === "bottomSheet" || mode === "dialog") return mode;
    return width >= breakpoint ? "dialog" : "bottomSheet";
  }, [mode, width, breakpoint]);
}


