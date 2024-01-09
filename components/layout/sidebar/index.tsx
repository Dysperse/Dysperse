import { useUser } from "@/context/useUser";
import Chip from "@/ui/Chip";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import { useColor } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import Logo from "@/ui/logo";
import { router, usePathname } from "expo-router";
import React, { memo, useCallback } from "react";
import {
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
  useColorScheme,
  useWindowDimensions,
} from "react-native";
import { NavbarProfilePicture } from "../account-navbar";
import OpenTabsList from "../bottom-navigation/tabs/carousel";
import { SpacesTrigger } from "./SpacesTrigger";

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
    gap: 5,
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

  return (
    <Pressable
      onPress={() => router.push("/open")}
      style={({ pressed }) => [
        styles.button,
        {
          flex: 1,
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
            borderTopColor: theme[6],
          },
        ]}
      >
        <IconButton
          variant="outlined"
          size={45}
          style={{ marginRight: "auto" }}
          onPress={openSupport}
        >
          <Icon>question_mark</Icon>
        </IconButton>
        <IconButton variant="outlined" size={45}>
          <Icon>keyboard_double_arrow_left</Icon>
        </IconButton>
      </View>
    </View>
  );
});

const LogoButton = memo(function LogoButton() {
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
      <SpacesTrigger>
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
            paddingLeft: 3,
          }}
        >
          <Logo size={35} color={theme[6]} />
          <Icon style={{ color: theme[6] }}>expand_more</Icon>
        </TouchableOpacity>
      </SpacesTrigger>
      <NavbarProfilePicture />
      {error && (
        <Chip
          style={{ backgroundColor: red[5] }}
          color={red[11]}
          icon={<Icon style={{ color: red[11] }}>cloud_off</Icon>}
          label="Offline"
        />
      )}
    </View>
  );
});

const Header = memo(function Header() {
  const isHome = usePathname() === "/";

  return (
    <View style={{ flexDirection: "row", gap: 10, marginTop: 20 }}>
      <HomeButton isHome={isHome} />
      <JumpToButton />
    </View>
  );
});

export function Sidebar() {
  const pathname = usePathname();
  const theme = useColorTheme();
  const { width, height } = useWindowDimensions();

  return (
    <View
      style={{
        height: "100%",
        width: width > 600 ? 220 : "100%",
        flexDirection: "column",
        maxHeight: width > 600 ? height : undefined,
        backgroundColor: theme[2],
        ...(pathname == "/collections/create" && {
          filter: "brightness(70%)",
        }),
        ...(Platform.OS === "web" &&
          ({
            paddingTop: "env(titlebar-area-height,0)",
          } as any)),
      }}
    >
      <View style={styles.header}>
        <LogoButton />
        <Header />
      </View>
      <OpenTabsList />
      <Footer />
    </View>
  );
}
