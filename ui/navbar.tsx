import Text from "@/ui/Text";
import { NativeStackHeaderProps } from "@react-navigation/native-stack/lib/typescript/src/types";
import { StackHeaderProps, StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import { View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "./Icon";
import IconButton from "./IconButton";
import { useColorTheme } from "./color/theme-provider";
import { addHslAlpha } from "./color";
import { router } from "expo-router";

interface NavbarProps extends StackHeaderProps {
  icon?: "arrow_back_ios_new" | "close" | "expand_more" | "west";
}

export default function Navbar(props: any) {
  const insets = useSafeAreaInsets();
  const theme = useColorTheme();
  const { width } = useWindowDimensions();
  const handleBack = () => {
    try {
      if (!router.canGoBack()) throw new Error("Can't go back");
      router.back();
    } catch {
      router.replace("/");
    }
  };

  return (
    <>
      <View
        style={{
          height: 64 + insets.top,
          paddingTop: insets.top,
          backgroundColor: theme[width > 600 ? 2 : 1],
          flexDirection: "row",
          paddingHorizontal: 10,
          alignItems: "center",
        }}
      >
        <IconButton onPress={handleBack} style={{ width: 45, height: 45 }}>
          <Icon>{props.icon || "west"}</Icon>
        </IconButton>
        <Text style={{ fontFamily: "body_700", paddingLeft: 5 }}>
          {props.options.headerTitle as string}
        </Text>
      </View>
      <View
        style={{
          height: 1.5,
          opacity: props.options.headerTitle ? 1 : 0,
          backgroundColor: theme[5],
        }}
      />
    </>
  );
}
