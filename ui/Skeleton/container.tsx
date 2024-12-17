import { View } from "react-native";
import { addHslAlpha } from "../color";
import { useColorTheme } from "../color/theme-provider";

export default function SkeletonContainer({ children }) {
  const theme = useColorTheme();
  return (
    <View
      style={{
        backgroundColor: addHslAlpha(theme[9], 0.05),
        gap: 7,
        borderRadius: 20,
        width: "100%",
        padding: 15,
      }}
    >
      {children}
    </View>
  );
}
