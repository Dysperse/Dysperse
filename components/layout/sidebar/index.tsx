import { useCommandPaletteContext } from "@/components/command-palette/context";
import { useFocusPanelContext } from "@/components/focus-panel/context";
import { PanelSwipeTrigger } from "@/components/focus-panel/panel";
import { CreateLabelModal } from "@/components/labels/createModal";
import { useSidebarContext } from "@/components/layout/sidebar/context";
import CreateTask from "@/components/task/create";
import { useUser } from "@/context/useUser";
import { useHotkeys } from "@/helpers/useHotKeys";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import MenuPopover, { MenuItem } from "@/ui/MenuPopover";
import Text from "@/ui/Text";
import { useColor } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import Logo from "@/ui/logo";
import { BottomSheetModal, TouchableOpacity } from "@gorhom/bottom-sheet";
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
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  useAnimatedStyle,
  withSpring,
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
  const handleHome = () => {
    router.push("/");
    setTimeout(closeSidebarOnMobile, 100);
  };
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
        },
      ]}
    >
      <Icon>electric_bolt</Icon>
      <Text style={{ color: theme[11] }}>Jump to</Text>
    </Pressable>
  );
});

export const LogoButton = memo(function LogoButton({
  toggleHidden,
  isHidden,
}: {
  toggleHidden: (v) => void;
  isHidden: boolean;
}) {
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
  const { closeSidebarOnMobile } = useSidebarContext();

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
          <Pressable>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingLeft: 3,
              }}
            >
              <Logo size={40} />
              <Icon style={{ color: theme[8] }}>expand_more</Icon>
            </TouchableOpacity>
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
            callback: toggleHidden,
            selected: !isHidden,
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
        <QuickCreateButton />
      </View>
      <JumpToButton />
    </View>
  );
});

export function Sidebar({ panGestureDesktop }) {
  const insets = useSafeAreaInsets();
  const { sidebarMargin, SIDEBAR_WIDTH } = useSidebarContext();
  const theme = useColorTheme();
  const { width } = useWindowDimensions();

  const [isHidden, setIsHidden] = useState(
    Platform.OS === "web"
      ? localStorage.getItem("sidebarHidden") === "true"
      : false
  );
  const toggleHidden = useCallback(() => {
    setIsHidden((prev) => !prev);
  }, [setIsHidden]);

  useEffect(() => {
    sidebarMargin.value = isHidden ? -SIDEBAR_WIDTH : 0;
  }, [isHidden, sidebarMargin, SIDEBAR_WIDTH]);

  useHotkeys("`", toggleHidden, {}, [isHidden]);
  useHotkeys("ctrl+comma", () => router.push("/settings"));

  const breakpoints = useResponsiveBreakpoints();
  const marginLeftStyle = useAnimatedStyle(() => ({
    marginLeft: withSpring(sidebarMargin.value, {
      damping: 30,
      stiffness: 400,
    }),
    pointerEvents: sidebarMargin.value === -SIDEBAR_WIDTH ? "none" : "auto",
  }));

  const transformLeftStyle = useAnimatedStyle(() => ({
    transformOrigin: "right",
    transform: [
      // {
      //   translateX: withSpring(
      //     interpolate(sidebarMargin.value, [0, -220], [0, -width * 0.05]),
      //     {
      //       damping: 30,
      //       stiffness: 400,
      //     }
      //   ),
      // },
      {
        scale: withSpring(
          interpolate(sidebarMargin.value, [-220, 0], [1.05, 1]),
          {
            damping: 30,
            stiffness: 400,
            overshootClamping: true,
          }
        ),
      },
    ],
    opacity: withSpring(interpolate(sidebarMargin.value, [0, -220], [1, 0.5]), {
      damping: 30,
      stiffness: 400,
    }),
    pointerEvents: isHidden ? "none" : "auto",
  }));

  const tap = Gesture.Tap().onEnd(() => {
    toggleHidden();
  });

  const closePressableStyle = useAnimatedStyle(() => ({
    display: !sidebarMargin.value ? "flex" : "none",
  }));

  const pathname = usePathname();

  const children = (
    <View
      style={[
        { zIndex: breakpoints.md ? 1 : 0, flexDirection: "row" },
        pathname.includes("settings") &&
          breakpoints.md && {
            maxWidth: 0,
            overflow: "hidden",
          },
      ]}
    >
      <Animated.View
        style={[
          breakpoints.md && marginLeftStyle,
          !breakpoints.md && transformLeftStyle,
          {
            height: "100%",
            width: SIDEBAR_WIDTH,
            flexDirection: "column",
            maxHeight: "100%",
            backgroundColor: theme[2],
            ...(Platform.OS === "web" &&
              ({
                paddingTop: "env(titlebar-area-height,0)",
              } as any)),
          },
        ]}
      >
        <View style={[styles.header, { marginTop: insets.top }]}>
          <LogoButton toggleHidden={toggleHidden} isHidden={isHidden} />
          <Header />
        </View>
        <OpenTabsList />
      </Animated.View>
      {breakpoints.md && (
        <GestureDetector gesture={tap}>
          <PanelSwipeTrigger side="left" />
        </GestureDetector>
      )}
    </View>
  );

  return (
    <>
      {!breakpoints.md && (
        <Animated.View
          style={[
            closePressableStyle,
            {
              position: "absolute",
              top: 0,
              right: 0,
              width: width - SIDEBAR_WIDTH,
              height: "100%",
              zIndex: 99,
            },
          ]}
        >
          <Pressable onPress={toggleHidden} style={{ flex: 1 }} />
        </Animated.View>
      )}

      {breakpoints.md ? (
        <GestureDetector gesture={panGestureDesktop}>
          {children}
        </GestureDetector>
      ) : (
        children
      )}
    </>
  );
}
