import { Image } from "expo-image";
import { Link } from "expo-router";
import React, { useMemo } from "react";
import { Platform, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUser } from "../context/useUser";
import Logo from "./logo";
import Icon from "./Icon";
import Text from "./Text";
import { BlurView } from "expo-blur";

export default function AccountNavbar(props) {
  const insets = useSafeAreaInsets();
  const { session } = useUser();

  const search = useMemo(
    () => (
      <Pressable
        className={`w-9 h-9 rounded-full items-center justify-center active:bg-gray-200 mr-2.5 ${
          props.options.headerRight ? "bg-gray-100 -mr-1 ml-1" : ""
        }`}
      >
        <Icon>search</Icon>
      </Pressable>
    ),
    []
  );

  return (
    <BlurView
      intensity={Platform.OS === "android" ? 0 : 50}
      style={{
        backgroundColor: Platform.OS === "android" ? "#fff" : "transparent",
        height: 64 + insets.top,
        paddingTop: insets.top,
      }}
      className="flex-row px-4 items-center"
    >
      {props.options.headerTitle ? (
        <Text>{props.options.headerTitle}</Text>
      ) : (
        <Logo size={35} color="black" />
      )}
      <View style={{ flexGrow: 1 }} />
      {props.options.headerRight && props.options.headerRight()}
      {search}
      <Link href="/(app)/account" style={{ marginBottom: -10 }}>
        <Image
          source={{
            uri: session?.user?.Profile?.picture,
          }}
          className="rounded-full"
          style={{ width: 35, height: 35 }}
        />
      </Link>
    </BlurView>
  );
}
