import { BottomSheetBackdropProps, useBottomSheet } from "@gorhom/bottom-sheet";
import React, { useMemo } from "react";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useColorTheme } from "../color/theme-provider";
import { Keyboard, Platform } from "react-native";

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

  return (
    <Animated.View
      style={containerStyle}
      onTouchEnd={() => {
        if (Platform.OS !== "web") {
          Keyboard.dismiss();
        }
        if (Platform.OS !== "web" && Keyboard.isVisible()) {
          setTimeout(forceClose, 200);
        } else {
          forceClose();
        }
      }}
    />
  );
};
