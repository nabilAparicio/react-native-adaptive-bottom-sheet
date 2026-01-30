import React, { useEffect, useRef } from "react";
import {
  Dimensions,
  LayoutChangeEvent,
  Pressable,
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
const SIDEBAR_OVERDRAG = 30; // Maximum overdrag distance for sidebar pan gestures

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
  // Sidebar props
  sidebarPosition = "left",
  sidebarWidth,
  sidebarMinWidth = 280,
  sidebarMaxWidth = 400,
  sidebarDragToClose = true,
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
  const screenWidth = useSharedValue(Dimensions.get("window").width);
  const capHeight = useSharedValue(0); // Maximum allowed height
  const contentHeight = useSharedValue(0); // Measured content height
  const height = useSharedValue(fixedHeight || 0); // Final sheet height

  // Sidebar-specific values
  const measuredSidebarWidth = useSharedValue(sidebarWidth || sidebarMinWidth); // Measured or configured sidebar width
  const sidebarOffsetX = useSharedValue(0); // Horizontal offset for sidebar position

  // Animation values for sheet positioning and appearance
  const offset = useSharedValue(0); // Vertical offset for sheet position
  const scale = useSharedValue(1); // Scale transform for dialog mode
  const containerOpacity = useSharedValue(0); // Sheet opacity
  const backdropOpacity = useSharedValue(0); // Backdrop opacity
  const presentationSV = useSharedValue<0 | 1 | 2>(0); // 0: bottomSheet, 1: dialog, 2: sidebar
  const isDialog = presentationMode === "dialog";
  const isSidebar = presentationMode === "sidebar";

  const base = useStyles({
    isDialog,
    isSidebar,
    maxHeigth: maxHeight,
    isDark: darkMode,
    sidebarPosition,
    sidebarWidth,
    sidebarMinWidth,
    sidebarMaxWidth,
  });

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

    const isDialogMode = presentationSV.value === 1;
    const isSidebarMode = presentationSV.value === 2;

    // In bottom sheet mode we need a valid start height before flipping phase
    if (!isDialogMode && !isSidebarMode) {
      const start = height.value > 0 ? height.value : capHeight.value;
      if (start <= 0) return;
    }

    // Initialize animation state
    phase.value = 1; // Move to animating phase
    containerOpacity.value = 0;
    backdropOpacity.value = 0;

    // Set initial positions based on presentation mode
    if (isDialogMode) {
      offset.value = 0;
      scale.value = 0.96; // Start slightly scaled down
      sidebarOffsetX.value = 0;
    } else if (isSidebarMode) {
      // Sidebar starts off-screen based on position
      const sidebarW = measuredSidebarWidth.value;
      // For left sidebar: start at -width (off-screen left)
      // For right sidebar: start at +width (off-screen right)
      sidebarOffsetX.value = sidebarPosition === "left" ? -sidebarW : sidebarW;
      offset.value = 0;
      scale.value = 1;
    } else {
      const start = height.value > 0 ? height.value : capHeight.value;
      offset.value = start; // Start below screen
      scale.value = 1;
      sidebarOffsetX.value = 0;
    }

    containerOpacity.value = withTiming(1, { duration: 0 }); // Immediate opacity

    // Animate to final position
    if (isDialogMode) {
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
    } else if (isSidebarMode) {
      // Animate sidebar sliding in horizontally
      sidebarOffsetX.value = withSpring(
        0,
        { stiffness: 800, damping: 80, mass: 2 }, // Smooth horizontal slide
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

  // Pan gesture for drag-to-close functionality (vertical - bottom sheet and dialog)
  // Sidebar mode uses a separate horizontal gesture (sidebarPan)
  const isVerticalPanEnabled =
    presentationMode === "bottomSheet" ||
    (presentationMode === "dialog" && dialogDragToClose);

  const pan = Gesture.Pan()
    .enabled(isVerticalPanEnabled)
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

  // Horizontal pan gesture for sidebar drag-to-close functionality
  const sidebarPan = Gesture.Pan()
    .enabled(presentationMode === "sidebar" && sidebarDragToClose)
    .onChange((event) => {
      "worklet";
      if (!isFullOpened.current) return; // Only respond when fully opened

      const isLeftSidebar = sidebarPosition === "left";
      const dragX = event.changeX;

      // Calculate new offset
      let newOffset = sidebarOffsetX.value + dragX;

      // For left sidebar: negative drag (left) closes, positive (right) is overdrag
      // For right sidebar: positive drag (right) closes, negative (left) is overdrag
      if (isLeftSidebar) {
        // Left sidebar: can drag left to close, resist dragging right
        if (newOffset > 0) {
          // Overdrag to the right - apply resistance
          newOffset = Math.min(SIDEBAR_OVERDRAG, newOffset * 0.3);
        }
        // No need to clamp negative values (closing direction)
      } else {
        // Right sidebar: can drag right to close, resist dragging left
        if (newOffset < 0) {
          // Overdrag to the left - apply resistance
          newOffset = Math.max(-SIDEBAR_OVERDRAG, newOffset * 0.3);
        }
        // No need to clamp positive values (closing direction)
      }

      sidebarOffsetX.value = newOffset;

      // Fade backdrop based on drag distance
      const sidebarW = measuredSidebarWidth.value;
      const dragDistance = isLeftSidebar
        ? Math.abs(Math.min(0, newOffset)) // How far left we've dragged
        : Math.abs(Math.max(0, newOffset)); // How far right we've dragged

      const nextBackdrop = interpolate(
        dragDistance,
        [0, sidebarW],
        [1, 0],
        Extrapolation.CLAMP
      );
      backdropOpacity.value = nextBackdrop;
    })
    .onFinalize((event) => {
      "worklet";
      if (!isFullOpened.current) return;

      const isLeftSidebar = sidebarPosition === "left";
      const sidebarW = measuredSidebarWidth.value;

      // Calculate threshold for closing (1/4 of sidebar width or velocity-based)
      const threshold = Math.max(50, sidebarW / 4);
      const velocityThreshold = 500;

      // Determine if we should close based on position or velocity
      let shouldClose = false;

      if (isLeftSidebar) {
        // Left sidebar: close if dragged far enough left or fast enough left
        shouldClose =
          sidebarOffsetX.value < -threshold ||
          event.velocityX < -velocityThreshold;
      } else {
        // Right sidebar: close if dragged far enough right or fast enough right
        shouldClose =
          sidebarOffsetX.value > threshold ||
          event.velocityX > velocityThreshold;
      }

      if (shouldClose) {
        // Close the sidebar
        const closePosition = isLeftSidebar ? -sidebarW : sidebarW;
        sidebarOffsetX.value = withTiming(
          closePosition,
          { duration: 200 },
          () => {
            scheduleOnRN(CloseSheet);
          }
        );
        backdropOpacity.value = withTiming(0, { duration: 200 });
      } else {
        // Snap back to open position
        sidebarOffsetX.value = withSpring(0, { damping: 20, stiffness: 300 });
        backdropOpacity.value = withTiming(1, { duration: 150 });
      }
    });

  // Animated styles for sheet positioning and appearance (vertical modes)
  const translateY = useAnimatedStyle(() => {
    const k = avoidKeyboard ? keyboard.height.value : 0;
    const tY = offset.value - k; // Adjust for keyboard when avoiding
    return {
      transform: [{ translateY: tY }, { scale: scale.value }],
      opacity: containerOpacity.value,
    };
  });

  // Animated styles for sidebar (horizontal mode)
  const sidebarAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: sidebarOffsetX.value }],
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

  // Handle layout changes to measure sidebar width for animations
  const onSidebarLayoutHandler = (e: LayoutChangeEvent) => {
    const measuredWidth = e.nativeEvent.layout.width;
    // Only update if we don't have a fixed width and measured width is valid
    if (!sidebarWidth && measuredWidth > 0) {
      measuredSidebarWidth.value = measuredWidth;
    }
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
    const isDialogMode = presentationSV.value === 1;
    const start = offset.value;
    const exitTo = height.value;
    const needsMove = Math.abs(exitTo - start) > 0.5; // Only animate if significant movement needed

    const animations = isDialogMode
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
      sidebarOffsetX.value = 0;
    };

    return { initialValues, animations, callback };
  };

  // Exit animation for sidebar mode (horizontal slide out)
  const sidebarExiting = () => {
    "worklet";
    const isLeftSidebar = sidebarPosition === "left";
    const sidebarW = measuredSidebarWidth.value;
    const start = sidebarOffsetX.value;
    const exitTo = isLeftSidebar ? -sidebarW : sidebarW;
    const needsMove = Math.abs(exitTo - start) > 0.5;

    const animations = {
      transform: [
        {
          translateX: withTiming(exitTo, { duration: needsMove ? 250 : 0 }),
        },
      ],
      opacity: withTiming(1), // Keep opacity while sliding out
    };

    const initialValues = {
      transform: [{ translateX: start }],
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
      sidebarOffsetX.value = 0;
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
    if (presentationMode === "dialog") {
      presentationSV.value = 1;
    } else if (presentationMode === "sidebar") {
      presentationSV.value = 2;
    } else {
      presentationSV.value = 0;
    }
  }, [presentationMode, presentationSV]);

  // Validate style overrides for debugging
  useEffect(() => {
    validateStyleOverrides(stylesOverride, "AdaptiveBottomSheet");
  }, [stylesOverride]);

  // Shared content for dialog and bottom sheet modes
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

  // Sidebar-specific content with horizontal gesture
  const sidebarContent = (
    <>
      <GestureDetector gesture={sidebarPan}>
        <View style={[base.sidebarHeader, stylesOverride?.header]}>
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
      <View style={[base.sidebarContent, stylesOverride?.content]}>
        {children}
      </View>
    </>
  );

  // Render the appropriate mode
  const renderSheetContent = () => {
    if (presentationMode === "sidebar") {
      return (
        <View
          style={[base.sidebarContainer, stylesOverride?.sidebarContainer]}
          pointerEvents="box-none"
        >
          <Animated.View
            style={[base.sidebarSheet, sidebarAnimatedStyle, stylesOverride?.sheet]}
            exiting={sidebarExiting}
            onLayout={onSidebarLayoutHandler}
          >
            {sidebarContent}
          </Animated.View>
        </View>
      );
    }

    if (presentationMode === "dialog") {
      return (
        <View style={base.dialogContainer}>
          <Animated.View
            style={[base.dialogSheet, translateY, stylesOverride?.sheet]}
            exiting={sheetExiting}
            onLayout={onLayoutHandler}
          >
            {sheetContent}
          </Animated.View>
        </View>
      );
    }

    // Default: bottom sheet mode
    return (
      <Animated.View
        style={[base.sheet, translateY, stylesOverride?.sheet]}
        exiting={sheetExiting}
        onLayout={onLayoutHandler}
      >
        {sheetContent}
      </Animated.View>
    );
  };

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
          {renderSheetContent()}
        </Portal>
      )}
    </>
  );
}

export default BottomSheet;
