import { CommandPaletteProvider } from "@/components/command-palette/context";
import { FocusPanelProvider } from "@/components/focus-panel/context";
import { JsStack } from "@/components/layout/_stack";
import AccountNavbar from "@/components/layout/account-navbar";
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
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MenuProvider } from "react-native-popup-menu";
import Toast from "react-native-toast-message";
import "react-native-url-polyfill/auto";
import { BottomAppBar } from "../../components/layout/bottom-navigation";

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

  const theme = useColor(
    sessionData?.user?.profile?.theme || "violet",
    // CHANGE THIS LATER!!!
    isDark
    // sessionData?.user?.darkMode === "dark"
  );
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

  const desktopPresentationModal = {
    padding: 15,
    maxWidth: 1000,
    width: 1000,
    paddingRight: 220,
    paddingVertical: 60,
    marginHorizontal: "auto",
    backgroundColor: "transparent",
  };

  return (
    <ColorThemeProvider theme={theme}>
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
              <View
                style={{
                  flexDirection: breakpoints.md ? "row" : "column",
                  flex: 1,
                  backgroundColor: theme[breakpoints.md ? 2 : 1],
                }}
              >
                <CommandPaletteProvider>
                  <FocusPanelProvider>
                    {breakpoints.md && <Sidebar />}
                    <ThemeProvider
                      value={{
                        ...DefaultTheme,
                        colors: {
                          ...DefaultTheme.colors,
                          background: theme[breakpoints.sm ? 2 : 1],
                        },
                      }}
                    >
                      <JsStack
                        screenOptions={{
                          header: () => null,
                          headerTransparent: true,
                          gestureResponseDistance: width,
                          gestureEnabled: true,
                          cardStyle: {
                            backgroundColor: theme[breakpoints.sm ? 2 : 1],
                            padding: breakpoints.md ? 10 : 0,
                            ...(Platform.OS === "web" &&
                              ({
                                marginTop: "env(titlebar-area-height,0)",
                              } as any)),
                          },
                          // change opacity of the previous screen when swipe
                          cardOverlayEnabled: true,
                          animationEnabled: true,
                          gestureVelocityImpact: 0.7,
                        }}
                      >
                        <JsStack.Screen
                          name="index"
                          options={{
                            header: breakpoints.md
                              ? () => null
                              : (props: any) => <AccountNavbar {...props} />,
                          }}
                        />
                        {[
                          "settings/index",
                          "settings/appearance",
                          "settings/personal-information",
                        ].map((d) => (
                          <JsStack.Screen
                            name={d}
                            key={d}
                            options={{
                              headerTitle: d !== "settings/index" && "Settings",
                              header: (props) => (
                                <Navbar icon="arrow_back_ios_new" {...props} />
                              ),
                              // cardStyle: { width: 500, marginLeft: "auto" },
                              // detachPreviousScreen: false,
                              ...TransitionPresets.SlideFromRightIOS,
                              cardStyleInterpolator: forHorizontalIOS,
                            }}
                          />
                        ))}
                        <JsStack.Screen
                          name="friends"
                          options={{
                            header: (props) => (
                              <Navbar icon="arrow_back_ios_new" {...props} />
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
                        {["space"].map((d) => (
                          <JsStack.Screen
                            name={d}
                            key={d}
                            options={{
                              presentation: "modal",
                              ...TransitionPresets.ModalPresentationIOS,
                              gestureResponseDistance: height,
                              cardStyle: {
                                marginBottom: 0,
                                ...(breakpoints.md && desktopPresentationModal),
                              },
                            }}
                          />
                        ))}
                      </JsStack>
                    </ThemeProvider>
                  </FocusPanelProvider>
                </CommandPaletteProvider>
                {!breakpoints.md && <BottomAppBar />}
              </View>
            </PortalProvider>
          </MenuProvider>
        </BottomSheetModalProvider>
        <Toast config={toastConfig(theme)} />
      </GestureHandlerRootView>
    </ColorThemeProvider>
  );
}
