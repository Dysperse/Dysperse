import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { addHslAlpha } from "../color";
import { useColorTheme } from "../color/theme-provider";

function AnimatedLinearGradient() {
  const theme = useColorTheme();
  const position = useSharedValue(-100);

  useEffect(() => {
    position.value = withRepeat(withTiming(100, { duration: 2000 }), -1, false);
  }, []);

  const animation = useAnimatedStyle(() => {
    return { marginLeft: `${position.value}%` };
  });

  return (
    <Animated.View style={[{ height: "100%" }, animation]}>
      <LinearGradient
        style={{ height: "100%", width: 100 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        colors={["transparent", addHslAlpha(theme[9], 0.1), "transparent"]}
      />
    </Animated.View>
  );
}

export default function LinearSkeleton({
  height,
  width,
  animateWidth,
  delay = 0,
}) {
  const theme = useColorTheme();
  const containerAnimation = useSharedValue(0);

  useEffect(() => {
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
    <View style={{ height }}>
      <Animated.View
        style={[
          {
            backgroundColor: addHslAlpha(theme[9], 0.1),
            borderRadius: 10,
            position: "relative",
            overflow: "hidden",
            height,
          },
          animatedWidth,
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
  stagger = 100,
}: {
  widths: string[] | number[];
  height: string | number;
  stagger?: number;
}) {
  return (
    <>
      {widths.map((width, index) => (
        <LinearSkeleton
          animateWidth
          delay={stagger * index}
          width={width}
          height={height}
        />
      ))}
    </>
  );
}
