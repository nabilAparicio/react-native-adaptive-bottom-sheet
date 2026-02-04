import React, { useCallback, useEffect, useMemo } from "react";
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
  runOnJS,
  useAnimatedKeyboard,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Close from "./assets/CloseIcon";
import useStyles from "./BottomSheet.styles";
import type { BottomSheetProps, InternalBottomSheetProps } from "./types";
import { Portal, useDeviceMode, validateStyleOverrides } from "./utils";

// Animated components - created once outside component
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Constants
const OVERDRAG = 20;
const SIDEBAR_OVERDRAG = 30;

// Optimized spring configs - reduced mass for faster animations
const SPRING_CONFIG_BOTTOM_SHEET = { stiffness: 500, damping: 50, mass: 1.2 };
const SPRING_CONFIG_DIALOG = { stiffness: 400, damping: 40, mass: 1 };
const SPRING_CONFIG_SIDEBAR = { stiffness: 450, damping: 45, mass: 1 };
const SPRING_CONFIG_SNAP_BACK = { damping: 20, stiffness: 400 };

// Timing configs
const TIMING_BACKDROP_IN = { duration: 200 };
const TIMING_BACKDROP_OUT = { duration: 180 };
const TIMING_CLOSE = { duration: 180 };

function BottomSheet(props: BottomSheetProps) {
  const {
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
    sidebarPosition = "left",
    sidebarWidth,
    sidebarMinWidth = 280,
    sidebarMaxWidth = 400,
    sidebarDragToClose = true,
    disableSafeArea = false,
  } = props as InternalBottomSheetProps;

  // Use SharedValue instead of useRef for worklet-safe access
  const isFullOpened = useSharedValue(false);

  // Hooks
  const insets = useSafeAreaInsets();
  const keyboard = useAnimatedKeyboard({ isStatusBarTranslucentAndroid: true });
  const presentationMode = useDeviceMode(mode, tabletBreakpoint);

  // Animation phases: 0 = closed, 1 = animating, 2 = opened
  const isClosing = useSharedValue(false);
  const isOpenSV = useSharedValue<0 | 1>(0);
  const phase = useSharedValue<0 | 1 | 2>(0);

  // Dimensions and layout values
  const screenHeight = useSharedValue(Dimensions.get("window").height);
  const screenWidth = useSharedValue(Dimensions.get("window").width);
  const contentHeight = useSharedValue(0);
  const height = useSharedValue(fixedHeight || 0);

  // Sidebar-specific values
  const measuredSidebarWidth = useSharedValue(sidebarWidth || sidebarMinWidth);
  const sidebarOffsetX = useSharedValue(0);

  // Animation values
  const offset = useSharedValue(0);
  const scale = useSharedValue(1);
  const containerOpacity = useSharedValue(0);
  const backdropOpacity = useSharedValue(0);
  const presentationSV = useSharedValue<0 | 1 | 2>(0);

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
    disableSafeArea,
  });

  // Memoized safe top value
  const safeTop = useMemo(
    () => (disableSafeArea ? 0 : insets.top),
    [disableSafeArea, insets.top]
  );

  // Memoized callbacks to avoid recreation on every render
  const setStatusOpening = useCallback(
    () => bottomSheetInstance.setStatus("opening"),
    [bottomSheetInstance]
  );
  const setStatusOpen = useCallback(
    () => bottomSheetInstance.setStatus("open"),
    [bottomSheetInstance]
  );
  const setStatusClosed = useCallback(
    () => bottomSheetInstance.setStatus("closed"),
    [bottomSheetInstance]
  );

  // Close sheet handler - memoized
  const closeSheet = useCallback(() => {
    bottomSheetInstance.setStatus("closing");
    bottomSheetInstance.closeSheet(onDismiss);
  }, [bottomSheetInstance, onDismiss]);

  // Derived value for maximum allowed height (pure - no side effects)
  const capHeight = useDerivedValue(() => {
    const maxByScreen = screenHeight.get() - safeTop - 90;
    const propMax = maxHeight ?? Number.POSITIVE_INFINITY;
    return Math.min(propMax, maxByScreen);
  });

  // Use useAnimatedReaction to update height when dependencies change
  // This replaces the side-effect-full useDerivedValue
  useAnimatedReaction(
    () => {
      const cap = capHeight.get();
      const content = contentHeight.get();
      if (fixedHeight) {
        return Math.min(fixedHeight, cap);
      }
      return Math.min(content || cap, cap);
    },
    (current, previous) => {
      if (current !== previous && current > 0) {
        height.set(current);
      }
    },
    [fixedHeight]
  );

  // Opening animation reaction - cleaner separation of concerns
  useAnimatedReaction(
    () => ({
      wantsOpen: isOpenSV.get() === 1 && phase.get() === 0,
      presentationMode: presentationSV.get(),
      currentHeight: height.get(),
      currentCap: capHeight.get(),
    }),
    (current, previous) => {
      if (!current.wantsOpen) return;
      if (previous?.wantsOpen) return; // Already handled

      const isDialogMode = current.presentationMode === 1;
      const isSidebarMode = current.presentationMode === 2;

      // Validate we have height for bottom sheet mode
      if (!isDialogMode && !isSidebarMode) {
        const start = current.currentHeight > 0 ? current.currentHeight : current.currentCap;
        if (start <= 0) return;
      }

      // Begin animation phase
      phase.set(1);
      containerOpacity.set(1); // Direct set - no withTiming needed for instant

      // Notify JS thread - single call at start
      runOnJS(setStatusOpening)();

      // Set initial positions and animate based on mode
      if (isDialogMode) {
        offset.set(0);
        scale.set(0.96);
        sidebarOffsetX.set(0);
        backdropOpacity.set(withTiming(1, TIMING_BACKDROP_IN));
        scale.set(
          withSpring(1, SPRING_CONFIG_DIALOG, (finished) => {
            if (finished) {
              isFullOpened.set(true);
              phase.set(2);
              runOnJS(setStatusOpen)();
            }
          })
        );
      } else if (isSidebarMode) {
        const sidebarW = measuredSidebarWidth.get();
        sidebarOffsetX.set(sidebarPosition === "left" ? -sidebarW : sidebarW);
        offset.set(0);
        scale.set(1);
        backdropOpacity.set(withTiming(1, TIMING_BACKDROP_IN));
        sidebarOffsetX.set(
          withSpring(0, SPRING_CONFIG_SIDEBAR, (finished) => {
            if (finished) {
              isFullOpened.set(true);
              phase.set(2);
              runOnJS(setStatusOpen)();
            }
          })
        );
      } else {
        // Bottom sheet mode
        const start = current.currentHeight > 0 ? current.currentHeight : current.currentCap;
        offset.set(start);
        scale.set(1);
        sidebarOffsetX.set(0);
        backdropOpacity.set(withTiming(1, TIMING_BACKDROP_IN));
        offset.set(
          withSpring(0, SPRING_CONFIG_BOTTOM_SHEET, (finished) => {
            if (finished) {
              isFullOpened.set(true);
              phase.set(2);
              runOnJS(setStatusOpen)();
            }
          })
        );
      }
    },
    [sidebarPosition, setStatusOpening, setStatusOpen]
  );

  // Vertical pan gesture for bottom sheet and dialog modes
  const isVerticalPanEnabled =
    presentationMode === "bottomSheet" ||
    (presentationMode === "dialog" && dialogDragToClose);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .enabled(isVerticalPanEnabled)
        .onChange((event) => {
          "worklet";
          if (!isFullOpened.get()) return;

          const currentOffset = offset.get();
          const offsetDelta = event.changeY + currentOffset;
          const clamp = Math.max(-OVERDRAG, offsetDelta);

          // Direct interpolation - no withSpring in hot path
          if (offsetDelta > 0) {
            offset.set(offsetDelta);
          } else {
            // Resistance for upward drag - simple damping factor
            offset.set(clamp * 0.8);
          }

          // Update backdrop opacity
          const h = height.get();
          const nextBackdrop = interpolate(
            offset.get(),
            [0, h],
            [1, 0],
            Extrapolation.CLAMP
          );
          backdropOpacity.set(nextBackdrop);
        })
        .onFinalize(() => {
          "worklet";
          if (!isFullOpened.get()) return;

          const currentOffset = offset.get();
          const range = height.get();
          const threshold = Math.max(24, Math.min(80, range / 6));

          if (currentOffset < threshold) {
            // Snap back
            offset.set(withSpring(0, SPRING_CONFIG_SNAP_BACK));
            backdropOpacity.set(withTiming(1, { duration: 150 }));
          } else {
            // Close
            isClosing.set(true);
            offset.set(
              withTiming(range, TIMING_CLOSE, () => {
                runOnJS(closeSheet)();
              })
            );
            backdropOpacity.set(withTiming(0, TIMING_BACKDROP_OUT));
          }
        }),
    [isVerticalPanEnabled, closeSheet]
  );

  // Horizontal pan gesture for sidebar mode
  const sidebarPan = useMemo(
    () =>
      Gesture.Pan()
        .enabled(presentationMode === "sidebar" && sidebarDragToClose)
        .onChange((event) => {
          "worklet";
          if (!isFullOpened.get()) return;

          const isLeftSidebar = sidebarPosition === "left";
          const dragX = event.changeX;
          const currentOffset = sidebarOffsetX.get();
          let newOffset = currentOffset + dragX;

          // Apply resistance for overdrag
          if (isLeftSidebar) {
            if (newOffset > 0) {
              newOffset = Math.min(SIDEBAR_OVERDRAG, newOffset * 0.3);
            }
          } else {
            if (newOffset < 0) {
              newOffset = Math.max(-SIDEBAR_OVERDRAG, newOffset * 0.3);
            }
          }

          sidebarOffsetX.set(newOffset);

          // Update backdrop
          const sidebarW = measuredSidebarWidth.get();
          const dragDistance = isLeftSidebar
            ? Math.abs(Math.min(0, newOffset))
            : Math.abs(Math.max(0, newOffset));

          const nextBackdrop = interpolate(
            dragDistance,
            [0, sidebarW],
            [1, 0],
            Extrapolation.CLAMP
          );
          backdropOpacity.set(nextBackdrop);
        })
        .onFinalize((event) => {
          "worklet";
          if (!isFullOpened.get()) return;

          const isLeftSidebar = sidebarPosition === "left";
          const sidebarW = measuredSidebarWidth.get();
          const threshold = Math.max(50, sidebarW / 4);
          const velocityThreshold = 500;
          const currentOffset = sidebarOffsetX.get();

          let shouldClose = false;
          if (isLeftSidebar) {
            shouldClose =
              currentOffset < -threshold || event.velocityX < -velocityThreshold;
          } else {
            shouldClose =
              currentOffset > threshold || event.velocityX > velocityThreshold;
          }

          if (shouldClose) {
            isClosing.set(true);
            const closePosition = isLeftSidebar ? -sidebarW : sidebarW;
            sidebarOffsetX.set(
              withTiming(closePosition, TIMING_CLOSE, () => {
                runOnJS(closeSheet)();
              })
            );
            backdropOpacity.set(withTiming(0, TIMING_BACKDROP_OUT));
          } else {
            sidebarOffsetX.set(withSpring(0, SPRING_CONFIG_SNAP_BACK));
            backdropOpacity.set(withTiming(1, { duration: 150 }));
          }
        }),
    [presentationMode, sidebarDragToClose, sidebarPosition, closeSheet]
  );

  // Animated styles - optimized with minimal calculations
  const translateY = useAnimatedStyle(() => {
    const k = avoidKeyboard ? keyboard.height.get() : 0;
    return {
      transform: [{ translateY: offset.get() - k }, { scale: scale.get() }],
      opacity: containerOpacity.get(),
    };
  });

  const sidebarAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: sidebarOffsetX.get() }],
    opacity: containerOpacity.get(),
  }));

  const backdropOpacityStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.get(),
  }));

  // Layout handlers
  const onLayoutHandler = useCallback(
    (e: LayoutChangeEvent) => {
      if (fixedHeight) return;
      contentHeight.set(e.nativeEvent.layout.height);
    },
    [fixedHeight, contentHeight]
  );

  const onSidebarLayoutHandler = useCallback(
    (e: LayoutChangeEvent) => {
      const measuredWidth = e.nativeEvent.layout.width;
      if (!sidebarWidth && measuredWidth > 0) {
        measuredSidebarWidth.set(measuredWidth);
      }
    },
    [sidebarWidth, measuredSidebarWidth]
  );

  // Exit animations - simplified and optimized
  const backdropExiting = useCallback(() => {
    "worklet";
    return {
      initialValues: { opacity: backdropOpacity.get() },
      animations: {
        opacity: withTiming(0, TIMING_BACKDROP_OUT, () => {
          backdropOpacity.set(0);
        }),
      },
    };
  }, []);

  const sheetExiting = useCallback(() => {
    "worklet";
    const isDialogMode = presentationSV.get() === 1;
    const start = offset.get();
    const exitTo = height.get();
    const needsMove = Math.abs(exitTo - start) > 0.5;

    const animations = isDialogMode
      ? {
          transform: [
            { translateY: withTiming(exitTo, { duration: needsMove ? 180 : 0 }) },
            { scale: withTiming(0.96, { duration: 180 }) },
          ],
          opacity: withTiming(0, { duration: 180 }),
        }
      : {
          transform: [
            { translateY: withTiming(exitTo, { duration: needsMove ? 200 : 0 }) },
            { scale: withTiming(1, { duration: 0 }) },
          ],
          opacity: withTiming(1),
        };

    const initialValues = {
      transform: [{ translateY: start }, { scale: scale.get() }],
      opacity: containerOpacity.get(),
    };

    const callback = () => {
      "worklet";
      isFullOpened.set(false);
      phase.set(0);
      offset.set(0);
      scale.set(1);
      height.set(fixedHeight || 0);
      backdropOpacity.set(0);
      containerOpacity.set(0);
      sidebarOffsetX.set(0);
      runOnJS(setStatusClosed)();
    };

    return { initialValues, animations, callback };
  }, [fixedHeight, setStatusClosed]);

  const sidebarExiting = useCallback(() => {
    "worklet";
    const isLeftSidebar = sidebarPosition === "left";
    const sidebarW = measuredSidebarWidth.get();
    const start = sidebarOffsetX.get();
    const exitTo = isLeftSidebar ? -sidebarW : sidebarW;
    const needsMove = Math.abs(exitTo - start) > 0.5;

    return {
      initialValues: {
        transform: [{ translateX: start }],
        opacity: containerOpacity.get(),
      },
      animations: {
        transform: [
          { translateX: withTiming(exitTo, { duration: needsMove ? 200 : 0 }) },
        ],
        opacity: withTiming(1),
      },
      callback: () => {
        "worklet";
        isFullOpened.set(false);
        phase.set(0);
        offset.set(0);
        scale.set(1);
        height.set(fixedHeight || 0);
        backdropOpacity.set(0);
        containerOpacity.set(0);
        sidebarOffsetX.set(0);
        runOnJS(setStatusClosed)();
      },
    };
  }, [sidebarPosition, fixedHeight, setStatusClosed]);

  // Sync open state
  useEffect(() => {
    isOpenSV.set(bottomSheetInstance?.isOpen ? 1 : 0);
    if (bottomSheetInstance?.isOpen) {
      isClosing.set(false);
    }
  }, [bottomSheetInstance?.isOpen, isOpenSV, isClosing]);

  // Update presentation mode
  useEffect(() => {
    if (presentationMode === "dialog") {
      presentationSV.set(1);
    } else if (presentationMode === "sidebar") {
      presentationSV.set(2);
    } else {
      presentationSV.set(0);
    }
  }, [presentationMode, presentationSV]);

  // Validate style overrides (dev only)
  useEffect(() => {
    validateStyleOverrides(stylesOverride, "AdaptiveBottomSheet");
  }, [stylesOverride]);

  // Memoized content components to prevent unnecessary re-renders
  const closeButton = useMemo(
    () =>
      !hideCloseButton && (
        <TouchableOpacity
          {...closeButtonProps}
          style={[base.closeButton, stylesOverride?.closeButton]}
          onPress={closeSheet}
        >
          {renderCloseIcon ? (
            renderCloseIcon({ isDark: darkMode })
          ) : (
            <Close theme={{ isDark: darkMode }} />
          )}
        </TouchableOpacity>
      ),
    [
      hideCloseButton,
      closeButtonProps,
      base.closeButton,
      stylesOverride?.closeButton,
      closeSheet,
      renderCloseIcon,
      darkMode,
    ]
  );

  const sheetContent = useMemo(
    () => (
      <>
        <GestureDetector gesture={pan}>
          <View style={[base.header, stylesOverride?.header]}>
            {headerComponent}
            {closeButton}
          </View>
        </GestureDetector>
        <View style={[base.content, stylesOverride?.content]}>{children}</View>
      </>
    ),
    [pan, base.header, base.content, stylesOverride?.header, stylesOverride?.content, headerComponent, closeButton, children]
  );

  const sidebarContent = useMemo(
    () => (
      <>
        <GestureDetector gesture={sidebarPan}>
          <View style={[base.sidebarHeader, stylesOverride?.header]}>
            {headerComponent}
            {closeButton}
          </View>
        </GestureDetector>
        <View style={[base.sidebarContent, stylesOverride?.content]}>
          {children}
        </View>
      </>
    ),
    [sidebarPan, base.sidebarHeader, base.sidebarContent, stylesOverride?.header, stylesOverride?.content, headerComponent, closeButton, children]
  );

  // Render functions
  const renderSheetContent = useCallback(() => {
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

    return (
      <Animated.View
        style={[base.sheet, translateY, stylesOverride?.sheet]}
        exiting={sheetExiting}
        onLayout={onLayoutHandler}
      >
        {sheetContent}
      </Animated.View>
    );
  }, [
    presentationMode,
    base,
    stylesOverride,
    sidebarAnimatedStyle,
    sidebarExiting,
    onSidebarLayoutHandler,
    sidebarContent,
    translateY,
    sheetExiting,
    onLayoutHandler,
    sheetContent,
  ]);

  if (!bottomSheetInstance?.isOpen) {
    return null;
  }

  return (
    <Portal name={bottomSheetInstance.instanceID}>
      <AnimatedPressable
        style={[base.backdrop, backdropOpacityStyle, stylesOverride?.backdrop]}
        onPress={disableBackdropDismiss ? undefined : closeSheet}
        exiting={backdropExiting}
      />
      {renderSheetContent()}
    </Portal>
  );
}

export default BottomSheet;
