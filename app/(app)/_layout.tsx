import { Redirect, Stack, router, usePathname } from "expo-router";
import {
  ActivityIndicator,
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
import { Easing } from "react-native-reanimated";

import React, { cloneElement, useCallback, useMemo, useRef } from "react";

import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";

const TestBottomSheet = ({ children }) => {
  // ref
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // callbacks
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  const trigger = cloneElement(children, {
    onPress: handlePresentModalPress,
  });

  return (
    <View style={styles.container}>
      {trigger}
      <BottomSheetModal
        // enablePanDownToClose
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={["50%"]}
        onChange={handleSheetChanges}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
          />
        )}
      >
        <View style={styles.contentContainer}>
          <Text>Let's create something! 🎉</Text>
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

function BottomAppBar() {
  const pathname = usePathname();
  const shouldHide = ["/account"].includes(pathname);

  return shouldHide ? null : (
    <View style={{ height: 128 }} className="bg-gray-100">
      <View style={{ height: 64 }}></View>
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
            <Icon size={30}>add</Icon>
          </Pressable>
        </TestBottomSheet>
        <Icon size={30}>grid_view</Icon>
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
            }}
          />
        </Stack>
        <BottomAppBar />
      </SWRConfig>
    </BottomSheetModalProvider>
  );
}
