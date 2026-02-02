import type { ReactNode } from "react";
import type { StyleProp, TouchableOpacityProps, ViewStyle } from "react-native";
import type { BottomSheetHook } from "../useBottomSheet";

// =============================================================================
// STYLE OVERRIDES
// =============================================================================

export type BottomSheetStyleOverrides = {
  backdrop?: StyleProp<ViewStyle>;
  sheet?: StyleProp<ViewStyle>;
  header?: StyleProp<ViewStyle>;
  content?: StyleProp<ViewStyle>;
  closeButton?: StyleProp<ViewStyle>;
  /** Sidebar-specific container style */
  sidebarContainer?: StyleProp<ViewStyle>;
};

// =============================================================================
// PRESENTATION MODES
// =============================================================================

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

// =============================================================================
// COMMON PROPS (shared across all modes)
// =============================================================================

/**
 * Props shared across all presentation modes.
 */
export interface CommonBottomSheetProps {
  /** Content to render inside the sheet */
  children: ReactNode;

  /** Instance from useBottomSheet hook - controls open/close state */
  bottomSheetInstance: BottomSheetHook;

  /** Maximum height for the sheet */
  maxHeight?: number;

  /** Fixed height - overrides dynamic sizing */
  fixedHeight?: number;

  /** Optional header component */
  headerComponent?: ReactNode;

  /** Hide the close button */
  hideCloseButton?: boolean;

  /** Disable tap-on-backdrop to dismiss */
  disableBackdropDismiss?: boolean;

  /** Adjust position when keyboard appears (Android) */
  avoidKeyboard?: boolean;

  /** Callback when sheet is dismissed */
  onDismiss?: () => void;

  /** Enable dark mode styling */
  darkMode?: boolean;

  /**
   * Style overrides per slot (merged with defaults).
   * Recommended: backgroundColor, borderRadius, padding, shadow, etc.
   */
  styles?: BottomSheetStyleOverrides;

  /**
   * Custom close icon renderer.
   * If not provided, uses default Close icon.
   */
  renderCloseIcon?: (params: { isDark: boolean }) => ReactNode;

  /**
   * Additional props for the close button TouchableOpacity.
   * For adjusting hitSlop, accessibility, testID, etc.
   */
  closeButtonProps?: Omit<TouchableOpacityProps, "onPress" | "style">;

  /**
   * Breakpoint width to determine tablet mode (default: 768).
   * Only used when mode='auto'.
   */
  tabletBreakpoint?: number;

  /**
   * Disable safe area insets handling.
   * When true, the sheet will use the full screen without respecting safe areas.
   * Useful when the sheet is rendered inside a container that already handles insets.
   * @default false
   */
  disableSafeArea?: boolean;
}

// =============================================================================
// MODE-SPECIFIC PROPS
// =============================================================================

/**
 * Props specific to bottomSheet mode.
 * Drag-to-close is always enabled in this mode.
 */
export interface BottomSheetModeProps extends CommonBottomSheetProps {
  mode: "bottomSheet";
}

/**
 * Props specific to dialog mode.
 */
export interface DialogModeProps extends CommonBottomSheetProps {
  mode: "dialog";

  /**
   * Enable drag-to-close gesture in dialog mode.
   * When true, users can swipe down to dismiss.
   * @default true
   */
  dialogDragToClose?: boolean;
}

/**
 * Props specific to sidebar mode.
 */
export interface SidebarModeProps extends CommonBottomSheetProps {
  mode: "sidebar";

  /**
   * Position of the sidebar.
   * - 'left': Slides in from left edge
   * - 'right': Slides in from right edge
   * @default "left"
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
   * @default 280
   */
  sidebarMinWidth?: number;

  /**
   * Maximum width for sidebar in pixels.
   * The sidebar will not grow beyond this value.
   * @default 400
   */
  sidebarMaxWidth?: number;

  /**
   * Enable drag-to-close gesture for sidebar mode.
   * When true, users can swipe horizontally to dismiss.
   * @default true
   */
  sidebarDragToClose?: boolean;
}

/**
 * Props for auto mode - accepts ALL mode-specific props
 * because the actual mode is determined at runtime based on screen width.
 */
export interface AutoModeProps extends CommonBottomSheetProps {
  /** @default "auto" */
  mode?: "auto";

  // Dialog-specific (used if resolved to dialog)
  dialogDragToClose?: boolean;

  // Sidebar-specific (used if resolved to sidebar)
  sidebarPosition?: SidebarPosition;
  sidebarWidth?: number;
  sidebarMinWidth?: number;
  sidebarMaxWidth?: number;
  sidebarDragToClose?: boolean;
}

// =============================================================================
// DISCRIMINATED UNION - MAIN EXPORT
// =============================================================================

/**
 * BottomSheet component props with discriminated union based on mode.
 *
 * - mode="bottomSheet": Only common props available
 * - mode="dialog": Common props + dialogDragToClose
 * - mode="sidebar": Common props + sidebar-specific props
 * - mode="auto" or undefined: All props available (runtime resolution)
 *
 * @example
 * // Correct: mode="sidebar" with sidebar props
 * <AdaptiveBottomSheet mode="sidebar" sidebarPosition="right" />
 *
 * @example
 * // Correct: mode="dialog" with dialog props
 * <AdaptiveBottomSheet mode="dialog" dialogDragToClose={false} />
 *
 * @example
 * // Error: sidebarWidth is not available in dialog mode
 * <AdaptiveBottomSheet mode="dialog" sidebarWidth={300} />
 */
export type BottomSheetProps =
  | BottomSheetModeProps
  | DialogModeProps
  | SidebarModeProps
  | AutoModeProps;

// =============================================================================
// INTERNAL TYPE FOR COMPONENT IMPLEMENTATION
// =============================================================================

/**
 * Internal props type that flattens the union for component implementation.
 * Use this only inside the component, not for public API.
 * @internal
 */
export type InternalBottomSheetProps = CommonBottomSheetProps & {
  mode?: PresentationMode;
  dialogDragToClose?: boolean;
  sidebarPosition?: SidebarPosition;
  sidebarWidth?: number;
  sidebarMinWidth?: number;
  sidebarMaxWidth?: number;
  sidebarDragToClose?: boolean;
};

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Type guard to check if props are for sidebar mode.
 */
export function isSidebarMode(
  props: BottomSheetProps
): props is SidebarModeProps {
  return props.mode === "sidebar";
}

/**
 * Type guard to check if props are for dialog mode.
 */
export function isDialogMode(props: BottomSheetProps): props is DialogModeProps {
  return props.mode === "dialog";
}

/**
 * Type guard to check if props are for bottomSheet mode.
 */
export function isBottomSheetMode(
  props: BottomSheetProps
): props is BottomSheetModeProps {
  return props.mode === "bottomSheet";
}

/**
 * Type guard to check if props are for auto mode.
 */
export function isAutoMode(props: BottomSheetProps): props is AutoModeProps {
  return props.mode === "auto" || props.mode === undefined;
}
