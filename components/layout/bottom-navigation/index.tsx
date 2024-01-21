import { useCommandPaletteContext } from "@/components/command-palette/context";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { useColorTheme } from "@/ui/color/theme-provider";
import { TouchableOpacity } from "@gorhom/bottom-sheet";
import { router, usePathname } from "expo-router";
import React, { memo, useEffect } from "react";
import { View } from "react-native";
import Animated, { useSharedValue, withSpring } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import OpenTabsList from "./tabs/carousel";
import { TabDrawer } from "./tabs/drawer";

export const getBottomNavigationHeight = (pathname) => {
  const hidden = [
    "/settings",
    "/clock",
    "/tabs",
    "/open",
    "/space",
    "/friends",
    "collections/create",
  ].find((i) => pathname.includes(i));

  return hidden
    ? 0
    : pathname === "/"
    ? // Default
      65
    : // Carousel
      65 * 2;
};

const HomeButton = memo(function HomeButton({ filled }: { filled: boolean }) {
  return (
    <TouchableOpacity
      onPress={() => {
        router.replace("/");
      }}
      style={{ padding: 30, marginLeft: -30 }}
    >
      <Icon size={30} filled={filled}>
        home
      </Icon>
    </TouchableOpacity>
  );
});

const PaletteButton = memo(function PaletteButton() {
  const { handleOpen } = useCommandPaletteContext();

  return (
    <IconButton
      variant="filled"
      style={{ width: 80 }}
      size={45}
      onPress={handleOpen}
    >
      <Icon size={30}>bolt</Icon>
    </IconButton>
  );
});

const TabDrawerButton = memo(function TabDrawerButton() {
  return (
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
  );
});

function BottomNavigation() {
  const pathname = usePathname();
  const height = getBottomNavigationHeight(pathname);
  const theme = useColorTheme();
  const { bottom } = useSafeAreaInsets();

  const animatedHeight = useSharedValue(height);
  const animatedOpacity = useSharedValue(1);

  useEffect(() => {
    animatedHeight.value = withSpring(height, {
      mass: 1,
      damping: 20,
      stiffness: 200,
    });
    animatedOpacity.value = withSpring(height === 0 ? 0 : 1);
  }, [height, animatedHeight, animatedOpacity]);

  return (
    <Animated.View
      style={{
        height: animatedHeight,
        opacity: animatedOpacity,
        width: "100%",
        zIndex: 1,
        backgroundColor: theme[1],
        borderTopColor: theme[5],
        borderTopWidth: 1,
        marginBottom: -1,
        position: "absolute",
        bottom,
      }}
    >
      <View>
        {pathname !== "/" && height !== 0 && <OpenTabsList />}
        <View
          style={{
            height: 65,
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 25,
            flexDirection: "row",
          }}
        >
          <HomeButton filled={pathname === "/"} />
          <PaletteButton />
          <TabDrawerButton />
        </View>
      </View>
    </Animated.View>
  );
}

export const BottomAppBar = memo(function BottomAppBar() {
  const breakpoints = useResponsiveBreakpoints();
  return breakpoints.md ? null : <BottomNavigation />;
});
