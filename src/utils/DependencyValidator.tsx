import React, { ReactNode, useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Validates that required peer dependencies are properly installed and configured.
 * Provides helpful error messages with installation instructions if dependencies are missing.
 */
export default function DependencyValidator({
  children,
}: {
  children: ReactNode;
}) {
  // Validate react-native-safe-area-context
  let safeAreaError: Error | null = null;
  try {
    // This will throw if SafeAreaProvider is not in the tree
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useSafeAreaInsets();
  } catch (error) {
    safeAreaError = error as Error;
  }

  useEffect(() => {
    if (safeAreaError) {
      console.error(
        "\n❌ AdaptiveBottomSheetProvider Error:\n" +
          "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
          "SafeAreaProvider is missing from your app.\n\n" +
          "You need to wrap your app with SafeAreaProvider:\n\n" +
          "import { SafeAreaProvider } from 'react-native-safe-area-context';\n\n" +
          "<SafeAreaProvider>\n" +
          "  <AdaptiveBottomSheetProvider>\n" +
          "    {/* Your app */}\n" +
          "  </AdaptiveBottomSheetProvider>\n" +
          "</SafeAreaProvider>\n" +
          "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
      );

      throw new Error(
        "AdaptiveBottomSheetProvider requires SafeAreaProvider. " +
          "Please wrap your app with <SafeAreaProvider> from 'react-native-safe-area-context'. " +
          "See console for details."
      );
    }

    // Validate react-native-gesture-handler
    try {
      // Try to import GestureHandlerRootView to check if it's installed
      require("react-native-gesture-handler");
    } catch (error) {
      console.error(
        "\n❌ AdaptiveBottomSheetProvider Error:\n" +
          "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
          "react-native-gesture-handler is not installed.\n\n" +
          "Install it by running:\n\n" +
          "npm install react-native-gesture-handler\n" +
          "# or\n" +
          "yarn add react-native-gesture-handler\n\n" +
          "And make sure to wrap your app with GestureHandlerRootView.\n" +
          "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
      );

      throw new Error(
        "AdaptiveBottomSheetProvider requires react-native-gesture-handler. " +
          "Please install it and configure it properly. See console for details."
      );
    }

    // Validate react-native-reanimated
    try {
      require("react-native-reanimated");
    } catch (error) {
      console.error(
        "\n❌ AdaptiveBottomSheetProvider Error:\n" +
          "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
          "react-native-reanimated is not installed.\n\n" +
          "Install it by running:\n\n" +
          "npm install react-native-reanimated\n" +
          "# or\n" +
          "yarn add react-native-reanimated\n\n" +
          "Follow the setup guide at:\n" +
          "https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/\n" +
          "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
      );

      throw new Error(
        "AdaptiveBottomSheetProvider requires react-native-reanimated. " +
          "Please install it and configure it properly. See console for details."
      );
    }

    // Validate react-native-svg
    try {
      require("react-native-svg");
    } catch (error) {
      console.error(
        "\n❌ AdaptiveBottomSheetProvider Error:\n" +
          "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
          "react-native-svg is not installed.\n\n" +
          "Install it by running:\n\n" +
          "npm install react-native-svg\n" +
          "# or\n" +
          "yarn add react-native-svg\n" +
          "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
      );

      throw new Error(
        "AdaptiveBottomSheetProvider requires react-native-svg. " +
          "Please install it. See console for details."
      );
    }

    // Validate react-native-worklets
    try {
      require("react-native-worklets");
    } catch (error) {
      console.error(
        "\n❌ AdaptiveBottomSheetProvider Error:\n" +
          "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
          "react-native-worklets is not installed.\n\n" +
          "Install it by running:\n\n" +
          "npm install react-native-worklets\n" +
          "# or\n" +
          "yarn add react-native-worklets\n" +
          "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
      );

      throw new Error(
        "AdaptiveBottomSheetProvider requires react-native-worklets. " +
          "Please install it. See console for details."
      );
    }
  }, [safeAreaError]);

  if (safeAreaError) {
    return null; // Error will be thrown in useEffect
  }

  return <>{children}</>;
}
