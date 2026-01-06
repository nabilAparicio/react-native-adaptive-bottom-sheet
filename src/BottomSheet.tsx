import React, { useEffect, useRef } from "react";
import {
  Dimensions,
  LayoutChangeEvent,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import "react-native-gesture-handler";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedKeyboard,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Close from "./assets/CloseIcon";
import useStyles from "./BottomSheet.styles";
import type { BottomSheetProps } from "./types";
import { Portal, useDeviceMode, validateStyleOverrides } from "./utils";

// Animated components
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Constants
const OVERDRAG = 20; // Maximum overdrag distance for pan gestures

function BottomSheet({
  children,
  bottomSheetInstance,
  fixedHeight,
  maxHeight,
  headerComponent,
  hideCloseButton,
  avoidKeyboard = false,
  disableBackdropDismiss,
  darkMode = false,
  onDismiss,
  styles: stylesOverride,
  renderCloseIcon,
  closeButtonProps,
  mode = "auto",
  tabletBreakpoint = 768,
  dialogDragToClose = true,
}: BottomSheetProps) {
  // Refs
  const isFullOpened = useRef(false); // Tracks if sheet is fully opened and interactive

  // Hooks
  const insets = useSafeAreaInsets();
  const keyboard = useAnimatedKeyboard({ isStatusBarTranslucentAndroid: true });
  const presentationMode = useDeviceMode(mode, tabletBreakpoint);

  // Animation phases: 0 = closed, 1 = animating, 2 = opened
  const isClosing = useSharedValue(false);
  const isOpenSV = useSharedValue(0); // 0 = closed, 1 = open
  const phase = useSharedValue<0 | 1 | 2>(0); // Animation lifecycle phase

  // Dimensions and layout values
  const screenHeight = useSharedValue(Dimensions.get("window").height);
  const capHeight = useSharedValue(0); // Maximum allowed height
  const contentHeight = useSharedValue(0); // Measured content height
  const height = useSharedValue(fixedHeight || 0); // Final sheet height

  // Animation values for sheet positioning and appearance
  const offset = useSharedValue(0); // Vertical offset for sheet position
  const scale = useSharedValue(1); // Scale transform for dialog mode
  const containerOpacity = useSharedValue(0); // Sheet opacity
  const backdropOpacity = useSharedValue(0); // Backdrop opacity
  const presentationSV = useSharedValue<0 | 1>(0); // 0: bottomSheet, 1: dialog
  const isDialog = presentationMode === "dialog";

  const base = useStyles({ isDialog, maxHeigth: maxHeight, isDark: darkMode });

  // Closes the bottom sheet with animation
  const CloseSheet = () => {
    isClosing.value = true;
    bottomSheetInstance.closeSheet(onDismiss);
  };

  // Calculate and update sheet height constraints
  useDerivedValue(() => {
    const maxByScreen = screenHeight.value - insets.top - 90; // Account for status bar and safe area
    const propMax = maxHeight ?? Number.POSITIVE_INFINITY;

    const nextCap = Math.min(propMax, maxByScreen);
    if (capHeight.value !== nextCap) capHeight.value = nextCap;

    // Use fixed height if provided, otherwise dynamic based on content or screen constraints
    const desired = fixedHeight
      ? Math.min(fixedHeight, capHeight.value)
      : Math.min(contentHeight.value || capHeight.value, capHeight.value);

    if (height.value !== desired) height.value = desired;
  });

  // Handle sheet opening animation when transitioning from closed to open state
  useDerivedValue(() => {
    const wantsOpen = isOpenSV.value === 1 && phase.value === 0;
    if (!wantsOpen) return;

    const isDialog = presentationSV.value === 1;

    // In bottom sheet mode we need a valid start height before flipping phase
    if (!isDialog) {
      const start = height.value > 0 ? height.value : capHeight.value;
      if (start <= 0) return;
    }

    // Initialize animation state
    phase.value = 1; // Move to animating phase
    containerOpacity.value = 0;
    backdropOpacity.value = 0;

    // Set initial positions based on presentation mode
    if (isDialog) {
      offset.value = 0;
      scale.value = 0.96; // Start slightly scaled down
    } else {
      const start = height.value > 0 ? height.value : capHeight.value;
      offset.value = start; // Start below screen
      scale.value = 1;
    }

    containerOpacity.value = withTiming(1, { duration: 0 }); // Immediate opacity

    // Animate to final position
    if (isDialog) {
      scale.value = withSpring(
        1,
        { stiffness: 700, damping: 70, mass: 2.2 }, // Smooth spring animation
        (finished) => {
          if (finished) {
            isFullOpened.current = true;
            phase.value = 2; // Move to fully opened phase
          }
        }
      );
    } else {
      offset.value = withSpring(
        0,
        { stiffness: 900, damping: 90, mass: 4 }, // Stronger spring for bottom sheet
        (finished) => {
          if (finished) {
            isFullOpened.current = true;
            phase.value = 2; // Move to fully opened phase
          }
        }
      );
    }
    backdropOpacity.value = withTiming(1, { duration: 250 }); // Fade in backdrop
  });

  // Pan gesture for drag-to-close functionality
  const pan = Gesture.Pan()
    .enabled(
      // Enable for bottom sheet mode or dialog mode when drag-to-close is enabled
      presentationMode === "bottomSheet" ||
        (presentationMode === "dialog" && dialogDragToClose)
    )
    .onChange((event) => {
      if (!isFullOpened.current) return; // Only respond when fully opened

      const offsetDelta = event.changeY + offset.value;
      const clamp = Math.max(-OVERDRAG, offsetDelta); // Prevent excessive upward drag
      const nextOffset = offsetDelta > 0 ? offsetDelta : clamp;

      // Apply resistance for upward drag, smooth for downward
      offset.value = offsetDelta > 0 ? offsetDelta : withSpring(clamp);

      // Fade backdrop based on drag distance
      const nextBackdrop = interpolate(
        nextOffset,
        [0, height.value],
        [1, 0],
        Extrapolation.CLAMP
      );
      backdropOpacity.value = nextBackdrop;
    })
    .onFinalize(() => {
      if (!isFullOpened.current) return;

      const range = height.value;
      // Dynamic threshold: minimum 24px, maximum 80px, or 1/6 of sheet height
      const threshold = Math.max(24, Math.min(80, range / 6));

      if (offset.value < threshold) {
        // Drag distance below threshold - snap back to open position
        offset.value = withSpring(0, { damping: 15, mass: 0.9 });
        backdropOpacity.value = withTiming(1, { duration: 150 });
      } else {
        // Drag distance above threshold - close the sheet
        offset.value = withTiming(height.value, { duration: 200 }, () => {
          scheduleOnRN(CloseSheet); // Schedule close on React Native thread
        });
        backdropOpacity.value = withTiming(0, { duration: 200 });
      }
    });

  // Animated styles for sheet positioning and appearance
  const translateY = useAnimatedStyle(() => {
    const k = avoidKeyboard ? keyboard.height.value : 0;
    const tY = offset.value - k; // Adjust for keyboard when avoiding
    return {
      transform: [{ translateY: tY }, { scale: scale.value }],
      opacity: containerOpacity.value,
    };
  });

  const backdropOpacityStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  // Handle layout changes to measure content height for dynamic sizing
  const onLayoutHandler = (e: LayoutChangeEvent) => {
    if (fixedHeight) return; // Skip measurement for fixed height sheets
    contentHeight.value = e.nativeEvent.layout.height;
  };

  // Exit animation for backdrop
  const backdropExiting = () => {
    "worklet";
    const animations = {
      opacity: withTiming(0, { duration: 250 }, () => {
        backdropOpacity.value = 0;
      }),
    };
    const initialValues = { opacity: backdropOpacity.value };
    return { initialValues, animations };
  };

  // Exit animation for sheet based on presentation mode
  const sheetExiting = () => {
    "worklet";
    const isDialog = presentationSV.value === 1;
    const start = offset.value;
    const exitTo = height.value;
    const needsMove = Math.abs(exitTo - start) > 0.5; // Only animate if significant movement needed

    const animations = isDialog
      ? {
          // Dialog mode: fade out and scale down slightly
          transform: [
            {
              translateY: withTiming(exitTo, { duration: needsMove ? 200 : 0 }),
            },
            { scale: withTiming(0.96, { duration: 200 }) },
          ],
          opacity: withTiming(0, { duration: 200 }),
        }
      : {
          // Bottom sheet mode: slide down and maintain scale
          transform: [
            {
              translateY: withTiming(exitTo, { duration: needsMove ? 250 : 0 }),
            },
            { scale: withTiming(1, { duration: 0 }) },
          ],
          opacity: withTiming(1),
        };

    const initialValues = {
      transform: [{ translateY: start }, { scale: scale.value }],
      opacity: containerOpacity.value,
    };

    // Reset all animation values after exit animation completes
    const callback = () => {
      isFullOpened.current = false;
      phase.value = 0; // Return to closed phase
      offset.value = 0;
      scale.value = 1;
      height.value = fixedHeight || 0;
      backdropOpacity.value = 0;
      containerOpacity.value = 0;
    };

    return { initialValues, animations, callback };
  };

  // Sync open state with shared value and reset closing flag when opened
  useEffect(() => {
    isOpenSV.value = bottomSheetInstance?.isOpen ? 1 : 0;
    if (bottomSheetInstance?.isOpen) {
      isClosing.value = false; // Reset closing state when opening
    }
  }, [bottomSheetInstance?.isOpen, isOpenSV, isClosing]);

  // Update presentation mode shared value when device mode changes
  useEffect(() => {
    presentationSV.value = presentationMode === "dialog" ? 1 : 0;
  }, [presentationMode, presentationSV]);

  // Validate style overrides for debugging
  useEffect(() => {
    validateStyleOverrides(stylesOverride, "AdaptiveBottomSheet");
  }, [stylesOverride]);

  // Shared content for both dialog and bottom sheet modes
  const sheetContent = (
    <>
      <GestureDetector gesture={pan}>
        <View style={[base.header, stylesOverride?.header]}>
          {headerComponent}
          {!hideCloseButton && (
            <TouchableOpacity
              {...closeButtonProps}
              style={[base.closeButton, stylesOverride?.closeButton]}
              onPress={CloseSheet}
            >
              {renderCloseIcon ? (
                renderCloseIcon({ isDark: darkMode })
              ) : (
                <Close theme={{ isDark: darkMode }} />
              )}
            </TouchableOpacity>
          )}
        </View>
      </GestureDetector>
      <View style={[base.content, stylesOverride?.content]}>{children}</View>
    </>
  );

  return (
    <>
      {bottomSheetInstance?.isOpen && (
        <Portal name={bottomSheetInstance.instanceID}>
          <AnimatedPressable
            style={[
              base.backdrop,
              backdropOpacityStyle,
              stylesOverride?.backdrop,
            ]}
            onPress={disableBackdropDismiss ? undefined : CloseSheet}
            exiting={backdropExiting}
          />

          {presentationMode === "dialog" ? (
            <View style={base.dialogContainer}>
              <Animated.View
                style={[base.dialogSheet, translateY, stylesOverride?.sheet]}
                exiting={sheetExiting}
                onLayout={onLayoutHandler}
              >
                {sheetContent}
              </Animated.View>
            </View>
          ) : (
            <Animated.View
              style={[base.sheet, translateY, stylesOverride?.sheet]}
              exiting={sheetExiting}
              onLayout={onLayoutHandler}
            >
              {sheetContent}
            </Animated.View>
          )}
        </Portal>
      )}
    </>
  );
}

export default BottomSheet;
