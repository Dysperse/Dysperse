import { ProfilePicture } from "@/ui/Avatar";
import { addHslAlpha } from "@/ui/color";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  Platform,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUser } from "../../context/useUser";
import Icon from "../../ui/Icon";
import IconButton from "../../ui/IconButton";
import Text from "../../ui/Text";
import { useColorTheme } from "../../ui/color/theme-provider";
import Logo from "../../ui/logo";
import { SpacesTrigger } from "./sidebar";

export function NavbarProfilePicture() {
  const { session } = useUser();
  const { width } = useWindowDimensions();

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
      {session?.user && (
        <ProfilePicture
          name={session.user.profile.name}
          image={session.user.profile.picture}
          size={width > 600 ? 30 : 40}
          style={{
            pointerEvents: "none",
          }}
        />
      )}
    </TouchableOpacity>
  );
}

export default function AccountNavbar(props: any) {
  const insets = useSafeAreaInsets();
  const theme = useColorTheme();

  const search = useMemo(
    () => (
      <IconButton style={{ marginRight: 5 }}>
        <Icon size={30}>electric_bolt</Icon>
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
          backgroundColor: theme[5],
          marginBottom: -1.5,
        }}
      />
    </View>
  );
}
