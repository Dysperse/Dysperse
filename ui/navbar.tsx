import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import Text from "@/ui/Text";
import { router } from "expo-router";
import React from "react";
import { View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "./Icon";
import IconButton from "./IconButton";
import { useColorTheme } from "./color/theme-provider";

export default function Navbar(props: any) {
  const insets = useSafeAreaInsets();
  const theme = useColorTheme();
  const { width } = useWindowDimensions();
  const breakpoints = useResponsiveBreakpoints();

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
          height: 75 + insets.top,
          paddingTop: insets.top,
          paddingHorizontal: 10,
          backgroundColor: theme[1],
          ...(breakpoints.md && {
            borderRadius: 20,
            margin: 1,
            height: 80,
          }),
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <IconButton
          size={55}
          onPress={handleBack}
          variant={width > 600 ? "filled" : "text"}
          style={{ borderWidth: 1, borderColor: theme[5] }}
        >
          <Icon>{props.icon || "west"}</Icon>
        </IconButton>
        <Text
          weight={300}
          style={{
            textAlign: "center",
            flex: 1,
            paddingRight: 55,
          }}
        >
          {props.options.headerTitle as string}
        </Text>
      </View>
    </>
  );
}
