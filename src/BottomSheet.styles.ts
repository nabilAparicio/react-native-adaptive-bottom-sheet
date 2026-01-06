import { Dimensions, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { defaultTheme } from "./utils";

interface BottomSheetStylesProps {
  isDialog: boolean;
  maxHeigth?: number;
  isDark?: boolean;
}
export default ({ isDialog, maxHeigth, isDark }: BottomSheetStylesProps) => {
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get("window").width;
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
    content: {
      overflow: "hidden",
      paddingHorizontal: padding,
      paddingBottom: isDialog ? 0 : insetsBottom,
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
