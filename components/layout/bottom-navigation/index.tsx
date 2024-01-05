import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { useColorTheme } from "@/ui/color/theme-provider";
import { TouchableOpacity } from "@gorhom/bottom-sheet";
import { router, usePathname } from "expo-router";
import React, { memo } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { OpenTabsList } from "./tabs/carousel";
import { TabDrawer } from "./tabs/drawer";

export const getBottomNavigationHeight = (pathname) => {
  const hidden = ["/settings", "/tabs", "/open", "/space", "/friends"].find(
    (i) => pathname.includes(i)
  );

  return hidden
    ? 0
    : pathname === "/"
    ? // Default
      65
    : // Carousel
      65 * 2;
};

function BottomNavigation() {
  const pathname = usePathname();
  const height = getBottomNavigationHeight(pathname);
  const theme = useColorTheme();
  const { bottom } = useSafeAreaInsets();

  return (
    <View
      style={{
        height,
        width: "100%",
        zIndex: 1,
        backgroundColor: theme[1],
        borderTopColor: theme[5],
        borderTopWidth: 1,
        marginBottom: -1,
        position: "absolute",
        bottom,
        opacity: height === 0 ? 0 : 1,
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
              router.replace("/");
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
            onPress={() => router.push("/open")}
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

export const BottomAppBar = memo(function BottomAppBar() {
  const breakpoints = useResponsiveBreakpoints();
  return breakpoints.lg ? null : <BottomNavigation />;
});
