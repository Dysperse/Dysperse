import { Text } from "react-native";
import { Platform } from "react-native";
import { useColorTheme } from "../color/theme-provider";

export default function Icon({
  size = 24,
  children,
  filled = false,
  style = {},
  textClassName = "",
}) {
  const theme = useColorTheme();
  return (
    <Text
      className={textClassName}
      style={{
        color: theme[11],
        fontFamily: filled ? "symbols_filled" : "symbols_outlined",
        fontSize: size,
        width: size,
        height: size,
        lineHeight: size,
        ...(Platform.OS !== "web" && {
          lineHeight: size + 4,
        }),
        ...(Platform.OS === "web" && ({ userSelect: "none" } as any)),
        ...(style && { ...style }),
      }}
    >
      {children}
    </Text>
  );
}
