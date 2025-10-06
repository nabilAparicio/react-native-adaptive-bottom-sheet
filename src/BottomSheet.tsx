import React, { ReactNode, useEffect, useRef } from "react";
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
import { BottomSheetHook } from "./useBottomSheet";
import { defaultTheme, Portal } from "./utils";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const OVERDRAG = 20;

export interface BottomSheetProps {
  children: ReactNode;
  bottomSheetInstance: BottomSheetHook;
  maxHeight?: number; // Upper limit by props
  fixedHeight?: number; // Fixed height (ignores measurement)
  headerComponent?: ReactNode;
  hideCloseButton?: boolean;
  disableBackdropDismiss?: boolean;
  avoidKeyboard?: boolean; // Keyboard adjustment
  onDismiss?: Function;
}

function BottomSheet({
  children,
  bottomSheetInstance,
  fixedHeight,
  maxHeight,
  headerComponent,
  hideCloseButton,
  avoidKeyboard = false,
  disableBackdropDismiss,
  onDismiss,
}: BottomSheetProps) {
  const theme = defaultTheme;
  // Enable gesture only when opening is complete
  const isFullOpened = useRef(false);

  const insets = useSafeAreaInsets();
  const keyboard = useAnimatedKeyboard({ isStatusBarTranslucentAndroid: true });

  // UI State
  const isClosing = useSharedValue(false); // closing in progress
  const isOpenSV = useSharedValue(0); // 0 closed, 1 open
  const phase = useSharedValue<0 | 1 | 2>(0); // 0 idle, 1 opening, 2 open

  // Heights
  const screenHeight = useSharedValue(Dimensions.get("window").height);
  const capHeight = useSharedValue(0); // sheet cap
  const contentHeight = useSharedValue(0); // measured by layout
  const height = useSharedValue(fixedHeight || 0); // effective height

  // Animation
  const offset = useSharedValue(0); // current translateY (0 = open)
  const containerOpacity = useSharedValue(0); // container visibility (prevents flash)
  const backdropOpacity = useSharedValue(0); // backdrop opacity

  const styles = useStyles(maxHeight);

  // Close from JS. Final movement is handled by gesture or `exiting`.
  const CloseSheet = () => {
    isClosing.value = true;
    bottomSheetInstance.closeSheet(onDismiss);
  };

  // Calculate cap and effective height in UI to avoid JS↔UI races
  useDerivedValue(() => {
    const maxByScreen = screenHeight.value - insets.top - 90;
    const propMax = maxHeight ?? Number.POSITIVE_INFINITY;

    const nextCap = Math.min(propMax, maxByScreen);
    if (capHeight.value !== nextCap) capHeight.value = nextCap;

    const desired = fixedHeight
      ? Math.min(fixedHeight, capHeight.value)
      : Math.min(contentHeight.value || capHeight.value, capHeight.value);

    if (height.value !== desired) height.value = desired;
  });

  // Manual opening: first frame off-screen and opacity 0, then animate to visible
  useDerivedValue(() => {
    const wantsOpen = isOpenSV.value === 1 && phase.value === 0;
    if (!wantsOpen) return;

    const start = height.value > 0 ? height.value : capHeight.value;
    if (start <= 0) return;

    phase.value = 1;
    offset.value = start;
    containerOpacity.value = 0;
    backdropOpacity.value = 0;

    containerOpacity.value = withTiming(1, { duration: 0 });
    offset.value = withSpring(
      0,
      { stiffness: 900, damping: 90, mass: 4 },
      (finished) => {
        if (finished) {
          isFullOpened.current = true;
          phase.value = 2;
        }
      }
    );
    backdropOpacity.value = withTiming(1, { duration: 250 });
  });

  // Drag gesture to close
  const pan = Gesture.Pan()
    .onChange((event) => {
      if (!isFullOpened.current) return;

      const offsetDelta = event.changeY + offset.value;
      const clamp = Math.max(-OVERDRAG, offsetDelta);
      const nextOffset = offsetDelta > 0 ? offsetDelta : clamp;

      offset.value = offsetDelta > 0 ? offsetDelta : withSpring(clamp);

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
      const threshold = Math.max(24, Math.min(80, range / 6));

      if (offset.value < threshold) {
        // Restore to open
        offset.value = withSpring(0, { damping: 15, mass: 0.9 });
        backdropOpacity.value = withTiming(1, { duration: 150 });
      } else {
        // Animate to sheet height and close on completion
        offset.value = withTiming(height.value, { duration: 200 }, () => {
          scheduleOnRN(CloseSheet);
        });
        backdropOpacity.value = withTiming(0, { duration: 200 });
      }
    });

  // Animated sheet style
  const translateY = useAnimatedStyle(() => {
    const k = avoidKeyboard ? keyboard.height.value : 0;
    const tY = offset.value - k;
    return { transform: [{ translateY: tY }], opacity: containerOpacity.value };
  });

  // Animated backdrop style
  const backdropOpacityStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  // Content measurement
  const onLayoutHandler = (e: LayoutChangeEvent) => {
    if (fixedHeight) return;
    contentHeight.value = e.nativeEvent.layout.height;
  };

  // Backdrop exiting on unmount
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

  // Sheet exiting: start from current `offset` to avoid "bounce"
  const sheetExiting = () => {
    "worklet";
    const start = offset.value; // current position when starting unmount
    const exitTo = height.value; // final exit destination
    const needsMove = Math.abs(exitTo - start) > 0.5;

    const animations = {
      transform: [
        { translateY: withTiming(exitTo, { duration: needsMove ? 250 : 0 }) },
      ],
      opacity: withTiming(1),
    };

    // Start from where the sheet actually is, not from 0
    const initialValues = {
      transform: [{ translateY: start }],
      opacity: containerOpacity.value,
    };

    const callback = () => {
      isFullOpened.current = false;
      phase.value = 0;
      offset.value = 0;
      height.value = fixedHeight || 0;
      backdropOpacity.value = 0;
      containerOpacity.value = 0;
    };

    return { initialValues, animations, callback };
  };

  // Synchronizes isOpen with controller hook
  useEffect(() => {
    isOpenSV.value = bottomSheetInstance?.isOpen ? 1 : 0;
    if (bottomSheetInstance?.isOpen) {
      isClosing.value = false;
    }
  }, [bottomSheetInstance?.isOpen, isOpenSV, isClosing]);

  return (
    <>
      {bottomSheetInstance?.isOpen && (
        <Portal name={bottomSheetInstance.instanceID}>
          {/* Clickable backdrop. No `entering`; manual opening controls opacity. */}
          <AnimatedPressable
            style={[styles.backdrop, backdropOpacityStyle]}
            onPress={disableBackdropDismiss ? undefined : CloseSheet}
            exiting={backdropExiting}
          />

          {/* Sheet container. No `entering`; manual opening controls offset and opacity. */}
          <Animated.View
            style={[styles.sheet, translateY]}
            exiting={sheetExiting}
            onLayout={onLayoutHandler}
          >
            <GestureDetector gesture={pan}>
              <View style={styles.header}>
                {headerComponent}
                {!hideCloseButton && (
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={CloseSheet}
                  >
                    <Close theme={theme} />
                  </TouchableOpacity>
                )}
              </View>
            </GestureDetector>

            <View style={styles.content}>{children}</View>
          </Animated.View>
        </Portal>
      )}
    </>
  );
}

export default BottomSheet;
