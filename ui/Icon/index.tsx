import React, { memo } from "react";
import { Platform, StyleProp, Text, TextStyle } from "react-native";
import { useColorTheme } from "../color/theme-provider";

export interface DIconProps {
  size?: number;
  children?: React.ReactNode;
  filled?: boolean;
  style?: StyleProp<TextStyle>;
  bold?: boolean;
}

function Icon({
  size = 24,
  children,
  filled = false,
  style = {},
  bold = false,
}: DIconProps) {
  const theme = useColorTheme();
  return (
    <Text
      allowFontScaling={false}
      maxFontSizeMultiplier={1}
      style={[
        {
          overflow: "visible",
          maxWidth: size + 3,
          color: theme[11],
          fontFamily: bold
            ? "symbols_bold_outlined"
            : filled
            ? "symbols_filled"
            : "symbols_outlined",
          fontSize: size,
          width: size,
          height: size,
          // textAlign: "center",
          lineHeight: size + 3,
          // backgroundColor: "red",
          ...(Platform.OS === "web" &&
            ({ userSelect: "none", whiteSpace: "nowrap" } as any)),
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export default memo(Icon);
