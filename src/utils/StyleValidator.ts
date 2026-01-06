import { StyleSheet } from "react-native";
import type { BottomSheetStyleOverrides } from "../types";

type SlotName = keyof BottomSheetStyleOverrides;

const RESERVED_STYLE_KEYS: Record<SlotName, ReadonlyArray<string>> = {
  // Used by animations + positioning.
  sheet: [
    "transform",
    "opacity",
    "position",
    "zIndex",
    "bottom",
    "top",
    "left",
    "right",
  ],
  // Used by fade animation + full-screen overlay behavior.
  backdrop: ["opacity", "position", "zIndex", "top", "left", "right", "bottom"],
  header: [],
  content: [],
  closeButton: [],
};

const warned = new Set<string>();

// React Native global (not always present in TS lib definitions).
declare const __DEV__: boolean | undefined;

function isDev(): boolean {
  // RN defines __DEV__. If it's missing, assume dev to keep safety checks on.
  if (typeof __DEV__ === "boolean") return __DEV__;
  return true;
}

export function validateStyleOverrides(
  overrides: BottomSheetStyleOverrides | undefined,
  componentName = "AdaptiveBottomSheet"
): void {
  if (!isDev()) return;
  if (!overrides) return;

  (Object.keys(overrides) as SlotName[]).forEach((slot) => {
    const style = overrides[slot];
    if (!style) return;

    // StyleProp<ViewStyle> can be array, number, or object.
    const flattened = StyleSheet.flatten(style as never) as
      | Record<string, unknown>
      | undefined
      | null;
    if (!flattened) return;

    const reserved = RESERVED_STYLE_KEYS[slot] ?? [];
    if (reserved.length === 0) return;

    const keys = Object.keys(flattened);
    const forbidden = keys.filter((k) => reserved.includes(k));
    if (forbidden.length === 0) return;

    const key = `${componentName}:${slot}:${forbidden.sort().join(",")}`;
    if (warned.has(key)) return;
    warned.add(key);

    // Keep it actionable and explicit.
    // eslint-disable-next-line no-console
    console.warn(
      `[${componentName}] Unsafe style override detected on '${slot}'. ` +
        `Do not override reserved keys: ${forbidden.join(", ")}. ` +
        `These are controlled by internal layout/animations and overriding them can break gestures/transitions. ` +
        `Fix: remove those keys from your override (keep safe keys like backgroundColor, padding, borderRadius, etc.).`
    );
  });
}


