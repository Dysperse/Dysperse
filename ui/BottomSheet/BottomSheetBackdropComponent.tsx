import React, { useMemo } from "react";
import { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useColorTheme } from "../color/theme-provider";
import { BlurView } from "expo-blur";

export const BottomSheetBackdropComponent = ({
  animatedIndex,
  style,
}: BottomSheetBackdropProps) => {
  const theme = useColorTheme();
  // animated variables
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
    // <BlurView
    //   intensity={5}
    //   style={{
    //     height: "100%",
    //     width: "100%",
    //     position: "absolute",
    //   }}
    // >
    <Animated.View style={containerStyle} />
    // </BlurView>
  );
};
