import { useCommandPaletteContext } from "@/components/command-palette/context";
import { useFocusPanelContext } from "@/components/focus-panel/context";
import { CreateLabelModal } from "@/components/labels/createModal";
import { useSidebarContext } from "@/components/layout/sidebar/context";
import CreateTask from "@/components/task/create";
import { useSession } from "@/context/AuthProvider";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useHotkeys } from "@/helpers/useHotKeys";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import MenuPopover, { MenuItem } from "@/ui/MenuPopover";
import Text from "@/ui/Text";
import { useColor } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import Logo from "@/ui/logo";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import { router, usePathname } from "expo-router";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
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
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
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
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
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
          borderColor: theme[5],
          backgroundColor: theme[1],
          opacity: pressed ? 0.5 : 1,
        },
      ]}
    >
      <Icon filled={isHome}>home</Icon>
    </Pressable>
  );
});

const SyncButton = memo(function SyncButton() {
  const theme = useColorTheme();
  const { session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const { width: windowWidth } = useWindowDimensions();

  const barWidth = useSharedValue(0);
  const opacity = useSharedValue(0);

  const width = useAnimatedStyle(() => ({
    width: barWidth.value,
    opacity: withSpring(opacity.value),
  }));

  const handleSync = useCallback(async () => {
    setIsLoading(true);
    opacity.value = 1;
    barWidth.value = withSpring(windowWidth - 20, {
      stiffness: 50,
      damping: 9000,
      mass: 200,
    });
    try {
      await sendApiRequest(session, "GET", "space/integrations/sync", {});
      Toast.show({ type: "success", text1: "Integrations are up to date!" });
      if (Platform.OS === "web") {
        localStorage.setItem("lastSyncedTimestamp", Date.now().toString());
      }
    } catch (e) {
      Toast.show({ type: "error" });
    } finally {
      barWidth.value = withSpring(windowWidth, { overshootClamping: true });
      setTimeout(() => {
        opacity.value = 0;
      }, 500);
      setTimeout(() => {
        barWidth.value = 0;
      }, 1000);
      setIsLoading(false);
    }
  }, [barWidth, windowWidth, opacity, session]);

  useEffect(() => {
    if (Platform.OS === "web") {
      const lastSynced = localStorage.getItem("lastSyncedTimestamp");
      const diff = Date.now() - parseInt(lastSynced);
      if (diff > 1000 * 60 * 60 || !lastSynced) {
        handleSync();
      }
    }
  }, [handleSync]);

  return (
    <>
      <Portal>
        <Animated.View
          style={[
            width,
            {
              position: "absolute",
              top: 0,
              left: 0,
              height: 2,
              backgroundColor: theme[11],
              shadowColor: theme[11],
              shadowRadius: 10,
            },
          ]}
        />
      </Portal>
      <Pressable
        onPress={handleSync}
        disabled={isLoading}
        style={({ pressed }) => [
          styles.button,
          {
            borderColor: theme[5],
            backgroundColor: theme[1],
            opacity: isLoading ? 0.4 : pressed ? 0.5 : 1,
          },
        ]}
      >
        <Icon>sync</Icon>
      </Pressable>
    </>
  );
});
const JumpToButton = memo(function JumpToButton() {
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
          borderColor: theme[5],
          backgroundColor: theme[1],
          opacity: pressed ? 0.5 : 1,
          flex: 1,
        },
      ]}
    >
      <Icon>electric_bolt</Icon>
      <Text style={{ color: theme[11] }}>Find</Text>
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

  const { isFocused, setFocus } = useFocusPanelContext();
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
            <Icon style={{ color: theme[8] }}>expand_more</Icon>
          </Pressable>
        }
        options={[
          {
            icon: "delete",
            text: "Trash",
            callback: () => {
              router.push("/trash");
              setTimeout(closeSidebarOnMobile, 300);
            },
          },
          { divider: true, key: "1" },
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
      <MenuPopover
        menuProps={{
          rendererProps: {
            placement: breakpoints.md ? "right" : "bottom",
            anchorStyle: { opacity: 0 },
          },
        }}
        containerStyle={{ marginTop: 10, width: 200 }}
        trigger={
          <IconButton size={40} icon="dock_to_right" style={{ opacity: 0.9 }} />
        }
        options={[
          breakpoints.md && {
            icon: "dock_to_right",
            text: "Sidebar",
            callback: isOpen ? closeSidebar : openSidebar,
            selected: isOpen,
          },
          {
            icon: "dock_to_left",
            text: "Focus panel",
            selected: isFocused,
            callback: () => setFocus(!isFocused),
          },
        ]}
      />
    </View>
  );
});

const QuickCreateButton = memo(function QuickCreateButton() {
  const theme = useColorTheme();
  const itemRef = useRef<BottomSheetModal>(null);

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
            callback: () => router.push("/collections/create"),
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
                borderColor: theme[5],
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

const Header = memo(function Header() {
  const isHome = usePathname() === "/";

  return (
    <View
      style={{
        marginTop: 20,
        marginBottom: 10,
        gap: 10,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          gap: 10,
        }}
      >
        <HomeButton isHome={isHome} />
        <JumpToButton />
      </View>
      <View
        style={{
          flexDirection: "row",
          gap: 10,
        }}
      >
        <QuickCreateButton />
        <SyncButton />
      </View>
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
              borderRightWidth: 2,
              borderColor: theme[5],
            },
        ]}
      >
        <View style={[styles.header, { marginTop: insets.top }]}>
          <LogoButton />
          <Header />
        </View>
        <OpenTabsList />
      </Animated.View>
    </View>
  );
};

export default memo(Sidebar);
