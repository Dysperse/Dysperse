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
import { OnboardingProvider } from "@/context/OnboardingProvider";
import { GlobalTaskContextProvider } from "@/context/globalTaskContext";
import { StorageContextProvider } from "@/context/storageContext";
import { useUser } from "@/context/useUser";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { useColor, useDarkMode } from "@/ui/color";
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
import weekOfYear from "dayjs/plugin/weekOfYear";
import weekday from "dayjs/plugin/weekday";
import * as Linking from "expo-linking";
import {
  Redirect,
  router,
  SplashScreen,
  useGlobalSearchParams,
  usePathname,
} from "expo-router";
import * as SystemUI from "expo-system-ui";
import { useCallback, useEffect, useRef } from "react";
import {
  InteractionManager,
  Keyboard,
  Platform,
  Pressable,
  StatusBar,
  useWindowDimensions,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import DrawerLayout from "react-native-gesture-handler/ReanimatedDrawerLayout";
import { MenuProvider } from "react-native-popup-menu";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SpotlightSearch from "react-native-spotlight-search";
import Toast from "react-native-toast-message";
import "react-native-url-polyfill/auto";
import useSWR from "swr";

dayjs.extend(weekOfYear);
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

export function LastStateRestore() {
  const { data } = useSWR(["user/tabs"]);
  const breakpoints = useResponsiveBreakpoints();
  const pathname = usePathname();
  const { desktopCollapsed } = useSidebarContext();
  const { fullscreen, tab: currentTab } = useGlobalSearchParams();

  const setCurrentPage = useCallback(async () => {
    if (Platform.OS === "ios") {
      const t = await SpotlightSearch.getInitialSearchItem();
      if (t) return;
    }

    const url = await Linking.getLinkingURL();
    if (url && Platform.OS !== "web") return;

    const lastViewedTab = await AsyncStorage.getItem("lastViewedTab");

    if (lastViewedTab && currentTab !== lastViewedTab) {
      const tab = data.find((t) => t.id === lastViewedTab);
      if (tab) {
        router.replace({
          pathname: tab.slug,
          params: {
            ...tab.params,
            tab: tab.id,
          },
        });
      } else {
        router.replace("/home");
      }
    }
    // weird sidebar bug when opening/closing
    else if (!lastViewedTab || !desktopCollapsed || !breakpoints.md) {
      router.replace("/home");
    }
  }, [desktopCollapsed, breakpoints, currentTab, data]);

  useEffect(() => {
    if (!fullscreen && !pathname.includes("chrome-extension")) setCurrentPage();
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

  const progressValue = useRef(0);

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
    if (Platform.OS === "ios") SystemUI.setBackgroundColorAsync(theme[2]);
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
        .querySelector('meta[name="theme-color"]')
        .setAttribute("content", theme[2]);
    }
  }, [theme, breakpoints.md]);

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

  const renderNavigationView = (v: any) => {
    progressValue.current = v;

    return (
      <Pressable style={{ flex: 1 }}>
        {sessionData?.user && <Sidebar progressValue={v} />}
      </Pressable>
    );
  };

  const drawerLocked =
    pathname.includes("everything/collections/") ||
    pathname.includes("/customize") ||
    pathname.includes("friends") ||
    pathname.includes("insights") ||
    pathname.includes("settings") ||
    pathname.includes("add-widget") ||
    pathname.includes("upload") ||
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
            style={[
              {
                flex: 1,
                overflow: "hidden",
                width,
                height,
                backgroundColor: theme[2],
              },
              Platform.OS === "web" && ({ WebkitAppRegion: "drag" } as any),
              breakpoints.md
                ? {
                    paddingTop: insets.top,
                    paddingBottom: insets.bottom,
                  }
                : { width: "100%" },
            ]}
            key={breakpoints.md ? "desktop" : "mobile"}
          >
            <OnboardingProvider>
              <FocusPanelProvider drawerRef={focusPanelRef}>
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
                      <GlobalTaskContextProvider>
                        <CommandPaletteProvider>
                          <ThemeProvider value={routerTheme}>
                            <BadgingProvider>
                              <NotificationsModal />
                              <TabFriendModal />
                              <DrawerLayout
                                key={desktopCollapsed.toString()}
                                contentContainerStyle={{
                                  backgroundColor: "transparent",
                                  marginTop: -1,
                                }}
                                ref={sidebarRef}
                                onDrawerOpen={() => Keyboard.dismiss()}
                                onDrawerClose={() => {}}
                                drawerLockMode={
                                  !desktopCollapsed && breakpoints.md
                                    ? 2
                                    : drawerLocked
                                    ? 1
                                    : 0
                                }
                                drawerType={
                                  breakpoints.md
                                    ? desktopCollapsed
                                      ? 2
                                      : 0
                                    : 1
                                }
                                overlayColor="transparent"
                                drawerWidth={
                                  pathname.includes("/everything")
                                    ? SECONDARY_SIDEBAR_WIDTH
                                    : ORIGINAL_SIDEBAR_WIDTH
                                }
                                edgeWidth={
                                  breakpoints.md
                                    ? ORIGINAL_SIDEBAR_WIDTH
                                    : pathname.includes("grid")
                                    ? 10000
                                    : width
                                }
                                renderNavigationView={renderNavigationView}
                              >
                                <ThemeProvider
                                  value={{
                                    ...DefaultTheme,
                                    colors: {
                                      background: theme[2],
                                      card: theme[2],
                                      primary: theme[2],
                                      border: theme[6],
                                      text: theme[11],
                                      notification: theme[9],
                                    },
                                  }}
                                >
                                  <LastStateRestore />
                                  <AppContainer
                                    key={desktopCollapsed.toString()}
                                    progressValue={progressValue}
                                  >
                                    <StatusBar
                                      barStyle={
                                        !isDark
                                          ? "dark-content"
                                          : "light-content"
                                      }
                                    />
                                    <JsStack
                                      id={undefined}
                                      screenOptions={{
                                        header: () => null,
                                        gestureResponseDistance: width,
                                        gestureEnabled: false,
                                        detachPreviousScreen: true,
                                        presentation: "modal",
                                        cardStyle: {
                                          height,
                                          width: breakpoints.md
                                            ? "100%"
                                            : width,
                                          backgroundColor:
                                            theme[breakpoints.sm ? 2 : 1],
                                          padding: breakpoints.md ? 10 : 0,
                                          paddingBottom:
                                            Platform.OS === "ios"
                                              ? 0
                                              : undefined,
                                          ...(Platform.OS === "web" &&
                                            ({
                                              marginTop:
                                                "env(titlebar-area-height,0)",
                                            } as any)),
                                        },
                                        animation: "none",
                                      }}
                                    >
                                      <JsStack.Screen name="index" />
                                      {[
                                        "everything/labels/[id]",
                                        "everything/collections/[id]",
                                        "friends",
                                        "[tab]/welcome/task",
                                        "[tab]/welcome/labels",
                                        "[tab]/welcome/collections",
                                        "[tab]/welcome/views",
                                        "insights",
                                        "home/customize",
                                        "home/add-widget",
                                        "plan",
                                      ].map((d) => (
                                        <JsStack.Screen
                                          key={d}
                                          name={d}
                                          options={arcCard({
                                            theme,
                                            breakpoints,
                                            maxWidth: 500,
                                          })}
                                        />
                                      ))}
                                      <JsStack.Screen
                                        name="open"
                                        options={{
                                          presentation: "modal",
                                          animation: "default",
                                          detachPreviousScreen: false,
                                          gestureEnabled: true,
                                          ...TransitionPresets.ModalPresentationIOS,
                                        }}
                                      />
                                      <JsStack.Screen
                                        name="settings"
                                        options={{
                                          gestureEnabled: true,
                                          detachPreviousScreen: false,
                                          gestureResponseDistance: 9999,
                                          ...(!breakpoints.md && {
                                            presentation: "modal",
                                            animation: "default",
                                          }),
                                          ...(!breakpoints.md &&
                                            TransitionPresets.ModalPresentationIOS),
                                        }}
                                      />
                                    </JsStack>
                                  </AppContainer>
                                </ThemeProvider>
                              </DrawerLayout>
                            </BadgingProvider>
                          </ThemeProvider>
                        </CommandPaletteProvider>
                      </GlobalTaskContextProvider>
                    </PortalProvider>
                  </MenuProvider>
                  <Toast
                    topOffset={insets.top + 15}
                    config={toastConfig(theme)}
                  />
                </BottomSheetModalProvider>
              </FocusPanelProvider>
            </OnboardingProvider>
          </GestureHandlerRootView>
        </ColorThemeProvider>
      </StorageContextProvider>
    </WebAnimationComponent>
  );
}

