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

    const borderStyle = useMemo(
      () => ({
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99,
        opacity: progressValue?.current?.interpolate?.({
          inputRange: [0, 1],
          outputRange: [0, 1],
        }),
        borderWidth: 2,
        borderRadius: progressValue?.current?.interpolate?.({
          inputRange: [0, 1],
          outputRange: [!breakpoints.md ? 0 : 20, 30],
        }),
        borderColor: theme[5],
      }),
      [theme, breakpoints, progressValue]
    );

    const animatedStyle = useMemo(
      () =>
        breakpoints.md
          ? { flex: 1 }
          : {
              flex: 1,
              width: "100%",
              height: "100%",

              borderRadius: progressValue?.current?.interpolate?.({
                inputRange: [0, 1],
                outputRange: [!breakpoints.md ? 0 : 20, 30],
              }),
              overflow: "hidden",
              marginTop: progressValue?.current?.interpolate?.({
                inputRange: [0, 1],
                outputRange: [0, insets.top],
              }),
              marginBottom: progressValue?.current?.interpolate?.({
                inputRange: [0, 1],
                outputRange: [0, insets.bottom],
              }),

              transform: [
                {
                  scale: progressValue?.current?.interpolate?.({
                    inputRange: [0, 1],
                    outputRange: [1, 0.95],
                  }),
                },
              ],
            },
      [breakpoints, insets, progressValue, theme]
    );

    const marginTopStyle = useMemo(
      () => ({
        marginTop: progressValue?.current?.interpolate?.({
          inputRange: [0, 1],
          outputRange: [0, -insets.top],
        }),
      }),
      [insets, progressValue]
    );

    const _children = useMemo(() => children, [children]);

    return (
      <Animated.View style={animatedStyle as any}>
        <Animated.View style={marginTopStyle} />
        {!breakpoints.md && (
          <Animated.View
            style={[
              borderStyle,
              { position: "absolute", pointerEvents: "none" },
            ]}
          />
        )}
        {_children}
      </Animated.View>
    );
  }
);

export default AppContainer;
