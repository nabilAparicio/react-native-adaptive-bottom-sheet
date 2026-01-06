import type { ReactNode } from "react";
import type { StyleProp, TouchableOpacityProps, ViewStyle } from "react-native";
import type { BottomSheetHook } from "../useBottomSheet";

export type BottomSheetStyleOverrides = {
  backdrop?: StyleProp<ViewStyle>;
  sheet?: StyleProp<ViewStyle>;
  header?: StyleProp<ViewStyle>;
  content?: StyleProp<ViewStyle>;
  closeButton?: StyleProp<ViewStyle>;
};

export type PresentationMode = "bottomSheet" | "dialog" | "auto";

export interface BottomSheetProps {
  children: ReactNode;
  bottomSheetInstance: BottomSheetHook;

  maxHeight?: number;
  fixedHeight?: number;

  headerComponent?: ReactNode;

  hideCloseButton?: boolean;
  disableBackdropDismiss?: boolean;
  avoidKeyboard?: boolean;
  onDismiss?: Function;

  darkMode?: boolean;

  /**
   * Estilos por slot (se mergean con los defaults).
   * Recomendado: backgroundColor, borderRadius, padding, shadow, etc.
   */
  styles?: BottomSheetStyleOverrides;

  /**
   * Custom total del icono (si no lo pasas, usa <Close />).
   */
  renderCloseIcon?: (params: { isDark: boolean }) => ReactNode;

  /**
   * Para ajustar hitSlop, accessibility, testID, etc.
   */
  closeButtonProps?: Omit<TouchableOpacityProps, "onPress" | "style">;

  /**
   * Forzar modo de presentación.
   * - 'auto' detecta por breakpoint (default 768px)
   */
  mode?: PresentationMode;

  /**
   * Breakpoint para considerar tablet (default 768px).
   */
  tabletBreakpoint?: number;

  /**
   * En modo dialog, permite cerrar arrastrando hacia abajo.
   * Default: true (para consistencia con BottomSheet).
   */
  dialogDragToClose?: boolean;
}


