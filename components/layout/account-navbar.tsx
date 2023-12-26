import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { Link, router } from "expo-router";
import React, { useMemo } from "react";
import { Platform, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUser } from "../../context/useUser";
import Icon from "../../ui/Icon";
import IconButton from "../../ui/IconButton";
import Text from "../../ui/Text";
import { useColorTheme } from "../../ui/color/theme-provider";
import Logo from "../../ui/logo";
import { addHslAlpha } from "@/ui/color";
import { TouchableOpacity } from "react-native";

export function NavbarProfilePicture() {
  const { session } = useUser();

  return (
    <TouchableOpacity
      onPress={() => router.push("/account")}
      style={{
        zIndex: 999,
        borderWidth: 10,
        borderColor: "transparent",
        marginHorizontal: -10,
        borderRadius: 999,
      }}
    >
      <Image
        source={{
          uri: session?.user?.profile?.picture,
        }}
        className="rounded-full"
        style={{ width: 35, height: 35 }}
      />
    </TouchableOpacity>
  );
}

export default function AccountNavbar(props: any) {
  const insets = useSafeAreaInsets();
  const theme = useColorTheme();

  const search = useMemo(
    () => (
      <IconButton style={{ marginRight: 10 }}>
        <Icon size={30}>&e834;</Icon>
      </IconButton>
    ),
    []
  );

  return (
    <View>
      <View
        style={{
          height: 64 + insets.top,
          paddingTop: insets.top,
          gap: 10,
          flexDirection: "row",
          paddingHorizontal: 20,
          alignItems: "center",
          backgroundColor: Platform.OS === "ios" ? "transparent" : theme[1],
        }}
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
      </View>
      <View
        style={{
          height: 2,
          backgroundColor: addHslAlpha(theme[4], 0.9),
          marginBottom: -1.5,
        }}
      />
    </View>
  );
}
