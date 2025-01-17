import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { addHslAlpha } from "../color";
import { useColorTheme } from "../color/theme-provider";

export function AnimatedLinearGradient() {
  const theme = useColorTheme();
  const position = useSharedValue(-200);

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
        colors={[
          addHslAlpha(theme[9], 0),
          addHslAlpha(theme[9], 0.1),
          addHslAlpha(theme[9], 0),
        ]}
      />
    </Animated.View>
  );
}
