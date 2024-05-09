import { CommandPaletteProvider } from "@/components/command-palette/context";
import { FocusPanelProvider } from "@/components/focus-panel/context";
import { PanelSwipeTrigger } from "@/components/focus-panel/panel";
import { JsStack } from "@/components/layout/_stack";
import { forHorizontalIOS } from "@/components/layout/forHorizontalIOS";
import { SessionLoadingScreen } from "@/components/layout/loading";
import Sidebar from "@/components/layout/sidebar";
import { useSession } from "@/context/AuthProvider";
import { StorageContextProvider } from "@/context/storageContext";
import { useUser } from "@/context/useUser";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { addHslAlpha, useColor, useDarkMode } from "@/ui/color";
import { ColorThemeProvider, useColorTheme } from "@/ui/color/theme-provider";
import { toastConfig } from "@/ui/toast.config";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { PortalProvider } from "@gorhom/portal";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { TransitionPresets } from "@react-navigation/stack";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isBetween from "dayjs/plugin/isBetween";
import isToday from "dayjs/plugin/isToday";
import isoWeek from "dayjs/plugin/isoWeek";
import relativeTime from "dayjs/plugin/relativeTime";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import weekday from "dayjs/plugin/weekday";
import * as NavigationBar from "expo-navigation-bar";
import { Redirect } from "expo-router";
import { useEffect } from "react";
import {
  Platform,
  Pressable,
  StatusBar,
  View,
  useWindowDimensions,
} from "react-native";
import { Drawer, useDrawerProgress } from "react-native-drawer-layout";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  interpolate,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import "react-native-url-polyfill/auto";
import { LoadingErrors } from "../../components/layout/LoadingErrors";
import { ReleaseModal } from "../../components/layout/ReleaseModal";
import { SelectionNavbar } from "../../components/layout/SelectionNavbar";
import { useSidebarContext } from "../../components/layout/sidebar/context";

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);
dayjs.extend(relativeTime);
dayjs.extend(advancedFormat);
dayjs.extend(isoWeek);
dayjs.extend(weekday);
dayjs.extend(isToday);

const AppContainer = ({ children }) => {
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
            interpolate(Math.round(progress.value), [0, 1], [0, 2]),
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
  });

  const marginTopStyle = useAnimatedStyle(() => {
    return {
      marginTop: interpolate(progress.value, [0, 1], [0, -insets.top]),
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <Animated.View style={marginTopStyle} />
      {children}
    </Animated.View>
  );
};

export default function AppLayout() {
  const { session, isLoading } = useSession();
  const { session: sessionData, isLoading: isUserLoading } = useUser();
  const { width, height } = useWindowDimensions();
  const isDark = useDarkMode();
  const {
    SIDEBAR_WIDTH,
    isOpen,
    openSidebar,
    closeSidebar,
    desktopCollapsed,
    setDesktopCollapsed,
  } = useSidebarContext();
  const breakpoints = useResponsiveBreakpoints();

  const theme = useColor(sessionData?.user?.profile?.theme || "mint");

  if (Platform.OS === "android") {
    NavigationBar.setBackgroundColorAsync(addHslAlpha(theme[1], 0.05));
  }

  useEffect(() => {
    if (Platform.OS === "web") {
      document
        .querySelector(`meta[name="theme-color"]`)
        .setAttribute("content", theme[2]);
    }
  }, [theme, breakpoints.md]);

  if (isLoading || isUserLoading) {
    return (
      <ColorThemeProvider theme={theme}>
        <SessionLoadingScreen />
      </ColorThemeProvider>
    );
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
    <StorageContextProvider>
      <ColorThemeProvider theme={theme} setHTMLAttributes>
        <GestureHandlerRootView
          style={{
            flex: 1,
            overflow: "hidden",
            width,
            height,
            backgroundColor: theme[2],
          }}
        >
          <BottomSheetModalProvider>
            <PortalProvider>
              <StatusBar
                barStyle={!isDark ? "dark-content" : "light-content"}
              />
              <View
                style={[
                  {
                    flexDirection: "row",
                    flex: 1,
                    backgroundColor: theme[2],
                  },
                  Platform.OS === "web" && ({ WebkitAppRegion: "drag" } as any),
                ]}
              >
                <CommandPaletteProvider>
                  <FocusPanelProvider>
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
                          breakpoints.md ? { flex: 1 } : { width: "100%" },
                        ]}
                      >
                        <ReleaseModal />
                        <LoadingErrors />
                        <Drawer
                          open={isOpen}
                          onOpen={openSidebar}
                          onClose={closeSidebar}
                          drawerPosition={"left"}
                          drawerType={
                            breakpoints.md
                              ? desktopCollapsed
                                ? "front"
                                : "permanent"
                              : "back"
                          }
                          swipeEdgeWidth={1000}
                          drawerStyle={{
                            // height,
                            width: breakpoints.md
                              ? desktopCollapsed
                                ? SIDEBAR_WIDTH
                                : "auto"
                              : SIDEBAR_WIDTH,
                            backgroundColor: "transparent",
                          }}
                          overlayStyle={{
                            backgroundColor: "transparent",
                          }}
                          renderDrawerContent={() => (
                            <GestureDetector
                              gesture={Gesture.Hover()
                                .onStart(openSidebar)
                                .onEnd(closeSidebar)
                                .enabled(breakpoints.md && desktopCollapsed)}
                            >
                              <Pressable style={{ flexDirection: "row" }}>
                                <Sidebar />
                                {breakpoints.md && (
                                  <GestureDetector
                                    gesture={Gesture.Tap().onEnd(() => {
                                      setDesktopCollapsed((t) => !t);
                                      closeSidebar();
                                    })}
                                  >
                                    <PanelSwipeTrigger side="left" />
                                  </GestureDetector>
                                )}
                              </Pressable>
                            </GestureDetector>
                          )}
                        >
                          <AppContainer>
                            <SelectionNavbar />
                            <JsStack
                              screenOptions={{
                                header: () => null,
                                headerTransparent: true,
                                gestureResponseDistance: width,
                                gestureEnabled: false,
                                cardStyle: {
                                  height,
                                  width: breakpoints.md ? "100%" : width,
                                  backgroundColor:
                                    theme[breakpoints.sm ? 2 : 1],
                                  padding: breakpoints.md ? 10 : 0,
                                  ...(Platform.OS === "web" &&
                                    ({
                                      marginTop: "env(titlebar-area-height,0)",
                                    } as any)),
                                },
                                // change opacity of the previous screen when swipe
                                cardOverlayEnabled: true,
                                animationEnabled: false,
                                gestureVelocityImpact: 0.7,
                              }}
                            >
                              <JsStack.Screen name="index" />
                              {[
                                "everything/labels/[id]",
                                "everything/collections/[id]",
                              ].map((d) => (
                                <JsStack.Screen
                                  key={d}
                                  name={d}
                                  options={{
                                    presentation: "modal",
                                    animationEnabled: true,
                                    ...TransitionPresets.ModalPresentationIOS,
                                  }}
                                />
                              ))}
                              {[
                                "settings/customization/appearance",
                                "settings/customization/notifications",
                                "settings/login/scan",
                                "settings/login/account/index",
                                "settings/login/account/two-factor-authentication",
                                "settings/login/devices",
                                "settings/customization/profile",
                                "settings/index",
                                "settings/shortcuts",
                                "settings/personal-information",
                                "settings/account/index",
                                "settings/other/apps",
                                "settings/account/integrations/index",
                                "settings/account/integrations/[name]/index",
                                "settings/account/integrations/[name]/[id]",
                              ].map((d) => (
                                <JsStack.Screen
                                  name={d}
                                  key={d}
                                  options={{
                                    cardStyle: { padding: 0 },
                                    gestureEnabled: d !== "settings/index",
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
                                  ...TransitionPresets.SlideFromRightIOS,
                                  cardStyleInterpolator: forHorizontalIOS,
                                }}
                              />
                              <JsStack.Screen
                                name="collections/create"
                                options={{
                                  ...TransitionPresets.SlideFromRightIOS,
                                  gestureResponseDistance: width,
                                  cardStyleInterpolator: forHorizontalIOS,
                                }}
                              />
                            </JsStack>
                          </AppContainer>
                        </Drawer>
                      </Animated.View>
                    </ThemeProvider>
                  </FocusPanelProvider>
                </CommandPaletteProvider>
              </View>
            </PortalProvider>
          </BottomSheetModalProvider>
          <Toast config={toastConfig(theme)} />
        </GestureHandlerRootView>
      </ColorThemeProvider>
    </StorageContextProvider>
  );
}
