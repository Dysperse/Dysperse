import { BottomSheetBackdropProps, useBottomSheet } from "@gorhom/bottom-sheet";
import React, { useMemo } from "react";
import { Keyboard, Platform } from "react-native";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";

export const BottomSheetBackdropComponent = ({
  // animatedIndex,
  style,
  dismissible,
}: BottomSheetBackdropProps & {
  dismissible: boolean;
}) => {
  // animated variables
  const { forceClose, collapse, animatedIndex } = useBottomSheet();
  const handlePushDown = () => collapse();

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      animatedIndex.value,
      [-1, 0],
      [0, 0.5],
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
      setImmediate(() => forceClose({ overshootClamping: true, damping: 1 }));
    }
  };

  return (
    <Animated.View
      style={containerStyle as any}
      onPointerUp={dismissible === false ? handlePushDown : handleClose}
      onTouchEnd={dismissible === false ? handlePushDown : handleClose}
    />
  );
};
