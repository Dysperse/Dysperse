import { Text } from "react-native";

export default function Icon({
  size = 24,
  children,
  filled = false,
  style = {},
}) {
  return (
    <Text
      style={{
        fontFamily: filled ? "symbols_filled" : "symbols_outlined",
        fontSize: size,
        ...(style && style),
      }}
    >
      {children}
    </Text>
  );
}
