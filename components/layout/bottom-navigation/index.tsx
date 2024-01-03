import BottomSheet from "@/ui/BottomSheet";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import {
  BottomSheetFlatList,
  BottomSheetModal,
  TouchableOpacity,
} from "@gorhom/bottom-sheet";
import { router, usePathname } from "expo-router";
import React, { cloneElement, memo, useCallback, useRef } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import useSWR from "swr";
import { useCommandPalette } from "../command-palette";
import { OpenTabsList } from "./tabs/carousel";
import { Tab } from "./tabs/tab";
import { FlatList } from "react-native-gesture-handler";

const styles = StyleSheet.create({
  helperText: {
    justifyContent: "center",
    flexDirection: "row",
    gap: 15,
    alignItems: "center",
    paddingHorizontal: 30,
    paddingTop: 15,
  },
});

const TabDrawer = memo(function TabDrawer({ children }: any) {
  const ref = useRef<BottomSheetModal>(null);
  const handleOpen = useCallback(() => ref.current?.present(), []);
  const handleClose = useCallback(() => ref.current?.close(), []);
  const trigger = cloneElement(children, { onPress: handleOpen });
  const { data, error } = useSWR(["user/tabs"]);

  return (
    <>
      {trigger}
      <BottomSheet
        sheetRef={ref}
        onClose={handleClose}
        snapPoints={["50%", "90%"]}
      >
        <View
          style={{
            gap: 10,
            paddingTop: 10,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 20,
          }}
        >
          <IconButton onPress={handleClose} variant="filled">
            <Icon>expand_more</Icon>
          </IconButton>
          <Text style={{ fontSize: 20, flex: 1 }} weight={700}>
            Tabs
          </Text>
          <IconButton variant="filled" onPress={() => router.push("/open")}>
            <Icon>add</Icon>
          </IconButton>
        </View>
        {data ? (
          <FlatList
            style={{ marginTop: 15 }}
            ListFooterComponent={
              <View>
                {data.length !== 0 && (
                  <View style={styles.helperText}>
                    <Icon>info</Icon>
                    <Text style={{ opacity: 0.6 }}>
                      Tabs are synced between devices
                    </Text>
                  </View>
                )}
              </View>
            }
            ListEmptyComponent={
              <View
                style={{
                  justifyContent: "center",
                  flexDirection: "row",
                  gap: 15,
                  alignItems: "center",
                  paddingHorizontal: 30,
                }}
              >
                <Icon>info</Icon>
                <Text style={{ opacity: 0.6 }}>
                  You don't have any tabs. Tap "+" to create one.
                </Text>
              </View>
            }
            data={data}
            contentContainerStyle={{ gap: 10 }}
            renderItem={
              (({ item }) => (
                <View
                  style={{
                    width: "100%",
                    flexDirection: "row",
                    paddingHorizontal: 20,
                  }}
                >
                  <Tab tab={item} isList handleClose={handleClose} />
                </View>
              )) as any
            }
            keyExtractor={(item: any) => item.id}
          />
        ) : error ? (
          <ErrorAlert />
        ) : (
          <Spinner />
        )}
      </BottomSheet>
    </>
  );
});

function BottomNavigation() {
  const pathname = usePathname();
  const height = getBottomNavigationHeight(pathname);
  const theme = useColorTheme();
  const { openPalette } = useCommandPalette();

  return (
    <View
      style={{
        height,
        borderTopColor: theme[5],
        borderTopWidth: 1,
        marginBottom: -1,
      }}
    >
      <View>
        {pathname !== "/" && <OpenTabsList />}
        <View
          style={{
            height: 65,
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 25,
            flexDirection: "row",
          }}
        >
          <TouchableOpacity
            onPress={() => {
              router.push("/");
            }}
            style={{ padding: 30, marginLeft: -30 }}
          >
            <Icon size={30} filled={pathname == "/"}>
              home
            </Icon>
          </TouchableOpacity>
          <IconButton
            variant="filled"
            style={{ width: 80 }}
            size={45}
            onPress={openPalette}
          >
            <Icon style={{ transform: [{ rotate: "-11deg" }] }} size={28}>
              electric_bolt
            </Icon>
          </IconButton>
          <TabDrawer>
            <TouchableOpacity
              style={{
                padding: 30,
                marginRight: -30,
              }}
            >
              <Icon size={28}>stack</Icon>
            </TouchableOpacity>
          </TabDrawer>
        </View>
      </View>
    </View>
  );
}

export const getBottomNavigationHeight = (pathname) => {
  const hidden = ["/account", "/tabs", "/open", "/space", "/friends"].includes(
    pathname
  );
  return hidden
    ? 0
    : pathname === "/"
    ? // Default
      65
    : // Carousel
      65 * 2;
};

export const BottomAppBar = memo(function BottomAppBar() {
  const { width } = useWindowDimensions();
  return width < 600 ? <BottomNavigation /> : null;
});
