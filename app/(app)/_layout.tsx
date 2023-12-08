import { useSession } from "@/context/AuthProvider";
import { OpenTabsProvider } from "@/context/tabs";
import { useUser } from "@/context/useUser";
import IconButton from "@/ui/IconButton";
import AccountNavbar from "@/ui/account-navbar";
import Icon from "@/ui/Icon";
import Navbar from "@/ui/navbar";
import {
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import * as NavigationBar from "expo-navigation-bar";
import { Redirect, Stack, router, usePathname } from "expo-router";
import React, { cloneElement, useCallback, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SWRConfig } from "swr";
import { OpenTabsList, Tab } from "./OpenTabsList";

import { BottomSheetBackHandler } from "@/ui/BottomSheet/BottomSheetBackHandler";
import { BottomSheetBackdropComponent } from "@/ui/BottomSheet/BottomSheetBackdropComponent";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { CreateDrawer } from "../../components/create-drawer";
dayjs.extend(advancedFormat);

const TabDrawer = ({ children }) => {
  const { session } = useUser();
  const ref = useRef<BottomSheetModal>(null);

  // callbacks
  const handleOpen = useCallback(() => ref.current?.present(), []);
  const handleClose = useCallback(() => ref.current?.close(), []);
  const trigger = cloneElement(children, { onPress: handleOpen });

  return (
    <View>
      {trigger}
      <BottomSheetModal
        ref={ref}
        snapPoints={["50%", "80%"]}
        backdropComponent={BottomSheetBackdropComponent}
      >
        <BottomSheetBackHandler handleClose={handleClose} />
        <View className="flex-row items-center px-5 mb-2">
          <IconButton className="bg-gray-100 mr-4" onPress={handleClose}>
            <Icon>expand_more</Icon>
          </IconButton>
          <Text
            className="py-3 text-2xl flex-1"
            style={{ fontFamily: "body_700" }}
          >
            Tabs
          </Text>
          <IconButton
            className="bg-gray-100"
            onPress={() => router.push("/tabs/new")}
          >
            <Icon>add</Icon>
          </IconButton>
        </View>
        {session ? (
          <BottomSheetFlatList
            ListFooterComponent={
              <View className="flex-row items-center p-4 opacity-50 justify-center pb-8">
                <Icon>info</Icon>
                <Text className="ml-2">Tabs are synced between devices</Text>
              </View>
            }
            data={session.user.tabs}
            renderItem={({ item }) => (
              <View className="pl-4 flex-row items-center">
                <Tab tab={item} isList />
                <IconButton className="mr-4" onPress={handleClose}>
                  <Icon>remove_circle</Icon>
                </IconButton>
              </View>
            )}
            keyExtractor={(item: any) => item.id}
          />
        ) : (
          <ActivityIndicator />
        )}
      </BottomSheetModal>
    </View>
  );
};

export const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    alignItems: "center",
  },
});

function BottomAppBar() {
  const pathname = usePathname();
  const shouldHide = ["/account", "/tabs", "/tabs/new"].includes(pathname);

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
        <Pressable onPress={() => router.push("/")}>
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
          <Pressable className="active:opacity-50">
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
              name="tabs/new"
              options={{
                header: (props) => <Navbar {...props} />,
                animation: "fade",
                presentation: "modal",
              }}
            />
          </Stack>
          <BottomAppBar />
        </SWRConfig>
      </BottomSheetModalProvider>
    </OpenTabsProvider>
  );
}
