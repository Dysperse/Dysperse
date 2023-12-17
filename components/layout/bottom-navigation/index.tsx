import Icon from "@/ui/Icon";
import * as NavigationBar from "expo-navigation-bar";
import { router, usePathname } from "expo-router";
import React, { useEffect } from "react";
import { Platform, Pressable, View } from "react-native";
import { CreateDrawer } from "./create-drawer";
import { OpenTabsList } from "./tabs/carousel";
import { TabDrawer } from "./tabs/list";
import { useColorTheme } from "@/ui/color/theme-provider";
import { addHslAlpha } from "@/ui/color";

export const getBottomNavigationHeight = (pathname) =>
  pathname === "/" ? 57 : 57 + 50;

export function BottomAppBar() {
  const pathname = usePathname();
  const shouldHide = ["/account", "/tabs", "/open"].includes(pathname);
  const theme = useColorTheme();

  useEffect(() => {
    if (Platform.OS === "android") {
      const color = shouldHide ? "#fff" : theme[1];
      NavigationBar.setBackgroundColorAsync(color);
      NavigationBar.setBorderColorAsync(color);
      NavigationBar.setButtonStyleAsync("dark");
    }
  }, [Platform.OS, shouldHide]);

  return shouldHide ? null : (
    <View
      style={{
        height: getBottomNavigationHeight(pathname),
        backgroundColor: theme[1],
        ...(Platform.OS === "web" && ({ userSelect: "none" } as any)),
      }}
    >
      <View
        style={{
          height: 1.5,
          backgroundColor: addHslAlpha(theme[6], 0.5),
          marginTop: -1.5,
        }}
      />
      {pathname !== "/" && <OpenTabsList />}
      <View
        style={{ height: 55, paddingTop: 2 }}
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
