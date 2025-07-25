import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { useColorTheme } from "@/ui/color/theme-provider";
import { usePathname } from "expo-router";
import { memo, useEffect } from "react";
import { Platform } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSidebarContext } from "./sidebar/context";

const AppContainer = memo(
  ({
    progressValue,
    children,
  }: {
    progressValue: any;
    children: React.ReactNode;
  }) => {
    const theme = useColorTheme();
    const breakpoints = useResponsiveBreakpoints();
    const insets = useSafeAreaInsets();
    const pathname = usePathname();
    const {
      desktopCollapsed,
      ORIGINAL_SIDEBAR_WIDTH,
      SECONDARY_SIDEBAR_WIDTH,
      sidebarRef,
    } = useSidebarContext();

    useEffect(() => {
      if (Platform.OS === "web" && !desktopCollapsed) {
        sidebarRef.current.openDrawer();
      }
    }, [desktopCollapsed, sidebarRef]);

    const borderStyle = useAnimatedStyle(
      () => ({
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99,
        opacity: interpolate(progressValue.current?.value || 0, [0, 1], [0, 1]),
        borderWidth: 2,
        borderColor: theme[5],
      }),
      [progressValue, theme]
    );

    const borderRadiusStyle = useAnimatedStyle(
      () => ({
        borderRadius: interpolate(
          progressValue.current?.value || 0,
          [0, 1],
          [!breakpoints.md ? 0 : 20, 30]
        ),
      }),
      [progressValue]
    );

    const marginTopStyle = useAnimatedStyle(
      () => ({
        marginTop: interpolate(
          progressValue.current?.value || 0,
          [0, 1],
          [0, -insets.top]
        ),
      }),
      [progressValue]
    );

    const containerMarginBottomStyle = useAnimatedStyle(
      () => ({
        marginBottom: interpolate(
          progressValue.current?.value || 0,
          [0, 1],
          [0, insets.bottom]
        ),
      }),
      [progressValue]
    );

    const containerMarginTopStyle = useAnimatedStyle(
      () => ({
        marginTop: interpolate(
          progressValue.current?.value || 0,
          [0, 1],
          [0, insets.top]
        ),
      }),
      [progressValue]
    );

    const animatedStyle = useAnimatedStyle(
      () =>
        breakpoints.md
          ? desktopCollapsed
            ? {
                flex: 1,
                width: "100%",
                opacity: interpolate(
                  progressValue.current?.value || 0,
                  [0, 1],
                  [1, 0.6]
                ),
                marginBottom: 0,
                transform: [
                  {
                    scale: interpolate(
                      progressValue.current?.value || 0,
                      [0, 1],
                      [1, 0.98]
                    ),
                  },
                ],
              }
            : {
                flex: 1,
                marginLeft: pathname.includes("/everything")
                  ? SECONDARY_SIDEBAR_WIDTH
                  : ORIGINAL_SIDEBAR_WIDTH,
                marginRight: 0,
                marginBottom: 0,
                zIndex: 9999,
              }
          : {
              transform: [
                {
                  scale: interpolate(
                    progressValue.current?.value || 0,
                    [0, 1],
                    [1, 0.98]
                  ),
                },
              ],
            },
      [
        breakpoints.md,
        desktopCollapsed,
        pathname,
        ORIGINAL_SIDEBAR_WIDTH,
        SECONDARY_SIDEBAR_WIDTH,
        progressValue,
      ]
    );

    return (
      <Animated.View
        style={[
          { flex: 1, overflow: "hidden" },
          !breakpoints.md && containerMarginBottomStyle,
          !breakpoints.md && containerMarginTopStyle,
          animatedStyle,
          borderRadiusStyle,
        ]}
      >
        {!breakpoints.md && <Animated.View style={marginTopStyle} />}
        {!breakpoints.md && (
          <Animated.View
            style={[
              borderStyle,
              borderRadiusStyle,
              { position: "absolute", pointerEvents: "none" },
            ]}
          />
        )}
        {children}
      </Animated.View>
    );
  }
);

export default AppContainer;

