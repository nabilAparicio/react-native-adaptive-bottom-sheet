import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AdaptiveBottomSheetProvider } from "react-native-adaptive-bottom-sheet";
import { Platform, StyleSheet } from "react-native";
import * as NavigationBar from "expo-navigation-bar";
import { useEffect } from "react";

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setVisibilityAsync("hidden");
    }
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <AdaptiveBottomSheetProvider>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          />
        </AdaptiveBottomSheetProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
