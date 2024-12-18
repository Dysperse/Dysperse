import { View } from "react-native";
import { addHslAlpha } from "../color";
import { useColorTheme } from "../color/theme-provider";
import { AnimatedLinearGradient } from "./gradient";

export default function CircularSkeleton({ size }) {
  const theme = useColorTheme();

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          backgroundColor: addHslAlpha(theme[9], 0.1),
          borderRadius: "100%",
          position: "relative",
          overflow: "hidden",
        },
      ]}
    >
      <AnimatedLinearGradient />
    </View>
  );
}

