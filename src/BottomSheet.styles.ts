import { Dimensions, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { defaultTheme } from "./utils";

export default (maxHeigth?: number) => {
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get("window").width;
  const theme = defaultTheme;
  const { colors, isDark } = theme;
  const padding = 24;
  const styles = StyleSheet.create({
    sheet: {
      width: screenWidth || "100%",
      bottom: -20 * 1.1,
      maxHeight: maxHeigth || Dimensions.get("window").height - insets.top - 90,
      position: "absolute",
      zIndex: 2,
      backgroundColor: colors.background,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      borderColor: "#D9D9D94D",
      overflow: "hidden",
      // Additional styles for dark theme
      ...(isDark && {
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
      }),
      paddingBottom: 20 + padding,
    },
    content: {
      overflow: "hidden",
      paddingHorizontal: padding,
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "#000000BF",
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
