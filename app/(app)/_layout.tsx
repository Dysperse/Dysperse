import { useSession } from "@/context/AuthProvider";
import { OpenTabsProvider, useOpenTab } from "@/context/tabs";
import { useUser } from "@/context/useUser";
import Icon from "@/ui/Icon";
import AccountNavbar, {
  NavbarProfilePicture,
} from "@/components/layout/account-navbar";
import Navbar from "@/ui/navbar";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import isBetween from "dayjs/plugin/isBetween";
import isoWeek from "dayjs/plugin/isoWeek";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import { Redirect, Stack, usePathname } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  View,
  useColorScheme,
  useWindowDimensions,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SWRConfig } from "swr";
import { OpenTabsList } from "../../components/layout/bottom-navigation/tabs/carousel";
import { TabDrawer } from "../../components/layout/bottom-navigation/tabs/list";
import { addHslAlpha, useColor } from "@/ui/color";
import { ColorThemeProvider, useColorTheme } from "@/ui/color/theme-provider";
import Text from "@/ui/Text";
import { KeysProvider } from "react-native-hotkeys";
import IconButton from "@/ui/IconButton";
import Logo from "@/ui/logo";
import Toast from "react-native-toast-message";
import { toastConfig } from "@/ui/toast.config";
import { BottomAppBar } from "../../components/layout/bottom-navigation";

dayjs.extend(isBetween);
dayjs.extend(relativeTime);
dayjs.extend(advancedFormat);
dayjs.extend(isoWeek);
dayjs.extend(utc);

export const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    alignItems: "center",
  },
});

function Sidebar() {
  const theme = useColorTheme();

  return (
    <View
      style={{
        height: "100%",
        backgroundColor: theme[2],
        width: 75,
        flexDirection: "column",
        alignItems: "center",
        padding: 15,
      }}
    >
      <Logo color={theme[8]} size={40} />
      <View style={{ flex: 1 }} />

      <TabDrawer>
        <IconButton
          buttonStyle={{
            width: 50,
            height: 50,
          }}
        >
          <Icon size={30} style={{ color: theme[11] }}>
            grid_view
          </Icon>
        </IconButton>
      </TabDrawer>
      <NavbarProfilePicture />
    </View>
  );
}

function TabHandler() {
  const { session } = useUser();
  const { activeTab, setActiveTab } = useOpenTab();
  const pathname = usePathname();

  useEffect(() => {
    if (session) {
      const tab = session.user.tabs.find(
        (tab) => tab?.tabData?.href === pathname
      );
      if (tab) {
        setActiveTab(tab.id);
      }
    }
  }, [activeTab, pathname, setActiveTab, session]);

  return null;
}

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
    sessionData?.user?.color || "violet",
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
    <ColorThemeProvider theme={theme}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <OpenTabsProvider>
          <TabHandler />
          <BottomSheetModalProvider>
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
              }}
            >
              <StatusBar
                barStyle={!isDark ? "dark-content" : "light-content"}
              />
              <View
                style={{
                  flexDirection: width > 600 ? "row" : "column",
                  height: "100%",
                }}
              >
                {width > 600 && <Sidebar />}
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
                    name="perspectives/agenda/[type]/[start]"
                    options={{
                      animation: "fade",
                      header: width > 600 ? DesktopHeader : () => null,
                    }}
                  />
                </Stack>
                {width < 600 && <BottomAppBar />}
              </View>
              <Toast config={toastConfig(theme)} />
            </SWRConfig>
          </BottomSheetModalProvider>
        </OpenTabsProvider>
      </GestureHandlerRootView>
    </ColorThemeProvider>
  );
}
