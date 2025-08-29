import { useEffect } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from "react-native-reanimated";
import { addHslAlpha } from "../color";
import { useColorTheme } from "../color/theme-provider";
import { AnimatedLinearGradient } from "./gradient";

export default function LinearSkeleton({
  height,
  width,
  animateWidth = false,
  delay = 0,
  style,
  containerStyle,
}: {
  height: any;
  width?: any;
  animateWidth?: boolean;
  delay?: number;
  style?: StyleProp<ViewStyle>;
  containerStyle?: ViewStyle;
}) {
  const theme = useColorTheme();
  const containerAnimation = useSharedValue(animateWidth ? 0 : width);

  useEffect(() => {
    if (!animateWidth) return;
    containerAnimation.value = withDelay(
      delay,
      withSpring(width, {
        stiffness: 200,
        damping: 23,
      })
    );

    return () => {
      containerAnimation.value = 0;
    };
  }, []);

  const animatedWidth = useAnimatedStyle(() => {
    return { width: `${containerAnimation.value}%` };
  });

  return (
    <View style={[{ height }, containerStyle]}>
      <Animated.View
        style={[
          {
            backgroundColor: addHslAlpha(theme[9], 0.1),
            borderRadius: 15,
            position: "relative",
            overflow: "hidden",
            height,
          },
          style,
          animateWidth ? animatedWidth : { width },
        ]}
      >
        <AnimatedLinearGradient />
      </Animated.View>
    </View>
  );
}

export function LinearSkeletonArray({
  widths,
  height,
  stagger = 75,
  animateWidth,
}: {
  widths: string[] | number[];
  height: string | number;
  stagger?: number;
  animateWidth?: boolean;
}) {
  return (
    <>
      {widths.map((width, index) => (
        <LinearSkeleton
          key={index}
          animateWidth={animateWidth}
          delay={stagger * index}
          width={width}
          height={height}
        />
      ))}
    </>
  );
}

