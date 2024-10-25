import { useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

export function FadeOnRender({ children }) {
  const opacity = useSharedValue(0);

  const opacityStyle = useAnimatedStyle(() => ({
    flex: 1,
    opacity: withSpring(opacity.value, {
      damping: 20,
      stiffness: 90,
      overshootClamping: true,
    }),
  }));

  useEffect(() => {
    setTimeout(() => (opacity.value = 1), 200);
  }, [opacity]);

  return <Animated.View style={opacityStyle}>{children}</Animated.View>;
}
