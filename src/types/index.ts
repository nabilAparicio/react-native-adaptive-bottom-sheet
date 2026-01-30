import type { ReactNode } from "react";
import type { StyleProp, TouchableOpacityProps, ViewStyle } from "react-native";
import type { BottomSheetHook } from "../useBottomSheet";

export type BottomSheetStyleOverrides = {
  backdrop?: StyleProp<ViewStyle>;
  sheet?: StyleProp<ViewStyle>;
  header?: StyleProp<ViewStyle>;
  content?: StyleProp<ViewStyle>;
  closeButton?: StyleProp<ViewStyle>;
  /** Sidebar-specific container style */
  sidebarContainer?: StyleProp<ViewStyle>;
};

/**
 * Presentation mode for the adaptive sheet component.
 * - 'bottomSheet': Traditional bottom sheet sliding from bottom
 * - 'dialog': Centered dialog/modal presentation
 * - 'sidebar': Horizontal sliding panel from left or right
 * - 'auto': Automatically selects based on screen width breakpoint
 */
export type PresentationMode = "bottomSheet" | "dialog" | "sidebar" | "auto";

/**
 * Position for sidebar mode.
 * - 'left': Sidebar slides in from the left edge
 * - 'right': Sidebar slides in from the right edge
 */
export type SidebarPosition = "left" | "right";

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
   * - 'sidebar' activa el modo sidebar horizontal
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

  // ========== SIDEBAR MODE PROPS ==========

  /**
   * Position of the sidebar when mode='sidebar'.
   * - 'left': Slides in from left edge (default)
   * - 'right': Slides in from right edge
   */
  sidebarPosition?: SidebarPosition;

  /**
   * Fixed width for sidebar in pixels.
   * When set, overrides sidebarMinWidth and sidebarMaxWidth.
   */
  sidebarWidth?: number;

  /**
   * Minimum width for sidebar in pixels.
   * The sidebar will not shrink below this value.
   * Default: 280
   */
  sidebarMinWidth?: number;

  /**
   * Maximum width for sidebar in pixels.
   * The sidebar will not grow beyond this value.
   * Default: 400
   */
  sidebarMaxWidth?: number;

  /**
   * Enable drag-to-close gesture for sidebar mode.
   * When true, users can swipe horizontally to dismiss the sidebar.
   * Default: true
   */
  sidebarDragToClose?: boolean;
}


