import { CommandPaletteProvider } from "@/components/command-palette/context";
import PanelSwipeTrigger from "@/components/focus-panel/PanelSwipeTrigger";
import { FocusPanelProvider } from "@/components/focus-panel/context";
import AppContainer from "@/components/layout/AppContainer";
import NotificationsModal from "@/components/layout/NotificationsModal";
import TabFriendModal from "@/components/layout/TabFriendModal";
import { JsStack } from "@/components/layout/_stack";
import { arcCard } from "@/components/layout/arcAnimations";
import { forHorizontalIOS } from "@/components/layout/forHorizontalIOS";
import { SessionLoadingScreen } from "@/components/layout/loading";
import Sidebar, { MiniLogo } from "@/components/layout/sidebar";
import { useSidebarContext } from "@/components/layout/sidebar/context";
import { useSession } from "@/context/AuthProvider";
import { GlobalTaskContextProvider } from "@/context/globalTaskContext";
import { StorageContextProvider } from "@/context/storageContext";
import { useUser } from "@/context/useUser";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { useColor, useDarkMode } from "@/ui/color";
import { ColorThemeProvider } from "@/ui/color/theme-provider";
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
import {
  Redirect,
  router,
  SplashScreen,
  useGlobalSearchParams,
  usePathname,
} from "expo-router";
import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  Animated,
  InteractionManager,
  Platform,
  Pressable,
  useWindowDimensions,
  View,
} from "react-native";
import {
  DrawerLayout,
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { MenuProvider } from "react-native-popup-menu";
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

function DesktopLayout({ children }) {
  const { desktopCollapsed, setDesktopCollapsed } = useSidebarContext();
  const breakpoints = useResponsiveBreakpoints();
  const { fullscreen } = useGlobalSearchParams();

  if (fullscreen)
    return (
      <>
        {Platform.OS === "web" && (
          <MiniLogo desktopSlide={{ value: 0 }} onHoverIn={() => {}} />
        )}
        {children}
      </>
    );

  return (
    <View style={{ flex: 1, flexDirection: "row" }}>
      <Sidebar />
      {breakpoints.md && !desktopCollapsed && (
        <GestureDetector
          gesture={Gesture.Tap().onEnd(() => {
            setDesktopCollapsed((t) => !t);
          })}
        >
          <PanelSwipeTrigger side="left" />
        </GestureDetector>
      )}
      {children}
    </View>
  );
}

const WebAnimationComponent = ({ children }) => {
  if (Platform.OS === "web") {
    return (
      <View aria-valuetext="web-app-animation" style={{ flex: 1 }}>
        {children}
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
  const progressValue = useRef(null);

  const { sidebarRef, SIDEBAR_WIDTH } = useSidebarContext();

  useEffect(() => {
    if (sessionData?.user?.timeZone)
      dayjs.tz.setDefault(sessionData?.user?.timeZone);
  }, [sidebarRef]);

  const theme = useColor(sessionData?.user?.profile?.theme || "mint");

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

  InteractionManager.runAfterInteractions(() => {
    SplashScreen.hide();
  });

  if (!session) return <Redirect href="/auth" />;

  const renderNavigationView = (v: Animated.Value) => {
    progressValue.current = v;

    return (
      <Pressable style={{ flex: 1 }}>
        <Sidebar progressValue={v} />
      </Pressable>
    );
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
            name="plan"
            options={arcCard({ theme, breakpoints, maxWidth: 500 })}
          />
          <JsStack.Screen
            name="collections/create"
            options={{
              detachPreviousScreen: true,
              cardOverlayEnabled: !breakpoints.md,
              ...TransitionPresets.SlideFromRightIOS,
              cardStyleInterpolator: forHorizontalIOS,
            }}
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
                          <FocusPanelProvider>
                            <View
                              style={[
                                breakpoints.md
                                  ? { flex: 1, height }
                                  : { width: "100%" },
                              ]}
                            >
                              <LoadingErrors />
                              <NotificationsModal />
                              <TabFriendModal />
                              {breakpoints.md ? (
                                <DesktopLayout>{content}</DesktopLayout>
                              ) : (
                                <DrawerLayout
                                  ref={sidebarRef}
                                  useNativeAnimations={false}
                                  drawerLockMode={
                                    pathname.includes(
                                      "everything/collections/"
                                    ) ||
                                    pathname.includes("/customize") ||
                                    pathname.includes("insights") ||
                                    pathname.includes("everything/labels/") ||
                                    (pathname.includes("/plan") &&
                                      !pathname.includes("/planner")) ||
                                    pathname.includes("open") ||
                                    (pathname.includes("collections") &&
                                      (pathname.includes("/search") ||
                                        pathname.includes("/reorder") ||
                                        pathname.includes("/share")))
                                      ? "locked-closed"
                                      : "unlocked"
                                  }
                                  drawerPosition="left"
                                  drawerType="back"
                                  overlayColor="transparent"
                                  drawerWidth={SIDEBAR_WIDTH}
                                  edgeWidth={sidebarWidth}
                                  renderNavigationView={renderNavigationView}
                                >
                                  {content}
                                </DrawerLayout>
                              )}
                            </View>
                          </FocusPanelProvider>
                        </ThemeProvider>
                      </CommandPaletteProvider>
                    </GlobalTaskContextProvider>
                  </View>
                </PortalProvider>
              </MenuProvider>
              <Toast config={toastConfig(theme)} />
            </BottomSheetModalProvider>
          </GestureHandlerRootView>
        </ColorThemeProvider>
      </StorageContextProvider>
    </WebAnimationComponent>
  );
}

