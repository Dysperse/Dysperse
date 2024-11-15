import { useEffect } from "react";
import { StyleProp, ViewStyle } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

export function FadeOnRender({
  children,
  animateUp,
  style,
}: {
  children: React.ReactNode;
  animateUp?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const opacity = useSharedValue(0);

  const opacityStyle = useAnimatedStyle(() => ({
    flex: 1,
    opacity: withSpring(opacity.value, {
      damping: 20,
      stiffness: 90,
      overshootClamping: true,
    }),

    transform: animateUp
      ? [
          {
            translateY: withSpring(
              interpolate(opacity.value, [0, 1], [20, 0]),
              {
                damping: 40,
                stiffness: 500,
              }
            ),
          },
        ]
      : undefined,
  }));

  useEffect(() => {
    setTimeout(() => (opacity.value = 1), 200);
  }, [opacity]);

  return (
    <Animated.View style={[opacityStyle, style]}>{children}</Animated.View>
  );
}

