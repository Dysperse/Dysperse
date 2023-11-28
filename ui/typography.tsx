import { Text } from "react-native";

export function Typography(props) {
  const variant = props.variant;
  return (
    <Text
      {...props}
      style={{
        fontSize: variant == "h1" ? 50 : 20,
      }}
    />
  );
}
