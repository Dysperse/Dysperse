import { StyleProp, View, ViewStyle } from "react-native";

export default function ModalContent({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[{ padding: 20, paddingTop: 0 }, style]}>{children}</View>
  );
}
