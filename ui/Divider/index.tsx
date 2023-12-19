import { View } from "react-native";
import { useColorTheme } from "../color/theme-provider";

export default function Divider() {
  const theme = useColorTheme();
  return (
    <View
      style={{
        height: 2,
        backgroundColor: theme[5],
        borderRadius: 99,
      }}
    />
  );
}
