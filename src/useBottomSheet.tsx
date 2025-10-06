import { useCallback, useState } from "react";
import { IdGenerator } from "./utils";

export default function useBottomSheet(initialValue?: boolean) {
  const [isOpen, setValue] = useState(initialValue);

  const instanceID = IdGenerator(6);

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
    isOpen,
    toggleSheet,
    closeSheet,
    instanceID,
    openSheet,
  };
}

export type BottomSheetHook = ReturnType<typeof useBottomSheet>;
