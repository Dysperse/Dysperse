import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { LinearGradient } from "expo-linear-gradient";
import { Platform, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function ContentWrapper(props) {
  const theme = useColorTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  return (
    <View
      style={{
        marginTop: insets.top + 64,
        backgroundColor: theme[1],
        borderTopLeftRadius: width > 600 ? 20 : 0,
        flex: 1,
        overflow: "scroll",
      }}
      {...props}
    >
      {Platform.OS !== "ios" && (
        <LinearGradient
          colors={[addHslAlpha(theme[1], 0.5), "transparent"]}
          style={{ height: 20, marginBottom: -20, zIndex: 9 }}
        />
      )}
      {props.children}
    </View>
  );
}
