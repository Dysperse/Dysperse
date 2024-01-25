import { StyleProp, View, ViewStyle } from "react-native";
import { useColorTheme } from "../color/theme-provider";

export default function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  const theme = useColorTheme();
  return (
    <View
      style={[
        {
          height: 2,
          backgroundColor: theme[5],
          borderRadius: 99,
          width: "100%",
          marginHorizontal: "auto",
        },
        style,
      ]}
    />
  );
}
