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
import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { KeysProvider } from "react-native-hotkeys";

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
        height: pathname === "/" ? 50 : 53 + 50,
        backgroundColor: "#eee",
        ...(Platform.OS === "web" && ({ userSelect: "none" } as any)),
      }}
    >
      {pathname !== "/" && <OpenTabsList />}
      <View
        style={{ height: 53 }}
        className="px-5 flex-row items-center justify-between"
      >
        <Pressable
          onPress={() => router.push("/")}
          className="p-2.5 pr-20 -ml-2.5 active:opacity-50"
        >
          <Icon size={30} filled={pathname === "/"}>
            home
          </Icon>
        </Pressable>
        <CreateDrawer>
          <Pressable className="w-10 h-10 bg-gray-300 active:bg-gray-400 justify-center items-center rounded-full">
            <Icon size={30}>add</Icon>
          </Pressable>
        </CreateDrawer>
        <TabDrawer>
          <Pressable className="active:opacity-50 p-2.5 pl-20 -mr-2.5">
            <Icon size={30}>grid_view</Icon>
          </Pressable>
        </TabDrawer>
      </View>
    </View>
  );
}

export default function AppLayout() {
  const { session, isLoading } = useSession();
  const insets = useSafeAreaInsets();

  // You can keep the splash screen open, or render a loading screen like we do here.
  if (isLoading) {
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* <KeysProvider> */}
      <OpenTabsProvider>
        <TabHandler />
        <BottomSheetModalProvider>
          <SWRConfig
            value={{
              fetcher: ([
                resource,
                params,
                host = "https://api.dysperse.com",
                init = {},
              ]) => {
                const url = `${host}/${resource}?${new URLSearchParams(
                  params
                ).toString()}`;
                return fetch(url, {
                  headers: {
                    Authorization: `Bearer ${session}`,
                  },
                  ...init,
                }).then((res) => res.json());
              },
            }}
          >
            <Stack
              screenOptions={{
                header: (props: any) => <AccountNavbar {...props} />,
                headerTransparent: true,
                headerBackground: () => (
                  <View
                    style={{
                      marginBottom: 100,
                      height: 100,
                    }}
                  />
                ),
                contentStyle: {
                  backgroundColor: "#fff",
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
  );
}
