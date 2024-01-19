import { useUser } from "@/context/useUser";
import { useKeyboardShortcut } from "@/helpers/useKeyboardShortcut";
import Chip from "@/ui/Chip";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import MenuPopover from "@/ui/MenuPopover";
import Text from "@/ui/Text";
import { useColor } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import Logo from "@/ui/logo";
import { router, usePathname } from "expo-router";
import React, { memo, useCallback, useEffect, useState } from "react";
import {
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  View,
  useColorScheme,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import OpenTabsList from "../bottom-navigation/tabs/carousel";

export const styles = StyleSheet.create({
  header: {
    padding: 15,
    paddingBottom: 0,
    paddingTop: 20,
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
  const handleHome = () => router.push("/");
  const theme = useColorTheme();
  useKeyboardShortcut(["ctrl+0"], () => router.push("/"));

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

  useKeyboardShortcut(["ctrl+k", "ctrl+/", "ctrl+o"], () =>
    router.push("/open")
  );

  return (
    <Pressable
      onPress={() => router.push("/open")}
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

const Footer = memo(function Footer() {
  const theme = useColorTheme();
  const openSupport = useCallback(() => {
    Linking.openURL("https://blog.dysperse.com");
  }, []);

  return (
    <View style={styles.footerContainer}>
      <View
        style={[
          styles.footer,
          {
            borderTopColor: theme[5],
          },
        ]}
      >
        <IconButton
          size={35}
          variant="outlined"
          icon="vertical_split"
          style={{ marginLeft: "auto" }}
        />
      </View>
    </View>
  );
});

const LogoButton = memo(function LogoButton({
  toggleHidden,
  isHidden,
}: {
  toggleHidden: (v) => void;
  isHidden: boolean;
}) {
  const theme = useColorTheme();
  const { error } = useUser();
  const red = useColor("red", useColorScheme() === "dark");
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
        containerStyle={{ width: 135, marginLeft: 10, marginTop: 5 }}
        trigger={
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              paddingLeft: 3,
            }}
          >
            <Logo size={35} color={theme[8]} />
            <Icon style={{ color: theme[8] }}>expand_more</Icon>
          </View>
        }
        options={[
          {
            icon: "communities",
            text: "Space",
            callback: () => router.push("/space"),
          },
          {
            icon: "settings",
            text: "Settings",
            callback: () => router.push("/settings"),
          },
          {
            icon: "question_mark",
            text: "Help",
            callback: () => router.push("/space"),
          },
        ]}
      />
      {error && (
        <Chip
          style={{ backgroundColor: red[5], marginRight: -10 }}
          color={red[11]}
          icon={<Icon style={{ color: red[11] }}>cloud_off</Icon>}
        />
      )}
      <MenuPopover
        menuProps={{
          rendererProps: {
            placement: "right",
            anchorStyle: { opacity: 0 },
          },
        }}
        containerStyle={{ marginTop: 10 }}
        trigger={
          <IconButton
            disabled
            size={40}
            onPress={toggleHidden}
            icon="dock_to_right"
            style={{ opacity: 0.9 }}
          />
        }
        options={[
          {
            icon: "dock_to_right",
            text: "Sidebar",
            callback: toggleHidden,
            selected: !isHidden,
          },
          { icon: "dock_to_left", text: "Focus panel" },
        ]}
      />
    </View>
  );
});

const QuickCreateButton = memo(function QuickCreateButton() {
  const theme = useColorTheme();
  return (
    <Pressable
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
      <Icon>note_stack_add</Icon>
      <Text style={{ color: theme[11] }}>New</Text>
    </Pressable>
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

export function Sidebar() {
  const pathname = usePathname();
  const theme = useColorTheme();

  const [isHidden, setIsHidden] = useState(
    Platform.OS === "web"
      ? localStorage.getItem("sidebarHidden") === "true"
      : false
  );
  const toggleHidden = useCallback(() => setIsHidden((prev) => !prev), []);

  useKeyboardShortcut(["ctrl+,"], () => router.push("/settings"));
  useKeyboardShortcut(["`"], toggleHidden);

  const marginLeft = useSharedValue(0);
  const translateX = useSharedValue(0);

  useEffect(() => {
    if (isHidden) {
      marginLeft.value = withSpring(-170, { damping: 30, stiffness: 400 });
      translateX.value = withSpring(-40, { damping: 30, stiffness: 400 });
      if (Platform.OS === "web") localStorage.setItem("sidebarHidden", "true");
    } else {
      marginLeft.value = withSpring(0, { damping: 30, stiffness: 400 });
      translateX.value = withSpring(0, { damping: 30, stiffness: 400 });
      if (Platform.OS === "web") localStorage.setItem("sidebarHidden", "false");
    }
  }, [isHidden, marginLeft, translateX]);

  const marginLeftStyle = useAnimatedStyle(() => ({
    marginLeft: marginLeft.value,
    transform: [{ translateX: translateX.value }],
    pointerEvents: isHidden ? "none" : "auto",
  }));

  const hiddenSidebarStyles = useAnimatedStyle(() => ({
    opacity: withSpring(isHidden ? 1 : 0),
    position: "absolute",
    top: 20,
    left: 12,
    zIndex: 1,
  }));

  return (
    <>
      <Animated.View
        style={[
          marginLeftStyle,
          {
            height: "100%",
            width: 220,
            flexDirection: "column",
            maxHeight: "100%",
            backgroundColor: theme[2],
            ...((pathname === "/open" || pathname.includes("space")) && {
              filter: "brightness(70%)",
              transition: "all .3s",
              transitionDelay: ".1s",
              pointerEvents: "none",
            }),
            ...(Platform.OS === "web" &&
              ({
                paddingTop: "env(titlebar-area-height,0)",
              } as any)),
          },
        ]}
      >
        <View style={styles.header}>
          <LogoButton toggleHidden={toggleHidden} isHidden={isHidden} />
          <Header />
        </View>
        <OpenTabsList />
      </Animated.View>
      {isHidden && (
        <Animated.View style={hiddenSidebarStyles}>
          <IconButton
            style={{
              ...(Platform.OS === "web" &&
                ({ marginTop: "env(titlebar-area-height,0)" } as any)),
            }}
            onPress={toggleHidden}
            icon="dock_to_right"
          />
        </Animated.View>
      )}
    </>
  );
}
