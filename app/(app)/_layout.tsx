import { CommandPaletteProvider } from "@/components/command-palette/context";
import { FocusPanelProvider } from "@/components/focus-panel/context";
import { PanelSwipeTrigger } from "@/components/focus-panel/panel";
import { JsStack } from "@/components/layout/_stack";
import { forHorizontalIOS } from "@/components/layout/forHorizontalIOS";
import Sidebar from "@/components/layout/sidebar";
import { useSession } from "@/context/AuthProvider";
import {
  StorageContextProvider,
  useStorageContext,
} from "@/context/storageContext";
import { useUser } from "@/context/useUser";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import { addHslAlpha, useColor, useDarkMode } from "@/ui/color";
import { ColorThemeProvider, useColorTheme } from "@/ui/color/theme-provider";
import Logo from "@/ui/logo";
import { toastConfig } from "@/ui/toast.config";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Portal, PortalProvider } from "@gorhom/portal";
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
import * as NavigationBar from "expo-navigation-bar";
import { Redirect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Linking,
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
import { MenuProvider } from "react-native-popup-menu";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import "react-native-url-polyfill/auto";
import { SidebarContext } from "../../components/layout/sidebar/context";

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);
dayjs.extend(relativeTime);
dayjs.extend(advancedFormat);
dayjs.extend(isoWeek);
dayjs.extend(isToday);

export function SessionLoadingScreen() {
  const theme = useColorTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme[2],
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
      }}
    >
      <Logo size={150} />
    </View>
  );
}

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

const ComingSoonScreen = () => {
  const { session } = useUser();
  const theme = useColorTheme();

  if (session?.user?.hasEarlyAccess === false) {
    return (
      <Portal>
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: theme[1],
            zIndex: 99,
            justifyContent: "center",
            alignItems: "center",
            padding: 30,
          }}
        >
          <Logo size={100} />
          <View style={{ maxWidth: 400 }}>
            <Text
              style={{
                marginTop: 10,
                textAlign: "center",
                fontSize: 30,
                color: theme[11],
              }}
              weight={900}
            >
              Arriving Spring 2024
            </Text>
            <Text
              style={{
                fontSize: 20,
                marginTop: 5,
                textAlign: "center",
                color: theme[11],
              }}
            >
              Dysperse is in a closed beta. Follow{" "}
              <Text
                style={{
                  color: theme[12],
                  fontSize: 20,
                  textDecorationLine: "underline",
                }}
                weight={700}
                onPress={() =>
                  Linking.openURL("https://instagram.com/dysperse")
                }
              >
                @dysperse
              </Text>{" "}
              on Instagram for updates!
            </Text>
          </View>
        </View>
      </Portal>
    );
  }
  return null;
};

const LoadingErrors = () => {
  const red = useColor("red");
  const theme = useColorTheme();
  const { error } = useUser();
  const { error: storageError } = useStorageContext();
  const insets = useSafeAreaInsets();
  const negativeMargin = -1 * (insets.top + 30);
  const marginValue = useSharedValue(negativeMargin);

  const marginStyle = useAnimatedStyle(() => {
    return {
      marginTop: withSpring(marginValue.value, { overshootClamping: true }),
    };
  });

  useEffect(() => {
    marginValue.value = error || storageError ? 0 : negativeMargin;
  }, [error, storageError, insets, marginValue, negativeMargin]);

  return (
    (error || storageError) && (
      <Animated.View
        style={[
          marginStyle,
          {
            backgroundColor: theme[11],
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            height: 30 + insets.top,
            gap: 10,
          },
        ]}
      >
        <Icon style={{ color: red[2] }} bold size={18}>
          cloud_off
        </Icon>
        <Text
          style={{ color: red[2], fontSize: 12, marginBottom: -1 }}
          weight={700}
        >
          {error
            ? error.message === "Failed to fetch"
              ? "You're offline"
              : "Can't connect to Dysperse"
            : "Can't load storage data"}
        </Text>
      </Animated.View>
    )
  );
};

export default function AppLayout() {
  const { session, isLoading } = useSession();
  const { session: sessionData, isLoading: isUserLoading } = useUser();
  const { width, height } = useWindowDimensions();
  const isDark = useDarkMode();
  const breakpoints = useResponsiveBreakpoints();

  const closeSidebarOnMobile = useCallback(() => {
    if (!breakpoints.md) {
      setOpen(false);
    }
  }, [breakpoints]);
  const SIDEBAR_WIDTH = breakpoints.md ? 220 : Math.min(280, width - 40);

  const theme = useColor(sessionData?.user?.profile?.theme || "mint");

  if (Platform.OS === "android") {
    NavigationBar.setBackgroundColorAsync(addHslAlpha(theme[1], 0.05));
  }

  const [open, setOpen] = useState(!breakpoints.md);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

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
                <View
                  style={{
                    flexDirection: "row",
                    flex: 1,
                    backgroundColor: theme[2],
                  }}
                >
                  <CommandPaletteProvider>
                    <FocusPanelProvider>
                      <SidebarContext.Provider
                        value={{
                          isOpen: open,
                          desktopCollapsed,
                          setDesktopCollapsed,
                          closeSidebar: () => setOpen(false),
                          openSidebar: () => setOpen(true),

                          SIDEBAR_WIDTH,
                          closeSidebarOnMobile,
                        }}
                      >
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
                            <LoadingErrors />
                            <Drawer
                              open={open}
                              onOpen={() => setOpen(true)}
                              onClose={() => setOpen(false)}
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
                                height,
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
                                    .onStart(() => setOpen(true))
                                    .onEnd(() => setOpen(false))
                                    .enabled(breakpoints.md)}
                                >
                                  <Pressable style={{ flexDirection: "row" }}>
                                    <Sidebar />
                                    {breakpoints.md && (
                                      <GestureDetector
                                        gesture={Gesture.Tap().onEnd(() => {
                                          setDesktopCollapsed((t) => !t);
                                          setOpen(false);
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
                                <ComingSoonScreen />
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
                                          marginTop:
                                            "env(titlebar-area-height,0)",
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
                                    "settings/login/login-security/index",
                                    "settings/login/scan",
                                    "settings/login/login-security/two-factor-authentication",
                                    "settings/login/devices",
                                    "settings/customization/profile",
                                    "settings/index",
                                    "settings/personal-information",
                                    "settings/space/index",
                                    "settings/space/integrations/index",
                                    "settings/space/integrations/[name]/index",
                                    "settings/space/integrations/[name]/[id]",
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
                              </AppContainer>
                            </Drawer>
                          </Animated.View>
                        </ThemeProvider>
                      </SidebarContext.Provider>
                    </FocusPanelProvider>
                  </CommandPaletteProvider>
                </View>
              </PortalProvider>
            </MenuProvider>
          </BottomSheetModalProvider>
          <Toast config={toastConfig(theme)} />
        </GestureHandlerRootView>
      </ColorThemeProvider>
    </StorageContextProvider>
  );
}
