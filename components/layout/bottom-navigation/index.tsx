import Icon from "@/ui/Icon";
import NavigationBar from "@/ui/NavigationBar";
import { useColorTheme } from "@/ui/color/theme-provider";
import { router, usePathname } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Keyboard,
  Platform,
  Pressable,
  StatusBar,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CreateDrawer } from "./create-drawer";
import { OpenTabsList } from "./tabs/carousel";
import { TabDrawer } from "./tabs/list";

export const getBottomNavigationHeight = (pathname) =>
  pathname === "/" ? 58 : 58 + 50;

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

export function BottomAppBar() {
  const pathname = usePathname();
  const isKeyboardVisible = useKeyboardVisibility();
  const shouldHide =
    ["/account", "/tabs", "/open", "/space"].includes(pathname) ||
    isKeyboardVisible;
  const insets = useSafeAreaInsets();
  const theme = useColorTheme();

  return shouldHide ? null : (
    <>
      <View
        style={{
          height: getBottomNavigationHeight(pathname),
          backgroundColor: theme[2],
          justifyContent: "center",
          ...(Platform.OS === "web" && ({ userSelect: "none" } as any)),
        }}
      >
        <NavigationBar color={theme[2]} />
        {pathname !== "/" && <OpenTabsList />}
        <View
          style={{
            height: "100%",
            maxHeight: 45,
            paddingTop: Platform.OS === "android" ? 10 : 0,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 25,
            paddingBottom: Math.max(
              Dimensions.get("screen").height -
                Dimensions.get("window").height -
                StatusBar.currentHeight,
              0
            ),
          }}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => router.replace("/")}
          >
            <Icon
              size={30}
              filled={pathname === "/"}
              style={{ color: theme[11] }}
            >
              home
            </Icon>
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: "center" }}>
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
          </View>
          <TabDrawer>
            <TouchableOpacity
              style={{
                flex: 1,
                width: "100%",
                alignItems: "flex-end",
              }}
            >
              <Icon size={30} style={{ color: theme[11] }}>
                grid_view
              </Icon>
            </TouchableOpacity>
          </TabDrawer>
        </View>
      </View>
    </>
  );
}
