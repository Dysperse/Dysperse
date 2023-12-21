import { BottomSheetBackdropProps, useBottomSheet } from "@gorhom/bottom-sheet";
import React, { useMemo } from "react";
import { Keyboard, Platform } from "react-native";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";

export const BottomSheetBackdropComponent = ({
  animatedIndex,
  style,
}: BottomSheetBackdropProps) => {
  // animated variables
  const { forceClose } = useBottomSheet();
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      animatedIndex.value,
      [-1, 0],
      [0, 0.35],
      Extrapolate.CLAMP
    ),
  }));

  // styles
  const containerStyle = useMemo(
    () => [
      style,
      {
        backgroundColor: "#000",
      },
      containerAnimatedStyle,
    ],
    [style, containerAnimatedStyle]
  );

  const handleClose = () => {
    if (Platform.OS !== "web") {
      Keyboard.dismiss();
    }
    if (Platform.OS !== "web" && Keyboard.isVisible()) {
      setTimeout(forceClose, 200);
    } else {
      forceClose();
    }
  };

  return (
    <Animated.View
      style={containerStyle}
      onPointerUp={handleClose}
      onTouchEnd={handleClose}
    />
  );
};
