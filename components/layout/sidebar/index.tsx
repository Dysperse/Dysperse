import { useCommandPaletteContext } from "@/components/command-palette/context";
import { CreateLabelModal } from "@/components/labels/createModal";
import { useSidebarContext } from "@/components/layout/sidebar/context";
import CreateTask from "@/components/task/create";
import { useUser } from "@/context/useUser";
import { useHotkeys } from "@/helpers/useHotKeys";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import Icon from "@/ui/Icon";
import MenuPopover, { MenuItem } from "@/ui/MenuPopover";
import Text from "@/ui/Text";
import { useColor } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import Logo from "@/ui/logo";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router, usePathname } from "expo-router";
import React, { memo, useCallback, useEffect, useRef } from "react";
import {
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  View,
  useColorScheme,
  useWindowDimensions,
} from "react-native";
import { useDrawerProgress } from "react-native-drawer-layout";
import Animated, {
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { mutate } from "swr";
import OpenTabsList from "../tabs/carousel";

export const styles = StyleSheet.create({
  header: {
    padding: 15,
    paddingBottom: 0,
    paddingTop: 25,
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    gap: 7,
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  footerContainer: {
    marginTop: "auto",
    padding: 15,
    paddingTop: 0,
  },
  footer: {
    gap: 10,
    paddingTop: 15,
    alignItems: "center",
    flexDirection: "row",
    borderTopWidth: 1,
  },
});

const HomeButton = memo(function HomeButton({ isHome }: { isHome: boolean }) {
  const { closeSidebarOnMobile } = useSidebarContext();

  const handleHome = useCallback(() => {
    router.push("/");
    setTimeout(closeSidebarOnMobile, 100);
  }, [closeSidebarOnMobile]);

  const theme = useColorTheme();
  useHotkeys("ctrl+0", () => router.push("/"));

  return (
    <Pressable
      onPress={handleHome}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: theme[isHome ? 3 : 1],
          opacity: pressed ? 0.5 : 1,
        },
      ]}
    >
      <Icon filled={isHome}>home</Icon>
    </Pressable>
  );
});

export const LogoButton = memo(function LogoButton() {
  const theme = useColorTheme();
  const { error } = useUser();
  const breakpoints = useResponsiveBreakpoints();
  const red = useColor("red", useColorScheme() === "dark");
  const openSupport = useCallback(() => {
    Linking.openURL("https://blog.dysperse.com");
  }, []);
  const openFeedback = useCallback(() => {
    Linking.openURL("https://feedback.dysperse.com");
  }, []);

  const { closeSidebarOnMobile, isOpen, openSidebar, closeSidebar } =
    useSidebarContext();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <MenuPopover
        menuProps={{
          rendererProps: {
            placement: "bottom",
            anchorStyle: { opacity: 0 },
          },
        }}
        containerStyle={{ width: 160, marginLeft: 10, marginTop: 5 }}
        trigger={
          <Pressable
            onLongPress={openSupport}
            style={({ pressed }) => ({
              opacity: pressed ? 0.5 : 1,
              flexDirection: "row",
              alignItems: "center",
              paddingLeft: 3,
            })}
          >
            <Logo size={40} />
            <Icon style={{ color: theme[11] }}>expand_more</Icon>
          </Pressable>
        }
        options={[
          {
            icon: "settings",
            text: "Settings",
            callback: () => {
              router.push("/settings");
              setTimeout(closeSidebarOnMobile, 300);
            },
          },
          {
            icon: "question_mark",
            text: "Help",
            callback: openSupport,
          },
          {
            icon: "feedback",
            text: "Feedback",
            callback: openFeedback,
          },
          {
            icon: "brand_awareness",
            text: "What's new",
            callback: openFeedback,
          },
        ]}
      />
      {error && <Icon style={{ color: red[11] }}>cloud_off</Icon>}
    </View>
  );
});

const QuickCreateButton = memo(function QuickCreateButton() {
  const theme = useColorTheme();
  const itemRef = useRef<BottomSheetModal>(null);
  const { closeSidebar } = useSidebarContext();

  useHotkeys(["ctrl+n", "shift+n"], (e) => {
    e.preventDefault();
    itemRef.current?.present();
  });

  return (
    <>
      <MenuPopover
        options={[
          {
            icon: "add_circle",
            text: "Item",
            callback: () => itemRef.current?.present(),
          },
          {
            renderer: () => (
              <CreateLabelModal mutate={() => mutate(() => true)}>
                <MenuItem>
                  <Icon>label</Icon>
                  <Text variant="menuItem">Label</Text>
                </MenuItem>
              </CreateLabelModal>
            ),
          },
          {
            icon: "layers",
            text: "Collection",
            callback: () => {
              router.push("/collections/create");
              closeSidebar();
            },
          },
        ]}
        menuProps={{
          style: { flex: 1, marginRight: -10 },
          rendererProps: { containerStyle: { marginLeft: 10, width: 200 } },
        }}
        trigger={
          <Pressable
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor: theme[1],
                opacity: pressed ? 0.5 : 1,
                flex: 1,
                minHeight: 45,
              },
            ]}
          >
            <Icon>note_stack_add</Icon>
            <Text style={{ color: theme[11] }}>New</Text>
          </Pressable>
        }
      />
      <CreateTask mutate={() => mutate(() => true)} sheetRef={itemRef} />
    </>
  );
});

const CreateTabButton = memo(function CreateTabButton() {
  const theme = useColorTheme();

  const { handleOpen } = useCommandPaletteContext();
  useHotkeys(["ctrl+k", "ctrl+o"], (e) => {
    e.preventDefault();
    handleOpen();
  });

  useHotkeys(["ctrl+/"], (e) => {
    e.preventDefault();
    router.push("/shortcuts");
  });

  return (
    <Pressable
      onPress={handleOpen}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: theme[1],
          opacity: pressed ? 0.5 : 1,
          marginBottom: 10,
        },
      ]}
    >
      <Icon>electric_bolt</Icon>
      <Text style={{ color: theme[11] }}>Jump to</Text>
    </Pressable>
  );
});

const Header = memo(function Header() {
  const isHome = usePathname() === "/";

  return (
    <View
      style={{
        flexDirection: "row",
        gap: 10,
        marginTop: 20,
        marginBottom: 10,
      }}
    >
      <HomeButton isHome={isHome} />
      <QuickCreateButton />
    </View>
  );
});

const Sidebar = () => {
  const insets = useSafeAreaInsets();
  const { SIDEBAR_WIDTH, desktopCollapsed, setDesktopCollapsed } =
    useSidebarContext();
  const theme = useColorTheme();
  const { width, height } = useWindowDimensions();
  const progress = useDrawerProgress();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: breakpoints?.md
      ? []
      : [
          {
            translateX: interpolate(progress.value, [0, 1], [-(width / 10), 0]),
          },
        ],
  }));

  const toggleHidden = useCallback(() => {
    if (Platform.OS === "web") {
      setDesktopCollapsed((prev) => {
        localStorage.setItem("desktopCollapsed", (!prev).toString());
        return !prev;
      });
    }
  }, [setDesktopCollapsed]);

  useHotkeys("`", toggleHidden, {});
  useHotkeys("ctrl+comma", () => {
    if (pathname.includes("settings")) return;
    router.push("/settings");
  });

  const breakpoints = useResponsiveBreakpoints();

  const pathname = usePathname();

  useEffect(() => {
    if (Platform.OS === "web") {
      if (localStorage.getItem("desktopCollapsed") === "true")
        setDesktopCollapsed(true);
    }
  }, [setDesktopCollapsed]);

  return (
    <View
      style={[
        {
          zIndex: breakpoints.md ? 1 : 0,
          flexDirection: "row",
          backgroundColor: theme[2],
        },
        pathname.includes("settings") &&
          breakpoints.md && {
            maxWidth: 0,
            overflow: "hidden",
          },
        desktopCollapsed &&
          breakpoints.md && {
            backgroundColor: "transparent",
          },
      ]}
    >
      <Animated.View
        style={[
          animatedStyle,
          {
            height: height,
            width: SIDEBAR_WIDTH,
            flexDirection: "column",
            maxHeight: "100%",
            backgroundColor: theme[2],
            borderRightWidth: 2,
            borderColor: "transparent",
            ...(Platform.OS === "web" &&
              ({
                paddingTop: "env(titlebar-area-height,0)",
              } as any)),
          },
          desktopCollapsed &&
            breakpoints.md && {
              shadowColor: theme[1],
              shadowRadius: 50,
              shadowOffset: { width: 10, height: 0 },
              overflow: "hidden",
              borderColor: theme[5],
            },
        ]}
      >
        <View style={[styles.header, { marginTop: insets.top }]}>
          <LogoButton />
          <Header />
          <CreateTabButton />
        </View>
        <OpenTabsList />
      </Animated.View>
    </View>
  );
};

export default memo(Sidebar);
