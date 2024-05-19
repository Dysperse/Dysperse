import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { useColorTheme } from "@/ui/color/theme-provider";
import { memo } from "react";
import { useDrawerProgress } from "react-native-drawer-layout";
import Animated, {
  interpolate,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AppContainer = memo(({ children }: any) => {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const progress = useDrawerProgress();
  const insets = useSafeAreaInsets();

  const animatedStyle = useAnimatedStyle(() => {
    return breakpoints.md
      ? { flex: 1 }
      : {
          flex: 1,
          width: "100%",
          height: "100%",
          borderWidth: withSpring(
            interpolate(Math.round(progress.value + 0.2), [0, 1], [0, 2]),
            { overshootClamping: true }
          ),
          borderRadius: interpolate(
            progress.value,
            [0, 1],
            [!breakpoints.md ? 0 : 20, 30]
          ),
          borderColor: theme[5],
          overflow: "hidden",
          marginTop: interpolate(progress.value, [0, 1], [0, insets.top]),
          marginBottom: interpolate(progress.value, [0, 1], [0, insets.bottom]),
          transform: [
            {
              scale: interpolate(progress.value, [0, 1], [1, 0.95]),
            },
          ],
        };
  }, [progress, insets, breakpoints]);

  const marginTopStyle = useAnimatedStyle(
    () => ({
      marginTop: interpolate(progress.value, [0, 1], [0, -insets.top]),
    }),
    [progress, insets]
  );

  return (
    <Animated.View style={animatedStyle}>
      <Animated.View style={marginTopStyle} />
      {children}
    </Animated.View>
  );
});

export default AppContainer;
