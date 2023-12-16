import Text from "@/ui/Text";
import { NativeStackHeaderProps } from "@react-navigation/native-stack/lib/typescript/src/types";
import React from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "./Icon";
import { useColorTheme } from "./color/theme-provider";

interface NavbarProps extends NativeStackHeaderProps {
  icon?: "arrow_back_ios_new" | "close" | "expand_more" | "west";
}

export default function Navbar(props: NavbarProps) {
  const insets = useSafeAreaInsets();
  const theme = useColorTheme();
  const handleBack = () => props.navigation.goBack();

  return (
    <View
      style={{
        height: 64 + insets.top,
        paddingTop: insets.top,
        backgroundColor: theme[1],
      }}
      className="flex-row px-4 items-center"
    >
      <Pressable
        onPress={handleBack}
        className="w-10 h-10 active:bg-gray-200 rounded-full flex items-center justify-center"
      >
        <Icon size={30}>{props.icon || "west"}</Icon>
      </Pressable>
      <Text style={{ fontFamily: "body_700" }} textClassName="pl-2">
        {props.options.headerTitle as string}
      </Text>
    </View>
  );
}
