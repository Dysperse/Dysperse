import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { ProfilePicture } from "@/ui/Avatar";
import Icon from "@/ui/Icon";
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
import { SpacesTrigger } from "./sidebar/SpacesTrigger";

export function NavbarProfilePicture() {
  const { session } = useUser();
  const { width } = useWindowDimensions();
  const breakpoints = useResponsiveBreakpoints();

  return (
    <Skeleton rounded size={35} isLoading={Boolean(!session?.user)}>
      {session?.user && (
        <ProfilePicture
          onPress={() => router.push("/account")}
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
          <SpacesTrigger>
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
            >
              <Logo size={35} color={theme[7]} />
              <Icon style={{ color: theme[7] }}>expand_more</Icon>
            </TouchableOpacity>
          </SpacesTrigger>
        )}
        <View style={{ flexGrow: 1 }} />
        {props.options.headerRight && props.options.headerRight()}
        <NavbarProfilePicture />
      </View>
    </View>
  );
}
