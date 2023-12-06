import * as NavigationBar from "expo-navigation-bar";
import { Redirect, Stack, router, usePathname } from "expo-router";
import {
  ActivityIndicator,
  Button,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SWRConfig } from "swr";
import { useSession } from "../../context/AuthProvider";
import AccountNavbar from "../../ui/account-navbar";
import Icon from "../../ui/icon";
import Navbar from "../../ui/navbar";

import React, { cloneElement, useCallback, useEffect, useRef } from "react";

import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import { Platform } from "react-native";
import { OpenTabsProvider } from "../../context/tabs";

const TestBottomSheet = ({ children }) => {
  // ref
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // callbacks
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handleClose = useCallback(() => {
    bottomSheetModalRef.current?.close();
  }, []);

  const trigger = cloneElement(children, {
    onPress: handlePresentModalPress,
  });

  return (
    <View style={styles.container}>
      {trigger}
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={["38%"]}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            opacity={0.2}
          />
        )}
      >
        <View className="p-5">
          {[
            { name: "Task", icon: "check_circle" },
            { name: "Item", icon: "package_2" },
            { name: "Note", icon: "sticky_note_2" },
            { name: "Collection", icon: "draw_abstract" },
            { name: "Tab", icon: "tab" },
          ].map((button) => (
            <Pressable
              className="flex-row items-center px-5 py-2.5 rounded-2xl gap-x-3 active:bg-gray-300"
              key={button.name}
              onPress={handleClose}
            >
              <Icon size={30}>{button.icon}</Icon>
              <Text>{button.name}</Text>
            </Pressable>
          ))}
        </View>
      </BottomSheetModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  contentContainer: {
    flex: 1,
    alignItems: "center",
  },
});

function OpenTabsList() {
  const { session } = useSession();

  useEffect(() => {});

  return (
    <>
      <Text>Hi</Text>
    </>
  );
}

function BottomAppBar() {
  const pathname = usePathname();
  const shouldHide = ["/account", "/tabs"].includes(pathname);

  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setBackgroundColorAsync("#eee");
      NavigationBar.setBorderColorAsync("#eee");
      NavigationBar.setButtonStyleAsync("dark");
    }
  }, [Platform.OS]);

  return shouldHide ? null : (
    <View style={{ height: 128, backgroundColor: "#eee" }}>
      <View style={{ height: 64 }}>
        <OpenTabsList />
      </View>
      <View
        style={{ height: 64 }}
        className="px-5 flex-row items-center justify-between"
      >
        <Pressable onPress={() => router.push("/")}>
          <Icon size={30} filled={pathname === "/"}>
            home
          </Icon>
        </Pressable>
        <TestBottomSheet>
          <Pressable className="w-10 h-10 bg-gray-300 active:bg-gray-400 justify-center items-center rounded-full">
            <Icon size={30} style={{ height: 24, lineHeight: 30 }}>
              add
            </Icon>
          </Pressable>
        </TestBottomSheet>
        <Pressable onPress={() => router.push("/tabs")}>
          <Icon size={30}>grid_view</Icon>
        </Pressable>
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
              header: (props) => <AccountNavbar {...props} />,
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
              name="tabs"
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
