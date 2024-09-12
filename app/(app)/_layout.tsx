import { CommandPaletteProvider } from "@/components/command-palette/context";
import { FocusPanelProvider } from "@/components/focus-panel/context";
import { PanelSwipeTrigger } from "@/components/focus-panel/panel";
import AppContainer from "@/components/layout/AppContainer";
import { JsStack } from "@/components/layout/_stack";
import { forHorizontalIOS } from "@/components/layout/forHorizontalIOS";
import { SessionLoadingScreen } from "@/components/layout/loading";
import Sidebar from "@/components/layout/sidebar";
import { useSidebarContext } from "@/components/layout/sidebar/context";
import { useSession } from "@/context/AuthProvider";
import { StorageContextProvider } from "@/context/storageContext";
import { useUser } from "@/context/useUser";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { addHslAlpha, useColor, useDarkMode } from "@/ui/color";
import { ColorThemeProvider } from "@/ui/color/theme-provider";
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
import {
  Redirect,
  SplashScreen,
  useGlobalSearchParams,
  usePathname,
} from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  InteractionManager,
  Platform,
  Pressable,
  StatusBar,
  View,
  useWindowDimensions,
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
import SelectionNavbar from "../../components/layout/SelectionNavbar";

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

  if (fullscreen) return children;

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

export default function AppLayout() {
  const { session, isLoading } = useSession();
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

  InteractionManager.runAfterInteractions(() => {
    SplashScreen.hideAsync();
    if (Platform.OS === "android") {
      NavigationBar.setPositionAsync("absolute");
      NavigationBar.setButtonStyleAsync(isDark ? "light" : "dark");
      NavigationBar.setBackgroundColorAsync(addHslAlpha(theme[2], 0.01));
    }
  });

  if (!session) return <Redirect href="/auth" />;

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
            // change opacity of the previous screen when swipe
            cardOverlayEnabled: true,
            animationEnabled: false,
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
                  animationEnabled: true,
                  ...TransitionPresets.ModalPresentationIOS,
                }}
              />
            )
          )}
          <JsStack.Screen
            name="friends"
            options={{
              detachPreviousScreen: true,
              cardOverlayEnabled: !breakpoints.md,
              ...TransitionPresets.SlideFromRightIOS,
              cardStyleInterpolator: forHorizontalIOS,
            }}
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
              cardStyle: { padding: 0 },
            }}
          />
        </JsStack>
      </AppContainer>
    </ThemeProvider>
  );

  return (
    <StorageContextProvider>
      <StatusBar barStyle={!isDark ? "dark-content" : "light-content"} />
      <ColorThemeProvider theme={theme} setHTMLAttributes>
        <GestureHandlerRootView
          style={{
            flex: 1,
            overflow: "hidden",
            width,
            height,
            backgroundColor: globalThis.IN_DESKTOP_ENV
              ? "transparent"
              : theme[2],
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
                      backgroundColor: globalThis.IN_DESKTOP_ENV
                        ? "transparent"
                        : theme[2],
                    },
                    Platform.OS === "web" &&
                      ({ WebkitAppRegion: "drag" } as any),
                  ]}
                >
                  <CommandPaletteProvider>
                    <ThemeProvider
                      value={{
                        ...DefaultTheme,
                        colors: {
                          ...DefaultTheme.colors,
                          background: theme[breakpoints.sm ? 2 : 1],
                        },
                      }}
                    >
                      <FocusPanelProvider>
                        <View
                          style={[
                            breakpoints.md
                              ? { flex: 1, height }
                              : { width: "100%" },
                          ]}
                        >
                          <LoadingErrors />
                          <SelectionNavbar />

                          {breakpoints.md ? (
                            <DesktopLayout>{content}</DesktopLayout>
                          ) : (
                            <DrawerLayout
                              ref={sidebarRef}
                              useNativeAnimations={false}
                              drawerPosition="left"
                              drawerType="back"
                              overlayColor="transparent"
                              drawerWidth={SIDEBAR_WIDTH}
                              edgeWidth={
                                !pathname.includes("settings/") &&
                                !pathname.includes("create")
                                  ? width
                                  : 0
                              }
                              renderNavigationView={(v: Animated.Value) => {
                                progressValue.current = v;

                                return (
                                  <Pressable
                                    style={{
                                      flex: 1,
                                      backgroundColor: "green",
                                    }}
                                  >
                                    <Sidebar progressValue={v} />
                                  </Pressable>
                                );
                              }}
                            >
                              {content}
                            </DrawerLayout>
                          )}
                        </View>
                      </FocusPanelProvider>
                    </ThemeProvider>
                  </CommandPaletteProvider>
                </View>
              </PortalProvider>
            </MenuProvider>
            <Toast config={toastConfig(theme)} />
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
      </ColorThemeProvider>
    </StorageContextProvider>
  );
}

