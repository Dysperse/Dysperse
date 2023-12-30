import BottomSheet from "@/ui/BottomSheet";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
  TouchableOpacity,
  useBottomSheet,
} from "@gorhom/bottom-sheet";
import { router, usePathname } from "expo-router";
import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import Animated, {
  Extrapolate,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
} from "react-native-reanimated";
import useSWR from "swr";
import { CreateDrawer } from "./create-drawer";
import { OpenTabsList } from "./tabs/carousel";
import { Tab } from "./tabs/tab";
import Spinner from "@/ui/Spinner";

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

  const tabListAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      animatedIndex.value,
      [0, 1],
      [0, 1],
      Extrapolate.CLAMP
    ),
    transform: [
      {
        translateY: interpolate(
          animatedIndex.value,
          [0, 1],
          [0, pathname === "/" ? -50 : -100],
          Extrapolate.CLAMP
        ),
      },
    ],
  }));

  const tabStripAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      animatedIndex.value,
      [0, 1],
      [1, 0],
      Extrapolate.CLAMP
    ),
    transform: [
      {
        translateY: interpolate(
          animatedIndex.value,
          [0, 1],
          [0, pathname === "/" ? -50 : -100],
          Extrapolate.CLAMP
        ),
      },
    ],
  }));

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    borderRadius: interpolate(
      animatedIndex.value,
      [0, 1],
      [0, 20],
      Extrapolate.CLAMP
    ),
    borderTopColor: interpolateColor(
      animatedIndex.value,
      [0, 1],
      [theme[5], "transparent"]
    ),
  }));

  const tabListStyle = useMemo(
    () => [tabListAnimatedStyle],
    [tabListAnimatedStyle]
  );

  const tabStripStyle = useMemo(
    () => [tabStripAnimatedStyle],
    [tabStripAnimatedStyle]
  );

  const containerStyle = useMemo(
    () => [
      containerAnimatedStyle,
      {
        height: "100%",
        borderTopWidth: 2,
        backgroundColor: theme[1],
      },
    ],
    [containerAnimatedStyle, theme]
  );

  const { data, error } = useSWR(["user/tabs"]);

  return (
    <Animated.View style={containerStyle as any}>
      <Animated.View style={tabStripStyle}>
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
          <CreateDrawer>
            <IconButton variant="filled" size={45}>
              <Icon size={34}>add</Icon>
            </IconButton>
          </CreateDrawer>
          <TouchableOpacity
            onPress={() => snapToIndex(1)}
            style={{
              padding: 30,
              marginRight: -30,
            }}
          >
            <Icon size={28}>stack</Icon>
          </TouchableOpacity>
        </View>
      </Animated.View>
      <Animated.View style={tabListStyle}>
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
          <Spinner />
        )}
      </Animated.View>
    </Animated.View>
  );
}

export const BottomAppBar = memo(function BottomAppBar() {
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const isKeyboardVisible = useKeyboardVisibility();
  const shouldHide =
    ["/account", "/tabs", "/open", "/space", "/friends"].includes(pathname) ||
    isKeyboardVisible;

  const theme = useColorTheme();

  const ref = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (shouldHide) {
      ref.current.close();
    } else {
      ref.current?.present();
    }
  }, [shouldHide]);

  return width < 600 ? (
    <BottomSheetModalProvider>
      <BottomSheet
        snapPoints={[pathname === "/" ? 65 : 65 * 2, "70%"]}
        sheetRef={ref}
        animateOnMount={false}
        appearsOnIndex={1}
        dismissible={false}
        enablePanDownToClose={false}
        onClose={() => null}
        handleComponent={() => null}
        stackBehavior="push"
        keyboardBlurBehavior="none"
        disableBackHandler
        disableEscapeHandler
        backgroundStyle={{
          borderRadius: 25,
          backgroundColor: theme[1],
        }}
        containerStyle={{
          opacity: shouldHide ? 0 : 1,
          pointerEvents: shouldHide ? "none" : undefined,
        }}
        backdropComponent={(d) => (
          <BottomSheetBackdrop pressBehavior="collapse" {...d} />
        )}
      >
        <BottomNavigation />
      </BottomSheet>
    </BottomSheetModalProvider>
  ) : null;
});
