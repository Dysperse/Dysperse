import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { ProfilePicture } from "@/ui/Avatar";
import Skeleton from "@/ui/Skeleton";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUser } from "../../context/useUser";
import Text from "../../ui/Text";
import { useColorTheme } from "../../ui/color/theme-provider";
import Logo from "../../ui/logo";

export function NavbarProfilePicture() {
  const { session } = useUser();
  const { width } = useWindowDimensions();
  const breakpoints = useResponsiveBreakpoints();

  return (
    <TouchableOpacity
      onPress={() => router.push("/account")}
      style={{
        zIndex: 999,
        borderWidth: breakpoints.lg ? 0 : 10,
        borderColor: "transparent",
        marginHorizontal: breakpoints.lg ? 0 : -10,
        borderRadius: 999,
      }}
    >
      <Skeleton rounded size={35} isLoading={Boolean(!session?.user)}>
        {session?.user && (
          <ProfilePicture
            name={session.user.profile.name}
            image={session.user.profile.picture}
            size={35}
            style={{
              pointerEvents: "none",
            }}
          />
        )}
      </Skeleton>
    </TouchableOpacity>
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
          <Logo size={35} color={theme[7]} />
        )}
        <View style={{ flexGrow: 1 }} />
        {props.options.headerRight && props.options.headerRight()}
        <NavbarProfilePicture />
      </View>
    </View>
  );
}
