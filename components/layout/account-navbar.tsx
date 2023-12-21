import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { Link } from "expo-router";
import React, { useMemo } from "react";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUser } from "../../context/useUser";
import Icon from "../../ui/Icon";
import IconButton from "../../ui/IconButton";
import Text from "../../ui/Text";
import { useColorTheme } from "../../ui/color/theme-provider";
import Logo from "../../ui/logo";
import { addHslAlpha } from "@/ui/color";

export function NavbarProfilePicture() {
  const { session } = useUser();
  return (
    <Link href="/(app)/account">
      <Image
        source={{
          uri: session?.user?.profile?.picture,
        }}
        className="rounded-full"
        style={{ width: 35, height: 35 }}
      />
    </Link>
  );
}

export default function AccountNavbar(props: any) {
  const insets = useSafeAreaInsets();
  const theme = useColorTheme();

  const search = useMemo(
    () => (
      <IconButton style={{ marginRight: 10 }}>
        <Icon size={30}>smart_button</Icon>
      </IconButton>
    ),
    []
  );

  return (
    <View>
      <View
        // intensity={Platform.OS === "ios" ? 50 : 0}
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
      <BlurView
        tint="dark"
        style={{
          height: 2,
          backgroundColor: addHslAlpha(theme[6], 0.5),
          marginBottom: -1.5,
        }}
      />
    </View>
  );
}
