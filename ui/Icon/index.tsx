import { StyleProp, Text, TextStyle } from "react-native";
import { Platform } from "react-native";
import { useColorTheme } from "../color/theme-provider";
import React from "react";

export default function Icon({
  size = 24,
  children,
  filled = false,
  style = {},
  textClassName = "",
  bold = false,
}: {
  size?: number;
  children?: React.ReactNode;
  filled?: boolean;
  style?: StyleProp<TextStyle>;
  textClassName?: string;
  bold?: boolean;
}) {
  const theme = useColorTheme();
  return (
    <Text
      className={textClassName}
      style={{
        color: theme[11],
        fontFamily: bold
          ? "symbols_bold_outlined"
          : filled
          ? "symbols_filled"
          : "symbols_outlined",
        fontSize: size,
        width: size,
        height: size,
        lineHeight: size,
        ...(Platform.OS !== "web" && {
          lineHeight: size + 4,
        }),
        ...(Platform.OS === "web" && ({ userSelect: "none" } as any)),
        ...(style && { ...(style as any) }),
      }}
    >
      {children}
    </Text>
  );
}
