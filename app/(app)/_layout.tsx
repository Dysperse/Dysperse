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
import { Redirect, usePathname } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
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
import ReleaseModal from "../../components/layout/ReleaseModal";
import SelectionNavbar from "../../components/layout/SelectionNavbar";

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);
dayjs.extend(relativeTime);
dayjs.extend(advancedFormat);
dayjs.extend(isoWeek);
dayjs.extend(weekday);
dayjs.extend(isToday);

export default function AppLayout() {
  const { session, isLoading } = useSession();
  const { session: sessionData, isLoading: isUserLoading } = useUser();
  const { width, height } = useWindowDimensions();
  const isDark = useDarkMode();
  const breakpoints = useResponsiveBreakpoints();
  const pathname = usePathname();
  const progressValue = useRef(null);

  const { desktopCollapsed, setDesktopCollapsed, sidebarRef, SIDEBAR_WIDTH } =
    useSidebarContext();
  useEffect(() => {
    setTimeout(() => {
      sidebarRef.current?.openDrawer?.();
    }, 100);
  }, [sidebarRef]);

  const theme = useColor(sessionData?.user?.profile?.theme || "mint");

  if (Platform.OS === "android")
    NavigationBar.setBackgroundColorAsync(addHslAlpha(theme[1], 0.05));

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

  if (!session) return <Redirect href="/auth" />;

  const content = () => (
    <AppContainer progressValue={progressValue}>
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
          animationEnabled: false,
          gestureVelocityImpact: 0.7,
        }}
      >
        <JsStack.Screen name="index" />
        {["everything/labels/[id]", "everything/collections/[id]"].map((d) => (
          <JsStack.Screen
            key={d}
            name={d}
            options={{
              detachPreviousScreen: true,
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
          "settings/account/profile",
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
              headerTitle: d !== "settings/index" && "Settings",
              ...TransitionPresets.SlideFromRightIOS,
              cardStyleInterpolator: forHorizontalIOS,
              animationEnabled: !breakpoints.md && d !== "settings/index",
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
            gestureEnabled: true,
            animationEnabled: !breakpoints.md,
            cardStyleInterpolator: forHorizontalIOS,
          }}
        />
      </JsStack>
    </AppContainer>
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
                        <View
                          style={[
                            breakpoints.md ? { flex: 1 } : { width: "100%" },
                          ]}
                        >
                          <ReleaseModal />
                          <LoadingErrors />
                          <SelectionNavbar />
                          {breakpoints.md ? (
                            <View style={{ flex: 1, flexDirection: "row" }}>
                              <Sidebar />
                              {content()}
                            </View>
                          ) : (
                            <DrawerLayout
                              ref={sidebarRef}
                              useNativeAnimations={false}
                              drawerPosition="left"
                              drawerType={
                                breakpoints.md
                                  ? desktopCollapsed
                                    ? "front"
                                    : "slide"
                                  : "back"
                              }
                              overlayColor="transparent"
                              drawerWidth={SIDEBAR_WIDTH}
                              edgeWidth={
                                !pathname.includes("settings") &&
                                !pathname.includes("create")
                                  ? width
                                  : 0
                              }
                              renderNavigationView={(v: Animated.Value) => {
                                progressValue.current = v;

                                return (
                                  <Pressable style={{ flexDirection: "row" }}>
                                    <Sidebar progressValue={v} />
                                    {breakpoints.md && (
                                      <GestureDetector
                                        gesture={Gesture.Tap().onEnd(() => {
                                          setDesktopCollapsed((t) => !t);
                                        })}
                                      >
                                        <PanelSwipeTrigger side="left" />
                                      </GestureDetector>
                                    )}
                                  </Pressable>
                                );
                              }}
                            >
                              {content}
                            </DrawerLayout>
                          )}
                        </View>
                      </ThemeProvider>
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
