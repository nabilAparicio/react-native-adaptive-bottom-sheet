import { useCallback, useMemo, useState } from "react";
import { IdGenerator } from "./utils";

/**
 * Represents the current state of the BottomSheet animation lifecycle.
 * - `closed`: Sheet is fully closed and not visible
 * - `opening`: Sheet is animating from closed to open
 * - `open`: Sheet is fully open and animation is complete
 * - `closing`: Sheet is animating from open to closed
 */
export type BSstatus = "closed" | "opening" | "open" | "closing";

/**
 * Hook to manage BottomSheet state
 * @param initialValue - Initial open state (default: false)
 * @returns BottomSheet control methods and state
 *
 * @example
 * const sheet = useBottomSheet();
 *
 * // Track animation lifecycle
 * useEffect(() => {
 *   switch (sheet.status) {
 *     case 'opening':
 *       console.log('Sheet is opening...');
 *       break;
 *     case 'open':
 *       console.log('Sheet fully open, safe to interact');
 *       break;
 *     case 'closing':
 *       console.log('Sheet is closing...');
 *       break;
 *     case 'closed':
 *       console.log('Sheet fully closed');
 *       break;
 *   }
 * }, [sheet.status]);
 */
export default function useBottomSheet(initialValue?: boolean) {
  /**
   * Current status of the BottomSheet animation lifecycle.
   * Use this to trigger logic at specific moments of the animation.
   */
  const [status, setStatus] = useState<BSstatus>("closed");
  const [isOpen, setValue] = useState(initialValue ?? false);

  const instanceID = useMemo(() => IdGenerator(6), []);

  const toggleSheet = useCallback((callback?: Function) => {
    setValue((prev) => !prev);
    if (callback) {
      callback();
    }
  }, []);

  const closeSheet = useCallback((callback?: Function) => {
    setValue(false);
    if (callback) {
      callback();
    }
  }, []);

  const openSheet = useCallback((callback?: Function) => {
    setValue(true);
    if (callback) {
      callback();
    }
  }, []);

  return {
    status,
    setStatus,
    isOpen,
    toggleSheet,
    closeSheet,
    instanceID,
    openSheet,
  };
}

export type BottomSheetHook = ReturnType<typeof useBottomSheet>;
