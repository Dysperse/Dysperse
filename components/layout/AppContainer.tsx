import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { useColorTheme } from "@/ui/color/theme-provider";
import { RefObject, memo, useMemo } from "react";
import { Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AppContainer = memo(
  ({
    progressValue,
    children,
  }: {
    progressValue: RefObject<Animated.Value>;
    children: React.ReactNode;
  }) => {
    const theme = useColorTheme();
    const breakpoints = useResponsiveBreakpoints();
    const insets = useSafeAreaInsets();

    const animatedStyle = breakpoints.md
      ? { flex: 1 }
      : {
          flex: 1,
          width: "100%",
          height: "100%",
          // borderWidth: withSpring(
          //   interpolate(progress.value >= 0.1 ? 1 : 0, [0, 1], [0, 2]),
          //   { overshootClamping: true }
          // ),

          borderWidth: progressValue?.current?.interpolate?.({
            inputRange: [0, 1],
            outputRange: [0, 2],
          }),

          borderRadius: progressValue?.current?.interpolate?.({
            inputRange: [0, 1],
            outputRange: [!breakpoints.md ? 0 : 20, 30],
          }),
          borderColor: theme[5],
          overflow: "hidden",
          marginTop: progressValue?.current?.interpolate?.({
            inputRange: [0, 1],
            outputRange: [0, insets.top],
          }),
          marginBottom: progressValue?.current?.interpolate?.({
            inputRange: [0, 1],
            outputRange: [0, insets.bottom],
          }),

          // marginBottom: interpolate(progress.value, [0, 1], [0, insets.bottom]),
          transform: [
            {
              // scale: interpolate(progress.value, [0, 1], [1, 0.95]),
              scale: progressValue?.current?.interpolate?.({
                inputRange: [0, 1],
                outputRange: [1, 0.95],
              }),
            },
          ],
        };

    const marginTopStyle = {
      marginTop: progressValue?.current?.interpolate?.({
        inputRange: [0, 1],
        outputRange: [0, -insets.top],
      }),
    };

    const _children = useMemo(() => children, [children]);

    return (
      <Animated.View style={animatedStyle as any}>
        <Animated.View style={marginTopStyle} />
        {_children}
      </Animated.View>
    );
  }
);

export default AppContainer;
