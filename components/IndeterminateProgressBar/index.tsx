import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    height: 5,
  },
  progressBar: {
    width: "100%",
    height: "100%",
    overflow: "hidden",
    borderRadius: 5,
  },
  indicator: {
    width: "70%",
    height: "100%",
  },
});

export const IndeterminateProgressBar = ({ height }: { height?: number }) => {
  const theme = useColorTheme();
  const translateX = useSharedValue(0);
  const { width } = useWindowDimensions();

  const [containerWidth, setContainerWidth] = useState(width);

  useEffect(() => {
    // Start the animation when the component mounts
    translateX.value = withRepeat(
      withTiming(1, {
        duration: 1000,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
      -1,
      false
    );
  }, [translateX]);

  const PROGRESS_BAR_WIDTH = 0.7;

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX:
            -(containerWidth * PROGRESS_BAR_WIDTH) +
            containerWidth * (1 + PROGRESS_BAR_WIDTH) * translateX.value,
        },
      ],
    };
  });

  return (
    <View
      style={[styles.container, { height }]}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      <View style={[styles.progressBar, { height }]}>
        <Animated.View style={[styles.indicator, animatedStyle]}>
          <LinearGradient
            colors={[
              addHslAlpha(theme[7], 0),
              theme[7],
              addHslAlpha(theme[7], 0),
            ]}
            style={{ flex: 1 }}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </Animated.View>
      </View>
    </View>
  );
};

