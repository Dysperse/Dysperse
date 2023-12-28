import BottomSheet from "@/ui/BottomSheet";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  useBottomSheet,
} from "@gorhom/bottom-sheet";
import { router, usePathname } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { useAnimatedReaction } from "react-native-reanimated";
import useSWR from "swr";
import { CreateDrawer } from "./create-drawer";
import { OpenTabsList } from "./tabs/carousel";
import { Tab } from "./tabs/tab";

export const getBottomNavigationHeight = (pathname) =>
  pathname === "/" ? 58 : 58 + 50;

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
const useKeyboardVisibility = () => {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    if (Platform.OS === "web") return;
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true); // or some other action
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false); // or some other action
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  return isKeyboardVisible;
};

function BottomNavigation() {
  const theme = useColorTheme();
  const pathname = usePathname();
  const { animatedIndex, snapToIndex } = useBottomSheet();

  const [currentIndex, setCurrentIndex] = useState(0);

  useAnimatedReaction(
    () => animatedIndex.value,
    (value) => {
      if (value === 1) setCurrentIndex(1);
      else if (value === 0) setCurrentIndex(0);
    }
  );

  const { data, error } = useSWR(["user/tabs"]);

  return (
    <View
      style={{
        borderTopWidth: 1,
        borderTopColor: theme[5],
        height: 500,
      }}
    >
      {currentIndex === 1 ? (
        <View>
          <View
            style={{
              gap: 10,
              paddingTop: 10,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 20,
            }}
          >
            <IconButton onPress={() => snapToIndex(0)} variant="filled">
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
              //  onDragEnd={({ data }) => {
              //    const newData = data.map((item, index) => ({
              //      id: item.id,
              //      order: index,
              //    }));
              //    sendApiRequest(sessionToken, "PUT", "user/tabs/order", {
              //      tabs: JSON.stringify(newData),
              //    }).then(() => mutate());
              //  }}
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
                    <Tab
                      tab={item}
                      isList
                      handleClose={() => snapToIndex(0)}
                      // onLongPress={drag}
                    />
                  </View>
                )) as any
              }
              keyExtractor={(item: any) => item.id}
            />
          ) : error ? (
            <ErrorAlert />
          ) : (
            <ActivityIndicator />
          )}
        </View>
      ) : (
        <View>
          {pathname !== "/" && <OpenTabsList />}
          <View
            style={{
              height: 55,
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 10,
              flexDirection: "row",
            }}
          >
            <IconButton
              onPress={() => {
                router.push("/");
              }}
            >
              <Icon size={28} filled={pathname == "/"}>
                home
              </Icon>
            </IconButton>
            <CreateDrawer>
              <IconButton variant="filled">
                <Icon size={30}>add</Icon>
              </IconButton>
            </CreateDrawer>
            <IconButton onPress={() => snapToIndex(1)}>
              <Icon size={26}>stack</Icon>
            </IconButton>
          </View>
        </View>
      )}
    </View>
  );
}

export function BottomAppBar() {
  const pathname = usePathname();
  const isKeyboardVisible = useKeyboardVisibility();
  const shouldHide =
    ["/account", "/tabs", "/open", "/space"].includes(pathname) ||
    isKeyboardVisible;
  const theme = useColorTheme();

  const ref = useRef<BottomSheetModal>(null);

  const handleOpen = useCallback(() => ref.current?.present(), []);

  useEffect(() => {
    handleOpen();
  }, [handleOpen, shouldHide]);

  return shouldHide ? null : (
    <BottomSheet
      snapPoints={[pathname === "/" ? 55 : 55 * 2, "70%"]}
      sheetRef={ref}
      appearsOnIndex={1}
      dismissible={false}
      enablePanDownToClose={false}
      onClose={() => null}
      handleComponent={() => null}
      stackBehavior="push"
      backgroundStyle={{
        borderRadius: 0,
        backgroundColor: theme[1],
      }}
      backdropComponent={(d) => <BottomSheetBackdrop {...d} />}
    >
      <BottomNavigation />
    </BottomSheet>
  );
}
