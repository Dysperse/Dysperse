import { CommandPaletteProvider } from "@/components/command-palette/context";
import { FocusPanelProvider } from "@/components/focus-panel/context";
import AppContainer from "@/components/layout/AppContainer";
import NotificationsModal from "@/components/layout/NotificationsModal";
import TabFriendModal from "@/components/layout/TabFriendModal";
import { JsStack } from "@/components/layout/_stack";
import { arcCard } from "@/components/layout/arcAnimations";
import { SessionLoadingScreen } from "@/components/layout/loading";
import Sidebar from "@/components/layout/sidebar";
import { useSidebarContext } from "@/components/layout/sidebar/context";
import { useSession } from "@/context/AuthProvider";
import { BadgingProvider } from "@/context/BadgingProvider";
import { GlobalTaskContextProvider } from "@/context/globalTaskContext";
import { StorageContextProvider } from "@/context/storageContext";
import { useUser } from "@/context/useUser";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { addHslAlpha, useColor, useDarkMode } from "@/ui/color";
import { ColorThemeProvider, useColorTheme } from "@/ui/color/theme-provider";
import { toastConfig } from "@/ui/toast.config";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { PortalProvider } from "@gorhom/portal";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
import {
  Redirect,
  router,
  SplashScreen,
  useGlobalSearchParams,
  usePathname,
} from "expo-router";
import * as SystemUI from "expo-system-ui";
import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  Animated,
  InteractionManager,
  Keyboard,
  Platform,
  Pressable,
  useWindowDimensions,
  View,
} from "react-native";
import { SystemBars } from "react-native-edge-to-edge";
import {
  DrawerLayout,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { MenuProvider } from "react-native-popup-menu";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import "react-native-url-polyfill/auto";
import LoadingErrors from "../../components/layout/LoadingErrors";

dayjs.extend(customParseFormat);
dayjs.extend(timezone);
dayjs.extend(utc);
dayjs.extend(isBetween);
dayjs.extend(relativeTime);
dayjs.extend(advancedFormat);
dayjs.extend(isoWeek);
dayjs.extend(weekday);
dayjs.extend(isToday);

const WebAnimationComponent = ({ children }) => {
  const theme = useColorTheme();
  if (Platform.OS === "web") {
    return (
      <View style={{ backgroundColor: theme[2], flex: 1 }}>
        <View aria-valuetext="web-app-animation" style={{ flex: 1 }}>
          {children}
        </View>
      </View>
    );
  } else return children;
};

function LastStateRestore() {
  const pathname = usePathname();
  const { fullscreen } = useGlobalSearchParams();

  const setCurrentPage = useCallback(async () => {
    const lastViewedRoute = await AsyncStorage.getItem("lastViewedRoute");
    if (
      lastViewedRoute &&
      lastViewedRoute !== "/" &&
      pathname !== lastViewedRoute
    )
      router.replace(lastViewedRoute);
  }, []);

  useEffect(() => {
    if (
      pathname !== "/" &&
      !pathname.includes("chrome-extension") &&
      !fullscreen
    ) {
      setCurrentPage();
    }
  }, []);

  return null;
}

export default function AppLayout() {
  const { session, isLoading, signOut } = useSession();
  const { session: sessionData, isLoading: isUserLoading } = useUser();
  const { width, height } = useWindowDimensions();
  const isDark = useDarkMode();
  const breakpoints = useResponsiveBreakpoints();
  const pathname = usePathname();

  const focusPanelFreezerRef = useRef(null);
  const progressValue = useRef(null);

  const insets = useSafeAreaInsets();
  const focusPanelRef = useRef(null);

  const {
    sidebarRef,
    ORIGINAL_SIDEBAR_WIDTH,
    SECONDARY_SIDEBAR_WIDTH,
    desktopCollapsed,
  } = useSidebarContext();

  useEffect(() => {
    if (sessionData?.user?.timeZone)
      dayjs.tz.setDefault(sessionData?.user?.timeZone);
  }, [sidebarRef]);

  const theme = useColor(sessionData?.user?.profile?.theme || "mint");
  useEffect(() => {
    if (Platform.OS === "android")
      NavigationBar.setBackgroundColorAsync(addHslAlpha(theme[1], 0.01));
    else if (Platform.OS === "ios") SystemUI.setBackgroundColorAsync(theme[2]);
  }, [theme]);

  const routerTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: theme[breakpoints.sm ? 2 : 1],
    },
  };

  useEffect(() => {
    if (Platform.OS === "web") {
      document
        .querySelector(`meta[name="theme-color"]`)
        .setAttribute("content", theme[2]);
    }
  }, [theme, breakpoints.md]);

  const sidebarWidth = useMemo(
    () =>
      !pathname.includes("settings/") && !pathname.includes("create")
        ? width
        : 0,
    [pathname, width]
  );

  useEffect(() => {
    if (session && !isUserLoading && !sessionData?.user) {
      Toast.show({
        type: "error",
        text1: "You've been signed out",
        text2: "Please sign in again",
      });
      signOut();
      router.navigate("/auth");
    }
  }, [isUserLoading, session, signOut, sessionData]);

  if (isLoading || isUserLoading) {
    return (
      <ColorThemeProvider theme={theme}>
        <SessionLoadingScreen />
      </ColorThemeProvider>
    );
  }

  InteractionManager.runAfterInteractions(() => SplashScreen.hide());
  if (!session) return <Redirect href="/auth" />;

  const renderNavigationView = (v: Animated.Value) => {
    progressValue.current = v;

    return !breakpoints.md ||
      (!pathname.includes("settings/") && !pathname.includes("create")) ? (
      <Pressable style={{ flex: 1 }}>
        <Sidebar progressValue={v} />
      </Pressable>
    ) : null;
  };

  const content = (
    <ThemeProvider
      value={{
        colors: {
          background: theme[2],
          card: theme[2],
          primary: theme[2],
          border: theme[6],
          text: theme[11],
          notification: theme[9],
        },
        dark: true,
      }}
    >
      <AppContainer progressValue={progressValue}>
        <LastStateRestore />
        <SystemBars style={!isDark ? "dark" : "light"} />
        <JsStack
          screenOptions={{
            header: () => null,
            headerTransparent: true,
            gestureResponseDistance: width,
            gestureEnabled: false,
            freezeOnBlur: true,
            presentation: "transparentModal",
            cardStyle: {
              height,
              width: breakpoints.md ? "100%" : width,
              backgroundColor: globalThis.IN_DESKTOP_ENV
                ? "transparent"
                : theme[breakpoints.sm ? 2 : 1],
              padding: breakpoints.md ? 10 : 0,
              paddingBottom: Platform.OS === "ios" ? 0 : undefined,
              ...(Platform.OS === "web" &&
                ({ marginTop: "env(titlebar-area-height,0)" } as any)),
            },
            animation: "none",
            cardOverlayEnabled: true,
            gestureVelocityImpact: 0.5,
          }}
        >
          <JsStack.Screen name="index" />
          {["everything/labels/[id]", "everything/collections/[id]"].map(
            (d) => (
              <JsStack.Screen
                key={d}
                name={d}
                options={{
                  detachPreviousScreen: breakpoints.md,
                  presentation: "modal",
                  animation: "default",
                  ...TransitionPresets.ModalPresentationIOS,
                }}
              />
            )
          )}
          <JsStack.Screen
            name="open"
            options={{
              presentation: "modal",
              animation: "default",
              gestureEnabled: false,
              ...TransitionPresets.ModalPresentationIOS,
            }}
          />
          <JsStack.Screen
            name="friends"
            options={arcCard({ theme, breakpoints, maxWidth: 500 })}
          />
          <JsStack.Screen
            name="insights"
            options={arcCard({ theme, breakpoints, maxWidth: 500 })}
          />
          <JsStack.Screen
            name="home/customize"
            options={arcCard({ theme, breakpoints, maxWidth: 500 })}
          />
          <JsStack.Screen
            name="home/add-widget"
            options={arcCard({ theme, breakpoints, maxWidth: 500 })}
          />
          <JsStack.Screen
            name="plan"
            options={arcCard({ theme, breakpoints, maxWidth: 500 })}
          />
          <JsStack.Screen
            name="settings"
            options={{
              detachPreviousScreen: !breakpoints.md,
              cardStyle: { padding: 0 },
            }}
          />
        </JsStack>
      </AppContainer>
    </ThemeProvider>
  );

  const drawerLocked =
    !desktopCollapsed && breakpoints.md
      ? "locked-open"
      : pathname.includes("everything/collections/") ||
        pathname.includes("/customize") ||
        pathname.includes("friends") ||
        pathname.includes("insights") ||
        pathname.includes("everything/labels/") ||
        (pathname.includes("/map") && Platform.OS !== "ios") ||
        (pathname.includes("/grid") && Platform.OS !== "ios") ||
        (pathname.includes("/plan") && !pathname.includes("/planner")) ||
        pathname.includes("open") ||
        (pathname.includes("collections") &&
          (pathname.includes("/search") ||
            pathname.includes("/reorder") ||
            pathname.includes("/share")));

  return (
    <WebAnimationComponent>
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
            key={breakpoints.md ? "desktop" : "mobile"}
          >
            <FocusPanelProvider
              drawerRef={focusPanelRef}
              focusPanelFreezerRef={focusPanelFreezerRef}
            >
              <BottomSheetModalProvider>
                <MenuProvider
                  skipInstanceCheck
                  customStyles={{
                    backdrop: {
                      flex: 1,
                      opacity: 1,
                      ...(Platform.OS === "web" &&
                        ({ WebkitAppRegion: "no-drag" } as any)),
                    },
                  }}
                >
                  <PortalProvider>
                    <View
                      style={[
                        {
                          flexDirection: "row",
                          flex: 1,
                          backgroundColor: theme[2],
                        },
                        Platform.OS === "web" &&
                          ({ WebkitAppRegion: "drag" } as any),
                      ]}
                    >
                      <GlobalTaskContextProvider>
                        <CommandPaletteProvider>
                          <ThemeProvider value={routerTheme}>
                            <BadgingProvider>
                              <View
                                style={[
                                  breakpoints.md
                                    ? {
                                        flex: 1,
                                        height,
                                        paddingTop: insets.top,
                                        paddingBottom: insets.bottom,
                                      }
                                    : { width: "100%" },
                                ]}
                              >
                                <LoadingErrors />
                                <NotificationsModal />
                                <TabFriendModal />
                                <DrawerLayout
                                  contentContainerStyle={{ marginTop: -1 }}
                                  // @ts-expect-error this is patched with patch-package
                                  defaultDrawerOpen={
                                    !desktopCollapsed && breakpoints.md
                                  }
                                  ref={sidebarRef}
                                  onDrawerOpen={() => {
                                    Keyboard.dismiss();
                                    focusPanelFreezerRef.current?.thaw();
                                  }}
                                  onDrawerClose={() => {
                                    focusPanelFreezerRef.current?.freeze();
                                  }}
                                  useNativeAnimations={false}
                                  keyboardDismissMode="on-drag"
                                  drawerLockMode={
                                    drawerLocked ? "locked-closed" : "unlocked"
                                  }
                                  drawerPosition="left"
                                  drawerType={
                                    breakpoints.md
                                      ? desktopCollapsed
                                        ? "slide"
                                        : "front"
                                      : "back"
                                  }
                                  overlayColor="transparent"
                                  drawerWidth={
                                    breakpoints.md &&
                                    pathname.startsWith("/settings")
                                      ? 0
                                      : pathname.includes("/everything")
                                      ? SECONDARY_SIDEBAR_WIDTH
                                      : ORIGINAL_SIDEBAR_WIDTH
                                  }
                                  edgeWidth={
                                    breakpoints.md
                                      ? pathname.startsWith("/settings")
                                        ? 0
                                        : ORIGINAL_SIDEBAR_WIDTH
                                      : sidebarWidth
                                  }
                                  renderNavigationView={renderNavigationView}
                                >
                                  {content}
                                </DrawerLayout>
                              </View>
                            </BadgingProvider>
                          </ThemeProvider>
                        </CommandPaletteProvider>
                      </GlobalTaskContextProvider>
                    </View>
                  </PortalProvider>
                </MenuProvider>
                <Toast
                  topOffset={insets.top + 15}
                  config={toastConfig(theme)}
                />
              </BottomSheetModalProvider>
            </FocusPanelProvider>
          </GestureHandlerRootView>
        </ColorThemeProvider>
      </StorageContextProvider>
    </WebAnimationComponent>
  );
}

