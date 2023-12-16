import { useSession } from "@/context/AuthProvider";
import { OpenTabsProvider, useOpenTab } from "@/context/tabs";
import { useUser } from "@/context/useUser";
import Icon from "@/ui/Icon";
import AccountNavbar from "@/ui/account-navbar";
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
  StyleSheet,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SWRConfig } from "swr";
import { CreateDrawer } from "../../components/create-drawer";
import { OpenTabsList } from "../../components/tabs/carousel";
import { TabDrawer } from "../../components/tabs/list";
import { addHslAlpha, useColor } from "@/ui/color";
import { ColorThemeProvider, useColorTheme } from "@/ui/color/theme-provider";
import Text from "@/ui/Text";

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

function BottomAppBar() {
  const pathname = usePathname();
  const shouldHide = ["/account", "/tabs", "/open"].includes(pathname);
  const theme = useColorTheme();

  useEffect(() => {
    if (Platform.OS === "android") {
      const color = shouldHide ? "#fff" : "#eee";
      NavigationBar.setBackgroundColorAsync(color);
      NavigationBar.setBorderColorAsync(color);
      NavigationBar.setButtonStyleAsync("dark");
    }
  }, [Platform.OS, shouldHide]);

  return shouldHide ? null : (
    <View
      style={{
        height: pathname === "/" ? 57 : 57 + 50,
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

export default function AppLayout() {
  const { session, isLoading } = useSession();
  const { session: sessionData, isLoading: isUserLoading } = useUser();

  const theme = useColor(
    sessionData?.user?.color || "violet",
    // CHANGE THIS LATER!!!
    false
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
        {/* <KeysProvider> */}
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
              <Stack
                screenOptions={{
                  header: (props: any) => <AccountNavbar {...props} />,
                  headerTransparent: true,
                  fullScreenGestureEnabled: true,
                  contentStyle: {
                    backgroundColor: theme[1],
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
                    // gestureResponseDistance: 900,
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
                    header: () => null,
                  }}
                />
              </Stack>
              <BottomAppBar />
            </SWRConfig>
          </BottomSheetModalProvider>
        </OpenTabsProvider>
        {/* </KeysProvider> */}
      </GestureHandlerRootView>
    </ColorThemeProvider>
  );
}
