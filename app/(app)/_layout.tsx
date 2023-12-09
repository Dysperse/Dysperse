import { useSession } from "@/context/AuthProvider";
import { OpenTabsProvider } from "@/context/tabs";
import AccountNavbar from "@/ui/account-navbar";
import Icon from "@/ui/Icon";
import Navbar from "@/ui/navbar";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
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
import { SWRConfig } from "swr";
import { OpenTabsList } from "../../components/tabs/carousel";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import utc from "dayjs/plugin/utc";
import { CreateDrawer } from "../../components/create-drawer";
import { TabDrawer } from "../../components/tabs/list";
dayjs.extend(advancedFormat);
dayjs.extend(utc);

export const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    alignItems: "center",
  },
});

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
      style={{ height: pathname === "/" ? 64 : 128, backgroundColor: "#eee" }}
    >
      {pathname !== "/" && (
        <View style={{ height: 64 }}>
          <OpenTabsList />
        </View>
      )}
      <View
        style={{ height: 64 }}
        className="px-5 flex-row items-center justify-between"
      >
        <Pressable onPress={() => router.push("/")} className="p-2.5 -ml-2.5">
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
          <Pressable className="active:opacity-50 p-2.5 -mr-2.5">
            <Icon size={30}>grid_view</Icon>
          </Pressable>
        </TabDrawer>
      </View>
    </View>
  );
}

export default function AppLayout() {
  const { session, isLoading } = useSession();

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
    <OpenTabsProvider>
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
              contentStyle: {
                backgroundColor: "#fff",
              },
            }}
          >
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
              name="perspectives/agenda/[view]"
              options={{
                animation: "fade",
              }}
            />
            <Stack.Screen
              name="index"
              options={{
                animation: "fade",
              }}
            />
          </Stack>
          <BottomAppBar />
        </SWRConfig>
      </BottomSheetModalProvider>
    </OpenTabsProvider>
  );
}
