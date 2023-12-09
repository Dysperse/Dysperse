import { Text } from "react-native";
import { Platform } from "react-native";

export default function Icon({
  size = 24,
  children,
  filled = false,
  style = {},
  textClassName = "",
}) {
  return (
    <Text
      className={textClassName}
      style={{
        fontFamily: filled ? "symbols_filled" : "symbols_outlined",
        fontSize: size,
        width: size,
        height: size,
        lineHeight: size,
        ...(Platform.OS !== "web" && {
          lineHeight: size + 4,
        }),
        ...(style && { ...style }),
      }}
    >
      {children}
    </Text>
  );
}
