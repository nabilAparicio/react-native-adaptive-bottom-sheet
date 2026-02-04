import { useMemo } from "react";
import { Dimensions, StyleSheet, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { defaultTheme } from "./utils";
import type { SidebarPosition } from "./types";

interface BottomSheetStylesProps {
  isDialog: boolean;
  isSidebar: boolean;
  maxHeigth?: number;
  isDark?: boolean;
  // Sidebar-specific props
  sidebarPosition?: SidebarPosition;
  sidebarWidth?: number;
  sidebarMinWidth?: number;
  sidebarMaxWidth?: number;
  // Safe area
  disableSafeArea?: boolean;
}

export interface BottomSheetStyles {
  sheet: ViewStyle;
  dialogContainer: ViewStyle;
  dialogSheet: ViewStyle;
  sidebarContainer: ViewStyle;
  sidebarSheet: ViewStyle;
  sidebarContent: ViewStyle;
  sidebarHeader: ViewStyle;
  content: ViewStyle;
  backdrop: ViewStyle;
  header: ViewStyle;
  closeButton: ViewStyle;
}

// Default sidebar dimensions - defined outside component for stability
const DEFAULT_SIDEBAR_MIN_WIDTH = 280;
const DEFAULT_SIDEBAR_MAX_WIDTH = 400;
const PADDING = 24;
const DIALOG_HORIZONTAL_MARGIN = 24;

/**
 * Memoized hook for BottomSheet styles.
 * Only recalculates when dependencies actually change.
 */
export default function useStyles({
  isDialog,
  isSidebar,
  maxHeigth,
  isDark,
  sidebarPosition = "left",
  sidebarWidth,
  sidebarMinWidth = DEFAULT_SIDEBAR_MIN_WIDTH,
  sidebarMaxWidth = DEFAULT_SIDEBAR_MAX_WIDTH,
  disableSafeArea = false,
}: BottomSheetStylesProps): BottomSheetStyles {
  const rawInsets = useSafeAreaInsets();

  // Memoize insets transformation
  const insets = useMemo(
    () =>
      disableSafeArea
        ? { top: 0, bottom: 0, left: 0, right: 0 }
        : rawInsets,
    [disableSafeArea, rawInsets.top, rawInsets.bottom, rawInsets.left, rawInsets.right]
  );

  // Memoize theme to avoid recalculating on every render
  const theme = useMemo(() => defaultTheme(isDark), [isDark]);

  // Memoize computed sidebar widths
  const computedSidebarMinWidth = sidebarWidth ?? sidebarMinWidth;
  const computedSidebarMaxWidth = sidebarWidth ?? sidebarMaxWidth;

  // Main styles memoization - only recalculate when relevant props change
  return useMemo(() => {
    const screenWidth = Dimensions.get("window").width;
    const screenHeight = Dimensions.get(isSidebar ? "screen" : "window").height;
    const { background, border, backdrop } = theme;

    const availableWidth = Math.max(
      0,
      (screenWidth || 0) - DIALOG_HORIZONTAL_MARGIN * 2
    );
    const dialogWidth = Math.min(500, availableWidth || 500);
    const maxSheetHeight = maxHeigth || screenHeight - insets.top - 90;

    return StyleSheet.create({
      sheet: {
        width: screenWidth || "100%",
        bottom: -20 * 1.1,
        maxHeight: maxSheetHeight,
        position: "absolute",
        zIndex: 2,
        backgroundColor: background,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        borderColor: border,
        overflow: "hidden",
        ...(isDark && {
          borderTopWidth: 1,
          borderLeftWidth: 1,
          borderRightWidth: 1,
        }),
        paddingBottom: 20 + PADDING,
      },
      dialogContainer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 2,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: DIALOG_HORIZONTAL_MARGIN,
        paddingVertical: 24,
      },
      dialogSheet: {
        width: dialogWidth || "100%",
        maxHeight: maxSheetHeight,
        position: "absolute",
        backgroundColor: background,
        borderRadius: 16,
        borderColor: border,
        overflow: "hidden",
        ...(isDark && {
          borderWidth: 1,
        }),
        paddingBottom: PADDING,
      },
      sidebarContainer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 2,
        flexDirection: "row",
        justifyContent: sidebarPosition === "left" ? "flex-start" : "flex-end",
        alignItems: "stretch",
      },
      sidebarSheet: {
        height: screenHeight,
        minWidth: computedSidebarMinWidth,
        maxWidth: computedSidebarMaxWidth,
        ...(sidebarWidth && { width: sidebarWidth }),
        backgroundColor: background,
        borderColor: border,
        overflow: "hidden",
        ...(sidebarPosition === "left"
          ? {
              borderTopRightRadius: 16,
              borderBottomRightRadius: 16,
            }
          : {
              borderTopLeftRadius: 16,
              borderBottomLeftRadius: 16,
            }),
        ...(isDark && {
          borderTopWidth: 1,
          borderBottomWidth: 1,
          ...(sidebarPosition === "left"
            ? { borderRightWidth: 1 }
            : { borderLeftWidth: 1 }),
        }),
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      },
      sidebarContent: {
        flex: 1,
        overflow: "hidden",
        paddingHorizontal: PADDING,
      },
      sidebarHeader: {
        paddingHorizontal: PADDING,
        paddingTop: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      },
      content: {
        overflow: "hidden",
        paddingHorizontal: PADDING,
        paddingBottom: isDialog || isSidebar ? 0 : insets.bottom,
      },
      backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: backdrop,
        zIndex: 1,
      },
      header: {
        paddingHorizontal: PADDING,
        paddingTop: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      },
      closeButton: {
        marginLeft: "auto",
        padding: 8,
      },
    });
  }, [
    isDialog,
    isSidebar,
    maxHeigth,
    isDark,
    sidebarPosition,
    sidebarWidth,
    computedSidebarMinWidth,
    computedSidebarMaxWidth,
    insets.top,
    insets.bottom,
    theme,
  ]);
}
