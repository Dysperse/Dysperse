import { ProfilePicture } from "@/ui/Avatar";
import Skeleton from "@/ui/Skeleton";
import { router } from "expo-router";
import React from "react";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUser } from "../../context/useUser";
import Text from "../../ui/Text";
import { useColorTheme } from "../../ui/color/theme-provider";
import { LogoButton } from "./sidebar";

export function NavbarProfilePicture() {
  const { session } = useUser();

  return (
    <Skeleton rounded isLoading={Boolean(!session?.user)}>
      {session?.user && (
        <ProfilePicture
          onPress={() => router.push({ pathname: "/settings" })}
          name={session.user.profile.name}
          image={session.user.profile.picture}
          size={35}
          style={({ pressed }) => ({
            transform: [{ scale: pressed ? 0.9 : 1 }],
          })}
        />
      )}
    </Skeleton>
  );
}

export default function AccountNavbar(props: any) {
  const insets = useSafeAreaInsets();
  const theme = useColorTheme();

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
          <LogoButton toggleHidden={() => {}} isHidden={false} />
        )}
        <View style={{ flexGrow: 1 }} />
        {props.options.headerRight && props.options.headerRight()}
        <NavbarProfilePicture />
      </View>
    </View>
  );
}
