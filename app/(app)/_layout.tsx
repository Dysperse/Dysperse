import AccountNavbar from "@/components/layout/account-navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { useSession } from "@/context/AuthProvider";
import { useUser } from "@/context/useUser";
import { useColor } from "@/ui/color";
import { ColorThemeProvider } from "@/ui/color/theme-provider";
import Navbar from "@/ui/navbar";
import { toastConfig } from "@/ui/toast.config";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { PortalProvider } from "@gorhom/portal";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import isBetween from "dayjs/plugin/isBetween";
import isoWeek from "dayjs/plugin/isoWeek";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Redirect, Stack } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  AppState,
  StatusBar,
  View,
  useColorScheme,
  useWindowDimensions,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { SWRConfig } from "swr";
import { BottomAppBar } from "../../components/layout/bottom-navigation";
import { OpenTabsList } from "../../components/layout/bottom-navigation/tabs/carousel";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);
dayjs.extend(relativeTime);
dayjs.extend(advancedFormat);
dayjs.extend(isoWeek);
function DesktopHeader() {
  return (
    <View
      style={{
        height: 64,
        justifyContent: "center",
      }}
    >
      <OpenTabsList />
    </View>
  );
}

export default function AppLayout() {
  const { session, isLoading } = useSession();
  const { session: sessionData, isLoading: isUserLoading } = useUser();
  const { width } = useWindowDimensions();
  const isDark = useColorScheme() === "dark";

  const theme = useColor(
    sessionData?.user?.theme || "violet",
    // CHANGE THIS LATER!!!
    isDark
    // sessionData?.user?.darkMode === "dark"
  );
  // You can keep the splash screen open, or render a loading screen like we do here.
  if (isLoading || isUserLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  if (!session) {
    // On web, static rendering will stop here as the user is not authenticated
    // in the headless Node process that the pages are rendered in.
    return <Redirect href="/sign-in" />;
  }

  // This layout can be deferred because it's not the root layout.
  return (
    <PortalProvider>
      <ColorThemeProvider theme={theme}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SWRConfig
            value={{
              fetcher: async ([
                resource,
                params,
                host = "https://api.dysperse.com",
                init = {},
              ]) => {
                const url = `${host}/${resource}?${new URLSearchParams(
                  params
                ).toString()}`;
                const res = await fetch(url, {
                  headers: {
                    Authorization: `Bearer ${session}`,
                  },
                  ...init,
                });
                return await res.json();
              },

              provider: () => new Map(),
              isVisible: () => true,
              initFocus(callback) {
                let appState = AppState.currentState;

                const onAppStateChange = (nextAppState) => {
                  /* If it's resuming from background or inactive mode to active one */
                  if (
                    appState.match(/inactive|background/) &&
                    nextAppState === "active"
                  ) {
                    callback();
                  }
                  appState = nextAppState;
                };

                // Subscribe to the app state change events
                const subscription = AppState.addEventListener(
                  "change",
                  onAppStateChange
                );

                return () => {
                  subscription.remove();
                };
              },
            }}
          >
            <BottomSheetModalProvider>
              <StatusBar
                barStyle={!isDark ? "dark-content" : "light-content"}
              />
              <View
                style={{
                  flexDirection: width > 600 ? "row" : "column",
                  flex: 1,
                  backgroundColor: theme[1],
                }}
              >
                {width > 600 && <Sidebar />}
                <ThemeProvider
                  value={{
                    ...DefaultTheme,
                    colors: {
                      ...DefaultTheme.colors,
                      background: theme[1],
                    },
                  }}
                >
                  <Stack
                    screenOptions={{
                      header:
                        width > 600
                          ? DesktopHeader
                          : (props: any) => <AccountNavbar {...props} />,
                      headerTransparent: true,
                      fullScreenGestureEnabled: true,
                      contentStyle: {
                        backgroundColor: theme[width > 600 ? 2 : 1],
                      },
                    }}
                  >
                    <Stack.Screen
                      name="index"
                      options={{
                        animation: "fade",
                      }}
                    />
                    <Stack.Screen
                      name="account"
                      options={{
                        header: (props) => <Navbar {...props} />,
                        headerTitle: "Account",
                        animation: "slide_from_right",
                      }}
                    />
                    <Stack.Screen
                      name="open"
                      options={{
                        header: (props) => <Navbar {...props} />,
                        animation: "fade",
                        presentation: "modal",
                      }}
                    />
                    <Stack.Screen
                      name="[tab]/spaces/[id]"
                      options={{
                        ...(width < 600 && { header: () => null }),
                        animation: "fade",
                      }}
                    />
                    <Stack.Screen
                      name="[tab]/perspectives/agenda/[type]/[start]"
                      options={{
                        animation: "fade",
                        header: width > 600 ? DesktopHeader : () => null,
                      }}
                    />
                  </Stack>
                </ThemeProvider>
                {width < 600 && <BottomAppBar />}
              </View>
            </BottomSheetModalProvider>
          </SWRConfig>
          <Toast config={toastConfig(theme)} />
        </GestureHandlerRootView>
      </ColorThemeProvider>
    </PortalProvider>
  );
}
