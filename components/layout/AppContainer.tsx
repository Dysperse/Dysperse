import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { useColorTheme } from "@/ui/color/theme-provider";
import { usePathname } from "expo-router";
import { RefObject, memo, useEffect, useMemo } from "react";
import { Animated, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSidebarContext } from "./sidebar/context";

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

    const borderStyle = useMemo(
      () => ({
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99,
        opacity:
          progressValue.current?.interpolate?.({
            inputRange: [0, 1],
            outputRange: [0, 1],
          }) || 0,
        borderWidth: 2,
        borderRadius:
          progressValue.current?.interpolate?.({
            inputRange: [0, 1],
            outputRange: [!breakpoints.md ? 0 : 20, 30],
          }) || 0,
        borderColor: theme[5],
      }),
      [theme, breakpoints, progressValue.current]
    );

    const animatedStyle = useMemo(
      () => [
        {
          marginBottom:
            progressValue.current?.interpolate?.({
              inputRange: [0, 1],
              outputRange: [0, insets.bottom],
            }) || 0,
        },
        !breakpoints.md && {
          marginTop:
            progressValue.current?.interpolate?.({
              inputRange: [0, 1],
              outputRange: [0, insets.top],
            }) || 0,
        },
        breakpoints.md
          ? desktopCollapsed
            ? {
                flex: 1,
                width: "100%",
                opacity:
                  progressValue.current?.interpolate?.({
                    inputRange: [0, 1],
                    outputRange: [1, 0.6],
                  }) || 0,
                marginBottom: 0,
                transform: [
                  {
                    scale:
                      progressValue.current?.interpolate?.({
                        inputRange: [0, 1],
                        outputRange: [1, 0.98],
                      }) || 0,
                  },
                ],
              }
            : {
                flex: 1,
                marginLeft: pathname.includes("settings")
                  ? 0
                  : pathname.includes("/everything")
                  ? SECONDARY_SIDEBAR_WIDTH
                  : ORIGINAL_SIDEBAR_WIDTH,
                zIndex: 99999999,
                marginBottom: 0,
              }
          : {
              flex: 1,
              width: "100%",
              height: "100%",
              borderRadius:
                progressValue.current?.interpolate?.({
                  inputRange: [0, 1],
                  outputRange: [!breakpoints.md ? 0 : 20, 30],
                }) || 0,
              overflow: "hidden",
              transform: [
                {
                  scale:
                    progressValue.current?.interpolate?.({
                      inputRange: [0, 1],
                      outputRange: [1, 0.95],
                    }) || 0,
                },
                {
                  translateY:
                    progressValue.current?.interpolate?.({
                      inputRange: [0, 1],
                      outputRange: [1, 0.95],
                    }) || 0,
                },
              ],
            },
      ],
      [
        breakpoints,
        insets,
        progressValue.current,
        desktopCollapsed,
        pathname,
        ORIGINAL_SIDEBAR_WIDTH,
        SECONDARY_SIDEBAR_WIDTH,
      ]
    );

    const marginTopStyle = useMemo(
      () => ({
        marginTop: progressValue.current?.interpolate?.({
          inputRange: [0, 1],
          outputRange: [0, -insets.top],
        }),
      }),
      [insets, progressValue.current]
    );

    return (
      <Animated.View style={animatedStyle as any}>
        {!breakpoints.md && <Animated.View style={marginTopStyle} />}
        {!breakpoints.md && (
          <Animated.View
            style={[
              borderStyle,
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

