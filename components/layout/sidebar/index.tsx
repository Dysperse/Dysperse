import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import Logo from "@/ui/logo";
import { router, usePathname } from "expo-router";
import React, { useCallback } from "react";
import {
  Linking,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { NavbarProfilePicture } from "../account-navbar";
import { OpenTabsList } from "../bottom-navigation/tabs/carousel";
import { SpacesTrigger } from "./SpacesTrigger";

export const styles = StyleSheet.create({
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
});

export function Sidebar() {
  const theme = useColorTheme();
  const { width, height } = useWindowDimensions();
  const pathname = usePathname();

  const openSupport = useCallback(() => {
    Linking.openURL("https://blog.dysperse.com");
  }, []);

  const handleHome = () => router.push("/");

  return (
    <View
      style={{
        height: "100%",
        width: width > 600 ? 220 : "100%",
        flexDirection: "column",
        maxHeight: width > 600 ? height : undefined,
        backgroundColor: theme[2],
      }}
    >
      <View
        style={{
          padding: 15,
          paddingBottom: 0,
          paddingTop: 20,
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
        <View style={{ flexDirection: "row", gap: 10, marginTop: 20 }}>
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
            <Icon filled={pathname === "/"}>home</Icon>
          </Pressable>
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
        </View>
      </View>
      <OpenTabsList />
      <View
        style={{
          marginTop: "auto",
          padding: 15,
          paddingTop: 0,
        }}
      >
        <View
          style={{
            gap: 10,
            paddingTop: 15,
            alignItems: "center",
            flexDirection: "row",
            borderTopWidth: 1,
            borderTopColor: theme[6],
          }}
        >
          <IconButton
            variant="filled"
            style={{ marginRight: "auto" }}
            onPress={openSupport}
          >
            <Icon>question_mark</Icon>
          </IconButton>
          <NavbarProfilePicture />
        </View>
      </View>
    </View>
  );
}
