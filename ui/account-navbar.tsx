import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { Link } from "expo-router";
import React, { useMemo } from "react";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUser } from "../context/useUser";
import Icon from "./Icon";
import IconButton from "./IconButton";
import Text from "./Text";
import { useColorTheme } from "./color/theme-provider";
import Logo from "./logo";

export function NavbarProfilePicture() {
  const { session } = useUser();
  return (
    <Link
      href="/(app)/account"
      style={{ marginBottom: Platform.OS === "android" ? -10 : 0 }}
    >
      <Image
        source={{
          uri: session?.user?.Profile?.picture,
        }}
        className="rounded-full"
        style={{ width: 35, height: 35 }}
      />
    </Link>
  );
}

export default function AccountNavbar(props) {
  const insets = useSafeAreaInsets();
  const theme = useColorTheme();
  const { session } = useUser();

  const search = useMemo(
    () => (
      <IconButton>
        <Icon size={30}>bolt</Icon>
      </IconButton>
    ),
    []
  );

  return (
    <BlurView
      intensity={Platform.OS === "android" ? 0 : 50}
      style={{
        backgroundColor: Platform.OS === "android" ? theme[1] : "transparent",
        height: 64 + insets.top,
        paddingTop: insets.top,
        gap: 10,
      }}
      className="flex-row px-4 items-center"
    >
      {props.options.headerTitle ? (
        <Text>{props.options.headerTitle}</Text>
      ) : (
        <Logo size={35} color={theme[8]} />
      )}
      <View style={{ flexGrow: 1 }} />
      {props.options.headerRight && props.options.headerRight()}
      {search}
      <NavbarProfilePicture />
    </BlurView>
  );
}
