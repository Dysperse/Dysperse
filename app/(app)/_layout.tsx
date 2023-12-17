import { useSession } from "@/context/AuthProvider";
import { OpenTabsProvider, useOpenTab } from "@/context/tabs";
import { useUser } from "@/context/useUser";
import Icon from "@/ui/Icon";
import AccountNavbar, { NavbarProfilePicture } from "@/ui/account-navbar";
import Navbar from "@/ui/navbar";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import isBetween from "dayjs/plugin/isBetween";
import isoWeek from "dayjs/plugin/isoWeek";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import * as NavigationBar from "expo-navigation-bar";
import { Redirect, Stack, router, usePathname } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  View,
  useColorScheme,
  useWindowDimensions,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SWRConfig } from "swr";
import { CreateDrawer } from "../../components/create-drawer";
import { OpenTabsList } from "../../components/tabs/carousel";
import { TabDrawer } from "../../components/tabs/list";
import { addHslAlpha, useColor } from "@/ui/color";
import { ColorThemeProvider, useColorTheme } from "@/ui/color/theme-provider";
import Text from "@/ui/Text";
import { KeysProvider } from "react-native-hotkeys";
import IconButton from "@/ui/IconButton";
import Logo from "@/ui/logo";

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

export const getBottomNavigationHeight = (pathname) =>
  pathname === "/" ? 57 : 57 + 50;

function BottomAppBar() {
  const pathname = usePathname();
  const shouldHide = ["/account", "/tabs", "/open"].includes(pathname);
  const theme = useColorTheme();

  useEffect(() => {
    if (Platform.OS === "android") {
      const color = shouldHide ? "#fff" : theme[1];
      NavigationBar.setBackgroundColorAsync(color);
      NavigationBar.setBorderColorAsync(color);
      NavigationBar.setButtonStyleAsync("dark");
    }
  }, [Platform.OS, shouldHide]);

  return shouldHide ? null : (
    <View
      style={{
        height: getBottomNavigationHeight(pathname),
        backgroundColor: theme[1],
        ...(Platform.OS === "web" && ({ userSelect: "none" } as any)),
      }}
    >
      <View style={{ height: 2, backgroundColor: theme[3] }} />
      {pathname !== "/" && <OpenTabsList />}
      <View
        style={{ height: 55, paddingTop: 4 }}
        className="px-5 flex-row items-center justify-between"
      >
        <Pressable
          onPress={() => router.push("/")}
          className="p-2.5 pr-20 -ml-2.5 active:opacity-50"
        >
          <Icon
            size={30}
            filled={pathname === "/"}
            style={{ color: theme[11] }}
          >
            home
          </Icon>
        </Pressable>
        <CreateDrawer>
          <Pressable
            // className="w-10 h-10 justify-center items-center rounded-full"
            style={({ pressed, hovered }: any) => ({
              width: 40,
              height: 40,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 99,
              backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3],
            })}
          >
            <Icon style={{ color: theme[11] }} size={30}>
              add
            </Icon>
          </Pressable>
        </CreateDrawer>
        <TabDrawer>
          <Pressable className="active:opacity-50 p-2.5 pl-20 -mr-2.5">
            <Icon size={30} style={{ color: theme[11] }}>
              grid_view
            </Icon>
          </Pressable>
        </TabDrawer>
      </View>
    </View>
  );
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
            </SWRConfig>
          </BottomSheetModalProvider>
        </OpenTabsProvider>
      </GestureHandlerRootView>
    </ColorThemeProvider>
  );
}
