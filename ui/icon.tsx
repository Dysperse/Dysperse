import { Text } from "react-native";

export default function Icon({ size = 24, children, filled = false }) {
  return (
    <Text
      style={{
        fontFamily: filled ? "symbols_filled" : "symbols_outlined",
        fontSize: size,
      }}
    >
      {children}
    </Text>
  );
}
