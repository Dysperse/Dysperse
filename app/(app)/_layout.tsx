import { CommandPaletteProvider } from "@/components/command-palette/context";
import { FocusPanelProvider } from "@/components/focus-panel/context";
import { JsStack } from "@/components/layout/_stack";
import { forHorizontalIOS } from "@/components/layout/forHorizontalIOS";
import { Sidebar } from "@/components/layout/sidebar";
import { useSession } from "@/context/AuthProvider";
import { useUser } from "@/context/useUser";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { addHslAlpha, useColor } from "@/ui/color";
import { ColorThemeProvider } from "@/ui/color/theme-provider";
import Logo from "@/ui/logo";
import Navbar from "@/ui/navbar";
import { toastConfig } from "@/ui/toast.config";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { PortalProvider } from "@gorhom/portal";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { TransitionPresets } from "@react-navigation/stack";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import isBetween from "dayjs/plugin/isBetween";
import isoWeek from "dayjs/plugin/isoWeek";
import relativeTime from "dayjs/plugin/relativeTime";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import * as NavigationBar from "expo-navigation-bar";
import { Redirect } from "expo-router";
import React, { useEffect } from "react";
import {
  Platform,
  StatusBar,
  View,
  useColorScheme,
  useWindowDimensions,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { MenuProvider } from "react-native-popup-menu";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Toast from "react-native-toast-message";
import "react-native-url-polyfill/auto";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);
dayjs.extend(relativeTime);
dayjs.extend(advancedFormat);
dayjs.extend(isoWeek);

export function SessionLoadingScreen() {
  const theme = useColorScheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme === "dark" ? "#000" : "#fff",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
      }}
    >
      <Logo
        size={Platform.OS === "web" ? 45 : 130}
        color={theme === "dark" ? "#ffffff" : "#000000"}
      />
    </View>
  );
}

export default function AppLayout() {
  const { session, isLoading } = useSession();
  const { session: sessionData, isLoading: isUserLoading, error } = useUser();
  const { width, height } = useWindowDimensions();
  const isDark = useColorScheme() === "dark";
  const breakpoints = useResponsiveBreakpoints();

  const sidebarMargin = useSharedValue(0);
  const SIDEBAR_WIDTH = breakpoints.md ? 220 : Math.min(280, width - 40);

  const pan = Gesture.Pan()
    .onChange(({ changeX }) => {
      sidebarMargin.value += Math.min(changeX, SIDEBAR_WIDTH);
      if (sidebarMargin.value < -SIDEBAR_WIDTH) {
        sidebarMargin.value = -SIDEBAR_WIDTH;
      }
      if (sidebarMargin.value > 0) {
        sidebarMargin.value = 0;
      }
    })
    .onEnd(({ velocityX }) => {
      sidebarMargin.value = velocityX <= 0 ? -SIDEBAR_WIDTH : 0;
      // setIsHidden(velocityX <= 0);
    });

  const theme = useColor(
    sessionData?.user?.profile?.theme || "violet",
    // CHANGE THIS LATER!!!
    isDark
    // sessionData?.user?.darkMode === "dark"
  );

  const panelStyle = useAnimatedStyle(() => {
    return {
      borderColor: theme?.[5],
      borderWidth: withSpring(
        interpolate(
          Math.abs(sidebarMargin.value),
          [0, SIDEBAR_WIDTH],
          [3, 0],
          "clamp"
        ),
        {
          damping: 30,
          stiffness: 400,
        }
      ),
      borderRadius: withSpring(
        interpolate(
          Math.abs(sidebarMargin.value),
          [0, SIDEBAR_WIDTH],
          [25, 0],
          "clamp"
        ),
        {
          damping: 30,
          stiffness: 400,
        }
      ),
      opacity: withSpring(sidebarMargin.value !== 0 ? 1 : 0.7, {
        damping: 30,
        stiffness: 400,
      }),
      overflow: "hidden",
      transform: [
        {
          translateX: withSpring(
            interpolate(
              sidebarMargin.value,
              [-SIDEBAR_WIDTH, 0],
              [-SIDEBAR_WIDTH, 10]
            ),
            {
              damping: 30,
              stiffness: 400,
            }
          ),
        },
        {
          scale: withSpring(
            interpolate(
              sidebarMargin.value,
              [-SIDEBAR_WIDTH, 0],
              [1, 0.95],
              "clamp"
            ),
            { damping: 30, stiffness: 400 }
          ),
        },
      ],
    };
  }, [theme]);

  if (Platform.OS === "android") {
    NavigationBar.setBackgroundColorAsync(addHslAlpha(theme[1], 0.05));
  }

  useEffect(() => {
    if (Platform.OS === "web") {
      document
        .querySelector(`meta[name="theme-color"]`)
        .setAttribute("content", theme[breakpoints.md ? 2 : 1]);
    }
  }, [theme, breakpoints.md]);

  // You can keep the splash screen open, or render a loading screen like we do here.
  // if (error) {
  //   return (
  //     <View
  //       style={{
  //         flex: 1,
  //         backgroundColor: theme[1],
  //         alignItems: "center",
  //         justifyContent: "center",
  //         padding: 20,
  //       }}
  //     >
  //       <ErrorAlert message="Couldn't load your account. Check your internet connection and try again. " />
  //     </View>
  //   );
  // }
  if (isLoading || isUserLoading) {
    return <SessionLoadingScreen />;
  }

  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  if (!session) {
    // On web, static rendering will stop here as the user is not authenticated
    // in the headless Node process that the pages are rendered in.
    return <Redirect href="/auth" />;
  }

  // This layout can be deferred because it's not the root layout.

  return (
    <ColorThemeProvider theme={theme} setHTMLAttributes>
      <GestureHandlerRootView
        style={{ flex: 1, overflow: "hidden", width, height }}
      >
        <BottomSheetModalProvider>
          <MenuProvider
            customStyles={{
              backdrop: {
                flex: 1,
                opacity: 1,
              },
            }}
          >
            <PortalProvider>
              <StatusBar
                barStyle={!isDark ? "dark-content" : "light-content"}
              />
              <GestureDetector gesture={pan}>
                <View
                  style={{
                    flexDirection: "row",
                    flex: 1,
                    backgroundColor: theme[2],
                  }}
                >
                  <CommandPaletteProvider>
                    <FocusPanelProvider>
                      <Sidebar
                        SIDEBAR_WIDTH={SIDEBAR_WIDTH}
                        sidebarMargin={sidebarMargin}
                      />
                      <ThemeProvider
                        value={{
                          ...DefaultTheme,
                          colors: {
                            ...DefaultTheme.colors,
                            background: theme[breakpoints.sm ? 2 : 1],
                          },
                        }}
                      >
                        <Animated.View
                          style={[
                            !breakpoints.md && panelStyle,
                            { width: "100%" },
                          ]}
                        >
                          <JsStack
                            screenOptions={{
                              header: () => null,
                              headerTransparent: true,
                              gestureResponseDistance: width,
                              gestureEnabled: false,
                              cardStyle: {
                                height,
                                width: breakpoints.md ? "100%" : width,
                                backgroundColor: theme[breakpoints.sm ? 2 : 1],
                                padding: breakpoints.md ? 10 : 0,
                                ...(Platform.OS === "web" &&
                                  ({
                                    marginTop: "env(titlebar-area-height,0)",
                                  } as any)),
                              },
                              // change opacity of the previous screen when swipe
                              cardOverlayEnabled: true,
                              animationEnabled: !breakpoints.md,
                              gestureVelocityImpact: 0.7,
                            }}
                          >
                            <JsStack.Screen name="index" />
                            {[
                              "settings/appearance",
                              "settings/customization/appearance",
                              "settings/customization/notifications",
                              "settings/privacy/login-security",
                              "settings/privacy/devices",
                              "settings/customization/profile",
                              "settings/index",
                              "settings/personal-information",
                              "settings/space/index",
                              "settings/space/integrations",
                            ].map((d) => (
                              <JsStack.Screen
                                name={d}
                                key={d}
                                options={{
                                  cardStyle: { padding: 0 },
                                  gestureEnabled: true,
                                  headerTitle:
                                    d !== "settings/index" && "Settings",
                                  ...TransitionPresets.SlideFromRightIOS,
                                  cardStyleInterpolator: forHorizontalIOS,
                                  ...(breakpoints.md && {
                                    animationEnabled: false,
                                  }),
                                }}
                              />
                            ))}
                            <JsStack.Screen
                              name="friends"
                              options={{
                                gestureEnabled: true,
                                header: (props) => (
                                  <Navbar
                                    icon="arrow_back_ios_new"
                                    {...props}
                                  />
                                ),
                                ...TransitionPresets.SlideFromRightIOS,
                                cardStyleInterpolator: forHorizontalIOS,
                              }}
                            />
                            {["clock", "collections/create"].map((d) => (
                              <JsStack.Screen
                                name={d}
                                key={d}
                                options={{
                                  ...TransitionPresets.SlideFromRightIOS,
                                  gestureResponseDistance: width,
                                  cardStyleInterpolator: forHorizontalIOS,
                                  // cardStyle: { marginBottom: 0 },
                                }}
                              />
                            ))}
                          </JsStack>
                        </Animated.View>
                      </ThemeProvider>
                    </FocusPanelProvider>
                  </CommandPaletteProvider>
                </View>
              </GestureDetector>
            </PortalProvider>
          </MenuProvider>
        </BottomSheetModalProvider>
        <Toast config={toastConfig(theme)} />
      </GestureHandlerRootView>
    </ColorThemeProvider>
  );
}
