import { Dimensions, StyleSheet } from "react-native";
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
}

// Default sidebar dimensions
const DEFAULT_SIDEBAR_MIN_WIDTH = 280;
const DEFAULT_SIDEBAR_MAX_WIDTH = 400;

export default ({
  isDialog,
  isSidebar,
  maxHeigth,
  isDark,
  sidebarPosition = "left",
  sidebarWidth,
  sidebarMinWidth = DEFAULT_SIDEBAR_MIN_WIDTH,
  sidebarMaxWidth = DEFAULT_SIDEBAR_MAX_WIDTH,
}: BottomSheetStylesProps) => {
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;
  const insetsBottom = insets.bottom;
  const theme = defaultTheme(isDark);
  const { background, border, backdrop } = theme;
  const padding = 24;
  const dialogHorizontalMargin = 24;
  const availableWidth = Math.max(
    0,
    (screenWidth || 0) - dialogHorizontalMargin * 2
  );
  const dialogWidth = Math.min(500, availableWidth || 500);

  // Calculate sidebar width constraints
  const computedSidebarMinWidth = sidebarWidth ?? sidebarMinWidth;
  const computedSidebarMaxWidth = sidebarWidth ?? sidebarMaxWidth;

  const styles = StyleSheet.create({
    sheet: {
      width: screenWidth || "100%",
      bottom: -20 * 1.1,
      maxHeight: maxHeigth || Dimensions.get("window").height - insets.top - 90,
      position: "absolute",
      zIndex: 2,
      backgroundColor: background,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      borderColor: border,
      overflow: "hidden",
      // Additional styles for dark theme
      ...(isDark && {
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
      }),
      paddingBottom: 20 + padding,
    },
    dialogContainer: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 2,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: dialogHorizontalMargin,
      paddingVertical: 24,
    },
    dialogSheet: {
      width: dialogWidth || "100%",
      maxHeight: maxHeigth || Dimensions.get("window").height - insets.top - 90,
      position: "absolute",
      backgroundColor: background,
      borderRadius: 16,
      borderColor: border,
      overflow: "hidden",
      ...(isDark && {
        borderWidth: 1,
      }),
      paddingBottom: padding,
    },
    // Sidebar container - positions the sidebar on left or right
    sidebarContainer: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 2,
      flexDirection: "row",
      justifyContent: sidebarPosition === "left" ? "flex-start" : "flex-end",
      alignItems: "stretch",
    },
    // Sidebar sheet styles
    sidebarSheet: {
      height: screenHeight,
      minWidth: computedSidebarMinWidth,
      maxWidth: computedSidebarMaxWidth,
      ...(sidebarWidth && { width: sidebarWidth }),
      backgroundColor: background,
      borderColor: border,
      overflow: "hidden",
      // Border radius based on position
      ...(sidebarPosition === "left"
        ? {
            borderTopRightRadius: 16,
            borderBottomRightRadius: 16,
          }
        : {
            borderTopLeftRadius: 16,
            borderBottomLeftRadius: 16,
          }),
      // Dark mode borders
      ...(isDark && {
        borderTopWidth: 1,
        borderBottomWidth: 1,
        ...(sidebarPosition === "left"
          ? { borderRightWidth: 1 }
          : { borderLeftWidth: 1 }),
      }),
      paddingTop: insets.top,
      paddingBottom: insetsBottom,
    },
    // Sidebar content with safe area padding
    sidebarContent: {
      flex: 1,
      overflow: "hidden",
      paddingHorizontal: padding,
    },
    // Sidebar header
    sidebarHeader: {
      paddingHorizontal: padding,
      paddingTop: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    content: {
      overflow: "hidden",
      paddingHorizontal: padding,
      paddingBottom: isDialog || isSidebar ? 0 : insetsBottom,
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: backdrop,
      zIndex: 1,
    },
    header: {
      paddingHorizontal: padding,
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
  return styles;
};
